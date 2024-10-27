require 'open3'
require 'timeout'

# Starts the Sauce Connect Proxy

module Cdo
  module SC
    # How many seconds to wait for the "you may start your tests" message
    SC_START_TIMEOUT_S = 120
    SC_START_MESSAGE = "you may start your tests"
    SC_LOG_PREFIX = "Sauce Connect Proxy"

    @sc_thread = nil

    class << self
      # Starts the Sauce Connect Proxy, which allows tunneling connections from our local server to Sauce Labs
      # This method blocks until the "you may start your tests" message is printed to stdout
      # then streams output in the background
      #
      # @param [Boolean] detatch - if true, sc will continue running in the bg when this process exits
      def start_sc(detatch: false)
        cmd = [
          "sc", "run",
          "-u", CDO.saucelabs_username,
          "-k", CDO.saucelabs_authkey,
          "--region", "us-west-1",
          "--tunnel-domains", ".*\\.code.org,.*\\.csedweek.org,.*\\.hourofcode.com,.*\\.codeprojects.org",
          "--tunnel-name", CDO.saucelabs_tunnel_name
        ]
        stdin, stdout_and_stderr, @sc_thread = Open3.popen2e(*cmd)
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

        puts "#{SC_LOG_PREFIX}: starting sc, pid=#{@sc_thread.pid}"

        # Block waiting for `sc` to print "you may start your tests"
        if tests_started?(stdout_and_stderr)
          puts "#{SC_LOG_PREFIX} SUCCESS: started sc: 'you may start your tests'"
          if detatch
            # Detatch from the process so it keeps running when this process exits
            puts "detatching"
            stdout_and_stderr.close
            Process.detach(@sc_thread.pid)
            puts "detatched"
          else
            # output stdout_and_stderr in the background:
            Thread.new {stdout_and_stderr.each_line {|line| puts "#{SC_LOG_PREFIX}: #{line}"}}
          end
        else
          @sc_thread.join
          # output any remaining stdout_and_stderr:
          stdout_and_stderr.each_line {|line| puts "#{SC_LOG_PREFIX}: #{line}"}
          puts "#{SC_LOG_PREFIX} ERROR: couldn't start sc"
        end
      end

      private def tests_started?(stdout)
        Timeout.timeout(SC_START_TIMEOUT_S) do
          stdout.each_line do |line|
            puts "#{SC_LOG_PREFIX}: #{line}"
            if line.strip.end_with?(SC_START_MESSAGE)
              return true
            end
          end
        end
        return false
      rescue Timeout::Error
        puts "#{SC_LOG_PREFIX} ERROR: timed out waiting #{SC_START_TIMEOUT_S} seconds for '#{SC_START_MESSAGE}', stopping sc"
        Process.kill("TERM", @sc_thread&.pid)
        return false
      end
    end
  end
end
