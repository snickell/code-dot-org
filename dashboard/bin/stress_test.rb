#!/usr/bin/env ruby

require_relative '../config/environment'

N_WORKERS = 50
SLEEP_TIME = 0.1

def stress_test(sleep_time: 1, n_workers: 50)
  # Clear the queue
  Delayed::Job.delete_all

  desired_batch_time = 5.seconds
  expected_jobs_per_s = n_workers / sleep_time.to_f
  # calculate batch size to achieve desired jobs per second
  target_batch_size = (desired_batch_time * expected_jobs_per_s).to_i
  
  # We want a batch size that's larger than target_batch_size, and evenly divisible by n_workers so each worker is used equally in each batch
  batch_size = (target_batch_size.to_f / n_workers).ceil * n_workers

  timeout = desired_batch_time * 5
  puts "Starting stress test with batch size #{batch_size}, sleep time #{sleep_time}, n_workers: #{n_workers}, timeout #{timeout}s, expected jobs per second #{expected_jobs_per_s}"

  loop do
    puts "Starting batch of #{batch_size}"
    start_time = Time.now

    batch_size.times { StressTestJob.perform_later(sleep_time) }

    Timeout.timeout(timeout) do
      until Delayed::Job.count.zero?
        sleep(0.01)
      end
      end_time = Time.now
      duration = end_time - start_time
      jobs_per_second = batch_size / duration
      puts "batch of #{batch_size} completed. actual duration: #{duration.round(2)}s, expected duration: #{desired_batch_time}s" 
      puts "Job Rate, actual: #{jobs_per_second.round(2)} jobs/s, expected: #{expected_jobs_per_s}"
    end
  rescue Timeout::Error
    puts "Batch failed: timed out waiting for jobs to complete, job count = #{Delayed::Job.count}"
    puts Delayed::Job.where(queue: 'default') #.pluck(:id, :locked_at, :failed_at, :last_error)
    Delayed::Job.delete_all
  ensure
    puts
    puts
  end
end

stress_test(sleep_time: 5, n_workers: 50)
stress_test(sleep_time: SLEEP_TIME, n_workers: N_WORKERS)
