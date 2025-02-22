require File.expand_path('../../../pegasus/src/env', __FILE__)
require 'retryable'
require 'cdo/poste'
require 'honeybadger/ruby'
require 'base64'
require 'nokogiri'
require src_dir 'forms'
require src_dir 'abort_email_error'

if CDO.newrelic_logging
  require 'newrelic_rpm'
end

BATCH_SIZE = 500_000
MAX_THREAD_COUNT = 50
MIN_MESSAGES_PER_THREAD = 50

SMTP_OPTIONS = {
  address: CDO.poste_smtp_server,
  port: 587,
  domain: 'code.org',
  user_name: CDO.poste_smtp_user,
  password: CDO.poste_smtp_password,
  authentication: 'plain',
  enable_starttls_auto: true,
}.freeze
#SMTP_OPTIONS = {
#  address:'localhost',
#  port:1025,
#  domain:'code.org',
#}

class DeliverPosteMessagesProcess
  def self.main
    started_at = Time.now

    queue = message_queue

    worker_count = (queue.length / MIN_MESSAGES_PER_THREAD).clamp(1, MAX_THREAD_COUNT)

    workers = create_threads(worker_count) do
      deliverer = Deliverer.new SMTP_OPTIONS

      until queue.empty?
        delivery = begin
          queue.pop(true)
        rescue
          nil
        end
        next unless delivery

        sent_at = DateTime.now

        begin
          deliverer.send delivery
        rescue Net::SMTPSyntaxError, Net::SMTPFatalError => exception
          Honeybadger.notify(
            exception,
            error_message: "Unable to deliver #{delivery[:id]} because '#{exception.message.to_s.strip}'",
            context: {
              delivery: {
                id: delivery[:id],
              }
            }
          )
          deliverer.reset_connection
          sent_at = 0
        rescue AbortEmailError, Psych::SyntaxError => exception
          Honeybadger.notify(
            exception,
            error_message: "Abandoning delivery of #{delivery[:id]} because '#{exception.message.to_s.strip}'",
            context: {
              delivery: {
                id: delivery[:id],
              }
            }
          )
          sent_at = 0
        rescue => exception
          Honeybadger.notify(
            exception,
            error_message: "Unable to deliver #{delivery[:id]} because '#{exception.message.to_s.strip}'",
            context: {
              delivery: {
                id: delivery[:id],
              }
            },
            sync: true,
            )
          raise
        end

        if Poste.dashboard_student?(delivery[:hashed_email])
          # We clear the email here for privacy. Note that (given architecture)
          # it has to be persisted for a short while to actually send the email.
          POSTE_DB[:poste_deliveries].where(id: delivery[:id]).
            update(sent_at: sent_at, contact_email: '')
        else
          POSTE_DB[:poste_deliveries].where(id: delivery[:id]).
            update(sent_at: sent_at)
        end
      end
    end
    workers.each(&:join)

    if CDO.newrelic_logging
      # How many emails we sent on _this run_ of the cronjob
      sent_count = POSTE_DB[:poste_deliveries].where(Sequel.lit('sent_at >= ?', started_at)).count
      NewRelic::Agent.record_metric("Custom/Poste/Sent", sent_count)

      # How many total abandoned emails we have
      abandon_count = POSTE_DB[:poste_deliveries].where(sent_at: 0).count
      NewRelic::Agent.record_metric("Custom/Poste/Abandoned", abandon_count)

      # How many emails are still queued for send on subsequent runs
      remaining_count = POSTE_DB[:poste_deliveries].where(sent_at: nil).count
      NewRelic::Agent.record_metric("Custom/Poste/Queued", remaining_count)
    end
  end

  def self.message_queue
    Queue.new.tap do |results|
      POSTE_DB[:poste_deliveries].where(sent_at: nil).limit(BATCH_SIZE).reverse_order(:id).each {|i| results << i}
    end
  end

  def self.create_threads(count, &block)
    [].tap do |threads|
      count.times do
        threads << Thread.new(&block)
      end
    end
  end
end
