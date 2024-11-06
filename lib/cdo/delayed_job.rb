module Cdo
  module DelayedJob
    def self.process_finished?(pid)
      Process.wait(pid, Process::WNOHANG).nil?
    rescue
      true
    end

    def self.kill(signal, pid)
      Process.kill(signal, pid)
    rescue Errno::ESRCH
    end

    # Gently stops a list of pids by sending TERM first, waiting
    # timeout_s for them to exit gracefully, and then sending KILL
    def self.stop_workers(pids, timeout_s: 30)
      # Send a TERM to each pid, which tells them to finish the current job and exit
      pids.each {|pid| kill('TERM', pid)}

      # Wait timeout_s for the processes to exit gracefully
      Timeout.timeout(timeout_s) do
        sleep 1 until pids.all? {|pid| process_finished?(pid)}
      end

      # Send a kill to any remaining processes, which stops them immediately
      pids.each {|pid| kill('KILL', pid)}
    rescue Timeout::Error
      puts "Timeout reached. Not all processes terminated within #{timeout_seconds} seconds."
    end

    def self.delayed_job(*arguments)
      Dir.chdir(dashboard_dir) do
        RakeUtils.system 'bin/delayed_job', *arguments
      end
    end

    # Stops half the delayed_job workers first, starts replacements, then replaces
    # the remaining 50%. This keeps us from ever having 0 workers running.
    def self.rolling_deploy_workers(n_workers_to_start)
      pid_dir = dashboard_dir('tmp/pids')

      # The goal here is to do a rolling restart of workers. `delayed_job` does not
      # support this, but we've hacked it in. delayed_job numbers workers 0 through N.
      # First, we'll stop workers 0 through N/2, then start N/2 new workers. Then we'll
      # stop the remaining workers, and start the remaining new workers.

      # Get all PIDs, sort numerically by delayed_job ID (0-N)
      pids = Dir["#{pid_dir}/delayed_job.*.pid"].
              sort_by {|file| file[/\d+/].to_i}.
              map {|file| File.read(file).to_i}

      # Phase 1: stop the first 50% of existing workers
      n_pids_to_stop = pids.empty? ? 0 : pids.size / 2
      first_half_of_pids = pids.first(n_pids_to_stop)
      stop_workers(first_half_of_pids)

      # Phase 2: start the same number of new workers
      n_workers_started = n_pids_to_stop
      delayed_job '-n', n_workers_started, 'start'

      # Phase 3: stop the remaining worker pids
      second_half_of_pids = pids - first_half_of_pids
      stop_workers(second_half_of_pids)

      # Phase 4: start remaining new workers
      delayed_job '-n', n_workers_to_start - n_workers_started, 'start'
      # PROBLEM: this will replace the workers that were just started, not add new ones
    end
  end
end
