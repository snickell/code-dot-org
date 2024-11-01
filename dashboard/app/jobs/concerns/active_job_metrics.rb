require 'cdo/aws/metrics'
require 'cdo/honeybadger'

module ActiveJobMetrics
  extend ActiveSupport::Concern

  METRICS_NAMESPACE = 'code-dot-org/ActiveJob'.freeze

  included do
    # Parent class callbacks are called in addition to any callbacks defined in the job subclass
    # Callback functions are executed in the following order:
    #   before_enqueue and around_enqueue(before) in any order
    #   Job is added to database or other queue store
    #   after_enqueue and around_enqueue(after) in any order
    #   before_perform and around_perform(before) in any order
    #   job is performed
    #   after_perform and around_perform(after) in any order
    # When both the Parent and Child class define the same callback, they may be called in any order.
    # Also note that jobs executed via `.perform_now` will not trigger the `enqueue` callbacks.
    # https://guides.rubyonrails.org/v6.0/active_job_basics.html#available-callbacks
    after_enqueue :report_job_count
    before_perform :report_wait_time
    after_perform :report_performance
  end

  protected def common_dimensions
    [
      {name: 'Environment', value: CDO.rack_env},
      {name: 'JobName', value: self.class.name},
    ]
  end

  def report_job_count
    # Single database query to get all counts in one go, modified for MySQL syntax
    # When updating this query, make sure to update the query in "bin/cron/report_activejob_metrics"
    job_counts = Delayed::Job.
      select(
        "COUNT(IF(failed_at IS NOT NULL, 1, NULL)) AS failed_count",
        "COUNT(IF(failed_at IS NULL AND locked_at IS NULL AND run_at <= CURRENT_TIMESTAMP, 1, NULL)) AS workable_count",
        "COUNT(IF(failed_at IS NULL, 1, NULL)) AS pending_count",
        "COUNT(IF(failed_at IS NOT NULL AND handler LIKE '%job_class: #{self.class.name}%', 1, NULL)) AS my_failed_count",
        "COUNT(IF(failed_at IS NULL AND locked_at IS NULL AND run_at <= CURRENT_TIMESTAMP AND handler LIKE '%job_class: #{self.class.name}%', 1, NULL)) AS my_workable_count",
        "COUNT(IF(failed_at IS NULL AND handler LIKE '%job_class: #{self.class.name}%', 1, NULL)) AS my_pending_count"
      ).
      take

    # Generic Metrics
    generic_metrics = [
      {
        metric_name: 'PendingJobCount',
        value: job_counts.pending_count,
        unit: 'Count',
        timestamp: Time.now,
        dimensions: [{name: 'Environment', value: CDO.rack_env}]
      },
      {
        metric_name: 'FailedJobCount',
        value: job_counts.failed_count,
        unit: 'Count',
        timestamp: Time.now,
        dimensions: [{name: 'Environment', value: CDO.rack_env}]
      },
      {
        metric_name: 'WorkableJobCount',
        value: job_counts.workable_count,
        unit: 'Count',
        timestamp: Time.now,
        dimensions: [{name: 'Environment', value: CDO.rack_env}]
      }
    ]

    # Per-job-class metrics
    per_job_class_metrics = [
      {
        metric_name: 'PendingJobCount',
        value: job_counts.my_pending_count,
        unit: 'Count',
        timestamp: Time.now,
        dimensions: common_dimensions
      },
      {
        metric_name: 'FailedJobCount',
        value: job_counts.my_failed_count,
        unit: 'Count',
        timestamp: Time.now,
        dimensions: common_dimensions
      },
      {
        metric_name: 'WorkableJobCount',
        value: job_counts.my_workable_count,
        unit: 'Count',
        timestamp: Time.now,
        dimensions: common_dimensions
      }
    ]

    # Push metrics
    Cdo::Metrics.push(METRICS_NAMESPACE, generic_metrics)
    Cdo::Metrics.push(METRICS_NAMESPACE, per_job_class_metrics)
  rescue => exception
    Honeybadger.notify(exception, error_message: 'Error reporting ActiveJob metrics')
  end

  protected def report_wait_time
    # Record the time the job started
    @perform_started_at = Time.now

    # For jobs that aren't enqueued or don't have a run_at, use now.
    @wait_started_at = Time.now
    # Use the delayed_job `run_at` field if it exists.
    @wait_started_at = Time.parse(run_at) unless run_at.nil?

    @run_at_or_started_at = Time.parse(run_at)
    wait_time = @perform_started_at - @wait_started_at

    Cdo::Metrics.push(
      METRICS_NAMESPACE, [
        {
          metric_name: 'WaitTime',
          value: wait_time,
          unit: 'Seconds',
          timestamp: Time.now,
          dimensions: common_dimensions,
        },
      ]
    )
  rescue => exception
    Honeybadger.notify(exception, error_message: 'Error reporting ActiveJob metrics')
  end

  protected def report_performance
    perform_complete_at = Time.now

    Cdo::Metrics.push(
      METRICS_NAMESPACE, [
        {
          metric_name: 'ExecutionTime',
          value: perform_complete_at - @perform_started_at,
          unit: 'Seconds',
          timestamp: Time.now,
          dimensions: common_dimensions,
        },
        {
          metric_name: 'TotalTime',
          value: perform_complete_at - @enqueued_or_started_at,
          unit: 'Seconds',
          timestamp: Time.now,
          dimensions: common_dimensions,
        },
      ]
    )
  rescue => exception
    Honeybadger.notify(exception, error_message: 'Error reporting ActiveJob metrics')
  end
end
