require 'open3'
require 'timeout'

# Starts the Sauce Connect Proxy

module Cdo
  module SC
    # How many seconds to wait for the "you may start your tests" message
    SC_START_TIMEOUT_S = 120
    SC_START_MESSAGE = "you may start your tests"
    SC_STDOUT_PREFIX = "Sauce Connect Proxy"

    @log_file = nil

    class << self
      # Starts the Sauce Connect Proxy, which allows tunneling connections from our local server to Sauce Labs
      # This method blocks until the "you may start your tests" message is printed to stdout
      # then streams output in the background
      #
      # @param [Boolean] detatch - if true, sc will continue running in the bg when this process exits
      def start_sc(verbose: false)
        log_file_path = deploy_dir('log/sc.log')
        @log_file ||= File.open(log_file_path, 'a')

        stdin, stdout_and_stderr, process = Open3.popen2e(
          "sc", "run",
          "-u", CDO.saucelabs_username,
          "-k", CDO.saucelabs_authkey,
          "--region", "us-west-1",
          "--tunnel-domains", ".*\\.code.org,.*\\.csedweek.org,.*\\.hourofcode.com,.*\\.codeprojects.org",
          "--tunnel-name", CDO.saucelabs_tunnel_name
        )

        # stdin, stdout_and_stderr, @sc_thread = Open3.popen2e <<-SH
        #   sc run \
        #     -u #{CDO.saucelabs_username} \
        #     -k #{CDO.saucelabs_authkey} \
        #     --region us-west-1 \
        #     --tunnel-domains .*\\.code.org,.*\\.csedweek.org,.*\\.hourofcode.com,.*\\.codeprojects.org \
        #     --tunnel-name #{CDO.saucelabs_tunnel_name} \
        #     > /dev/null 2>&1
        # SH

        stdin.close

        log "starting sc, pid=#{process.pid}, log_file=#{log_file_path}", stdout: true

        # Block waiting for `sc` to print "you may start your tests"
        if tests_started?(stdout_and_stderr, process)
          log "success, sc is running", stdout: true
          # output stdout_and_stderr in the background:
          Thread.new {stdout_and_stderr.each_line {|line| log line}}
          return process
        else
          process.join
          # output any remaining stdout_and_stderr:
          stdout_and_stderr.each_line {|line| log line}
          log "ERROR: couldn't start sc", stdout: true
        end
      end

      private def tests_started?(stdout, process)
        Timeout.timeout(SC_START_TIMEOUT_S) do
          stdout.each_line do |line|
            log line
            if line.strip.end_with?(SC_START_MESSAGE)
              return true
            end
          end
        end
        return false
      rescue Timeout::Error
        log "ERROR: timed out waiting #{SC_START_TIMEOUT_S} seconds for '#{SC_START_MESSAGE}', stopping sc", stdout: true
        Process.kill("TERM", process.pid)
        return false
      end

      private def log(message, stdout: false)
        puts "#{SC_STDOUT_PREFIX}: #{message}" if stdout
        @log_file.puts message
      end
    end
  end
end
