require 'cdo/chat_client'
require 'delayed/command'

module Cdo
  module DelayedJob
    def self.process_finished?(pid)
      Process.wait(pid, Process::WNOHANG).nil?
    rescue
      true
    end

    def self.kill(signal, pid)
      puts("\tsending #{signal} to delayed_job worker, pid=#{pid}")
      Process.kill(signal, pid)
    rescue Errno::ESRCH
    end

    # Gently stops a list of pids by sending TERM first, waiting
    # timeout_s for them to exit gracefully, and then sending KILL
    def self.stop_workers(pids, timeout_s: 30)
      ChatClient.log "delayed_job: stopping #{pids.size} workers"

      # Send a TERM to each pid, which tells them to finish the current job and exit
      pids.each {|pid| kill('TERM', pid)}

      # Wait timeout_s for the processes to exit gracefully
      Timeout.timeout(timeout_s) do
        sleep 1 until pids.all? {|pid| process_finished?(pid)}
      end
    rescue Timeout::Error
      puts "Timeout reached. Not all processes terminated within #{timeout_seconds} seconds."
      # Send a kill to any remaining processes, which stops them immediately
      pids_still_running = pids.reject {|pid| process_finished?(pid)}
      pids_still_running.each {|pid| kill('KILL', pid)}
    end

    # Stops half the delayed_job workers first, starts replacements, then replaces
    # the remaining 50%. This keeps us from ever having 0 workers running.
    def self.rolling_deploy_workers(n_workers_to_start)
      pid = fork do
        # pre-cache Rails environment so each `delayed_job` worker command invocation
        # doesn't take N minutes on production.
        before_worker_fork
        _rolling_deploy_workers(n_workers_to_start)
      end
      Process.wait(pid)
    end

    def self._rolling_deploy_workers(n_workers_to_start)
      # The goal here is to do a rolling restart of workers. `delayed_job` does not
      # support this, but we've hacked it in. delayed_job numbers workers 0 through N.
      # First, we'll stop workers 0 through N/2, then start N/2 new workers. Then we'll
      # stop the remaining workers, and start the remaining new workers.

      # Get all PIDs, sort numerically by delayed_job ID (0-N)
      pids = Dir["#{pid_dir}/delayed_job.*.pid"].
              sort_by {|file| file[/\d+/].to_i}.
              map {|file| File.read(file).to_i}

      ChatClient.log("delayed_job: rolling deploy of #{n_workers_to_start} workers, replacing #{pids.size} existing workers")

      # Phase 1: stop the first 50% of existing workers
      n_pids_to_stop = pids.empty? ? 0 : pids.size / 2
      first_half_of_pids = pids.first(n_pids_to_stop)
      stop_workers(first_half_of_pids)

      # Phase 2: start the same number of new workers
      n_workers_started = n_pids_to_stop
      start_n_workers(n_workers_started, initial_worker_index: 0)

      # Phase 3: stop the remaining worker pids
      second_half_of_pids = pids - first_half_of_pids
      stop_workers(second_half_of_pids)

      # Phase 4: start remaining new workers
      # PROBLEM: this will replace the workers that were just started, not add new ones
      start_n_workers(n_workers_to_start - n_workers_started, initial_worker_index: n_workers_started)

      ChatClient.log("delayed_job: rolling deploy done, started #{n_workers_to_start} workers")
    end

    def self.pid_dir
      dashboard_dir('tmp/pids')
    end

    def self.log_dir
      dashboard_dir('log')
    end

    # run bin/delayed_job by forking our custom Cdo::DelayedJob::Command subclass
    def self.start_n_workers(n_workers, initial_worker_index:)
      ChatClient.log("delayed_job: starting #{n_workers} workers, initial_worker_index=#{initial_worker_index}")
      pid = fork do
        Cdo::DelayedJob::Command.new.start_n_workers(n_workers, initial_worker_index: initial_worker_index)
      end
      Process.wait(pid) # wait for the workers to start
    end

    # Load rails environment into memory before forking workers so
    # that they share all this memory and don't have to reload it.
    def self.before_worker_fork
      require dashboard_dir('config', 'environment')
      Delayed::Worker.before_fork
    end

    # Subclass Delayed::Command from delayed_job/command and monkeypatch it
    # to allow us to specify the initial worker index when spawning =
    # new delayed_job.N workers. This allows us to start workers in multiple
    # batches.
    #
    # By calling before_worker_fork before forking the command processes
    # our multiple batches even share memory.
    class Command < Delayed::Command
      def initialize
        @options = {
          :quiet => true,
          :pid_dir => Cdo::DelayedJob.pid_dir,
          :log_dir => Cdo::DelayedJob.log_dir,
        }
        @args = ["start"]
      end

      def start_n_workers(n_workers, initial_worker_index: 0)
        Cdo::DelayedJob.before_worker_fork
        n_workers.times do |worker_index|
          process_name = "delayed_job.#{worker_index + initial_worker_index}"
          puts "\tstarting delayed_job worker: #{process_name}"
          run_process(process_name, @options)
        end
      end
    end
  end
end
