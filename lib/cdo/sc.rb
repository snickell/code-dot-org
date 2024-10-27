require 'open3'
require 'timeout'

# Starts the Sauce Connect Proxy

module Cdo
  module SC
    # How many seconds to wait for the "you may start your tests" message
    SC_START_TIMEOUT_S = 120
    SC_START_MESSAGE = "you may start your tests"
    SC_STDOUT_PREFIX = "Sauce Connect Proxy"

    class << self
      # Starts the Sauce Connect Proxy, which allows tunneling connections from our local server to Sauce Labs
      # This method blocks until sc prints the "you may start your tests" message to log/sc.log
      #
      # @param [Boolean] daemonize - if true, sc will continue running in the bg even when ruby exits
      def start_sc(daemonize: false)
        # Start watching for "you may start your tests" at the end of log/sc.log
        log_file = File.open(log_file_path, 'a+')

        cmd = [
          "sc", "run",
          "-u", CDO.saucelabs_username,
          "-k", CDO.saucelabs_authkey,
          "--region", "us-west-1",
          "--tunnel-domains", ".*\\.code.org,.*\\.csedweek.org,.*\\.hourofcode.com,.*\\.codeprojects.org",
          "--tunnel-name", CDO.saucelabs_tunnel_name,
        ]
        pid = Process.spawn(
          *cmd,
          out: log_file_path,
          err: log_file_path,
        )

        log "starting sc, pid = #{pid}, see log at #{log_file_path}"

        # Block waiting for `sc` to print "you may start your tests"
        tests_started, log_lines = tests_started?(log_file, pid)

        if tests_started
          log "success, sc is running"
          unless daemonize
            at_exit do
              Process.kill("TERM", pid)
            rescue Errno::ESRCH
            end
          end
          return pid
        else
          puts
          puts log_lines.join
          puts
          log "ERROR: couldn't start sc"
        end
      ensure
        log_file.close
      end

      private def sc_cmd(shell_escape: false)
      end

      private def log_file_path
        deploy_dir('log/sc.log')
      end

      private def process_exited?(pid)
        Process.waitpid(pid, Process::WNOHANG)
      end

      # Scan the log output of sc looking for the "you may start your tests" message
      # timeout if more than SC_START_TIMEOUT_S seconds pass without seeing the message
      private def tests_started?(log_file, pid)
        lines = []
        Timeout.timeout(SC_START_TIMEOUT_S) do
          # Keep reading from the end of log_file unless the process exits
          until process_exited? pid
            sleep 0.1
            while (line = log_file.gets)
              lines << line
              if line.strip.end_with?(SC_START_MESSAGE)
                return true, lines
              end
            end
          end
          lines << log_file.readlines # read any remaining lines
        end
        return false, lines
      rescue Timeout::Error
        log "ERROR: timed out waiting #{SC_START_TIMEOUT_S} seconds for '#{SC_START_MESSAGE}', stopping sc"
        begin
          Process.kill("TERM", pid) # stop sc
        rescue Errno::ESRCH
        end
        return false, lines
      end

      private def log(message)
        puts "#{SC_STDOUT_PREFIX}: #{message}"
      end
    end
  end
end
