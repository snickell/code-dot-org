#!/usr/bin/env ruby

require 'optparse'

$options = {}
OptionParser.new do |opts|
  opts.banner = "Usage: export_unit_progress.rb [options]"
  opts.on("-u", "--unit UNIT", "Unit name") do |unit|
    $options[:unit] = unit
  end
end.parse!

# raise "Unit name is required" unless $options[:unit]

require_relative '../../deployment'
require_relative '../../lib/cdo/redshift'
# require_relative '../../lib/cdo/db'

# start_time = Time.now
# puts "Loading Rails environment..."
# require_relative '../../dashboard/config/environment'
# puts "Rails environment loaded in: #{(Time.now - start_time).to_i} seconds"

def execute_redshift_query(client, query)
  # start_time = Time.now
  result = client.exec(query)
  # puts "Query executed in: #{(Time.now - start_time).round(2)} seconds"
  result
rescue => exception
  puts "Error executing Redshift query: #{exception.message}\n#{exception.backtrace.join("\n")}"
  raise
end

def test_redshift
  client = RedshiftClient.instance
  query = "SELECT count(*) FROM dashboard_production.user_levels"
  results = execute_redshift_query(client, query)
  results.each do |row|
    puts row
  end
end

def get_user_level_data
  DASHBOARD_REPORTING_DB_READER[:user_levels].
    left_join(:levels, Sequel[:user_levels][:level_id] => Sequel[:levels][:id]).
    left_join(:scripts, Sequel[:user_levels][:script_id] => Sequel[:scripts][:id]).
    # must limit id range to run efficiently in production
    # .where { (Sequel[:user_levels][:id] > 5551913388) & (Sequel[:user_levels][:id] < 5552913388) }
    where(Sequel[:scripts][:name] => 'csd3-2023', Sequel[:levels][:type] => 'gamelab').
    select(
      Sequel[:user_levels][:user_id],
      Sequel[:user_levels][:script_id],
      Sequel[:user_levels][:level_id]
    ).
    limit(1).
    first
end

def get_project_main_json(user_id, level_id, script_id)
  user_storage_id = storage_id_for_user_id(user_id)
  return unless user_storage_id

  level = Level.find(level_id)
  return unless level

  # takes project-backed levels into account
  channel_token = ChannelToken.find_channel_token(level, user_storage_id, script_id)
  return unless channel_token

  source_data = SourceBucket.new.get(channel_token.channel, "main.json")
  return unless source_data && source_data[:body] && source_data[:body].respond_to?(:string)

  source_data[:body].string
end

def main
  filename = File.expand_path('csd3_including_contained_levels_for_stanford.sql', __dir__)
  query = File.read(filename)
  client = RedshiftClient.instance
  results = execute_redshift_query(client, query)
  results.each do |row|
    puts row
  end
end

main
