require_relative '../../../shared/helper_spec'

file_exist '/usr/local/bin/ruby'
cmd 'ruby -v', '3.4.1'
cmd 'gem -v', '3.6.2'
cmd 'bundler -v', '2.6.2'
