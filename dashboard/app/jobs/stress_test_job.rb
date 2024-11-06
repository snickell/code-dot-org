require 'cdo/aws/metrics'

class StressTestJob < ApplicationJob
  def perform(duration_s, *message)
    puts "starting #{job_id}"
    sleep(duration_s.seconds)
    puts "done #{job_id}"
  end
end
