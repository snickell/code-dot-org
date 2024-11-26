#!/usr/bin/env ruby

require 'optparse'

$options = {}
OptionParser.new do |opts|
  opts.banner = "Usage: export_unit_progress.rb [options]"
  opts.on("-u", "--unit UNIT", "Unit name") do |unit|
    $options[:unit] = unit
  end
end.parse!

raise "Unit name is required" unless $options[:unit]

require_relative '../../deployment'
require_relative '../../lib/cdo/redshift'

def execute_redshift_query(client, query)
  client.exec(query)
rescue => exception
  puts "Error executing Redshift query: #{exception.message}\n#{exception.backtrace.join("\n")}"
  raise
end

def main
  client = RedshiftClient.instance
  query = "SELECT id FROM dashboard_production.scripts WHERE name = '#{$options[:unit]}'"
  results = execute_redshift_query(client, query)
  results.each do |row|
    puts row
  end
end

main
