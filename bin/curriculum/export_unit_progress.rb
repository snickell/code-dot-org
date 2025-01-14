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

start_time = Time.now
puts "Loading Rails environment..."
require_relative '../../dashboard/config/environment'
puts "Rails environment loaded in: #{(Time.now - start_time).to_i} seconds"

def execute_redshift_query(client, query)
  start_time = Time.now
  result = client.exec(query)
  puts "Query executed in: #{(Time.now - start_time).round(2)} seconds"
  result
rescue => exception
  puts "Error executing Redshift query: #{exception.message}\n#{exception.backtrace.join("\n")}"
  raise
end

def get_project_source(user_id, level_id, script_id)
  user_storage_id = storage_id_for_user_id(user_id)
  return unless user_storage_id

  level = Level.find(level_id)
  return unless level

  # takes project-backed levels into account
  channel_token = ChannelToken.find_channel_token(level, user_storage_id, script_id)
  return unless channel_token

  source_data = SourceBucket.new.get(channel_token.channel, "main.json")
  return unless source_data && source_data[:body] && source_data[:body].respond_to?(:string)

  main_json = source_data[:body].string
  JSON.parse(main_json)['source']
end

def hashed_user_id(user_id)
  secret_key = CDO.properties_encryption_key
  raise "missing CDO.properties_encryption_key" unless secret_key

  # a one-way hash that cannot be reverse-engineered by guessing and
  # checking user ids without knowing the secret.
  input_data = "#{user_id}#{secret_key}"
  digest = Digest::SHA256.hexdigest(input_data)

  # truncate to 128 bits to make digest length more manageable. user ids are
  # currently 27 bits in 2025. chance of collision is 2^-75 which low enough to ignore.
  # https://en.wikipedia.org/wiki/Birthday_attack#Simple_approximation
  digest[0..31]
end

def main
  filename = File.expand_path('csd3_including_contained_levels_for_stanford.sql', __dir__)
  query = File.read(filename)
  client = RedshiftClient.instance
  results = execute_redshift_query(client, query)
  results.each do |row|
    source = get_project_source(row['user_id'], row['level_id'], row['script_id'])
    row[:source] = source

    row[:hashed_user_id] = hashed_user_id(row['user_id'])
    row.delete('user_id')

    puts JSON.pretty_generate row
  end
end

main
