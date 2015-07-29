require 'sinatra/base'
require 'cdo/db'
require 'cdo/rack/request'
require 'csv'

class NetSimApi < Sinatra::Base

  helpers do
    %w{
      core.rb
      storage_id.rb
      table.rb
      null_pub_sub_api.rb
      pusher_api.rb
    }.each do |file|
      load(CDO.dir('shared', 'middleware', 'helpers', file))
    end

  end

  # For test, make it possible to override the usual configured API choice
  @@overridden_pub_sub_api = nil

  TableType = CDO.use_dynamo_tables ? DynamoTable : Table

  def get_table(shard_id, table_name)
    # Table name within channels API just concatenates shard + table
    api_table_name = "#{shard_id}_#{table_name}"
    TableType.new(CDO.netsim_api_publickey, nil, api_table_name)
  end

  # Get the Pub/Sub API interface for the current configuration
  def get_pub_sub_api
    return @@overridden_pub_sub_api unless @@overridden_pub_sub_api.nil?
    CDO.use_pusher ? PusherApi : NullPubSubApi
  end

  # Set a particular Pub/Sub API interface to use - for use in tests.
  #
  # @param [PubSubApi] override_api
  def self.override_pub_sub_api_for_test(override_api)
    @@overridden_pub_sub_api = override_api
  end

  def has_json_utf8_headers(request)
    request.content_type.to_s.split(';').first == 'application/json' and
        request.content_charset.to_s.downcase == 'utf-8'
  end

  #
  # GET /v3/netsim/<shard-id>/<table-name>
  #
  # Returns all of the rows in the table.
  #
  get %r{/v3/netsim/([^/]+)/(\w+)$} do |shard_id, table_name|
    dont_cache
    content_type :json
    get_table(shard_id, table_name).to_a.to_json
  end

  #
  # GET /v3/netsim/<shard-id>/<table-name>/<row-id>
  #
  # Returns a single row by id.
  #
  get %r{/v3/netsim/([^/]+)/(\w+)/(\d+)$} do |shard_id, table_name, id|
    dont_cache
    content_type :json
    get_table(shard_id, table_name).fetch(id.to_i).to_json
  end

  #
  # DELETE /v3/netsim/<shard-id>/<table-name>/<row-id>
  #
  # Deletes a row by id.
  #
  delete %r{/v3/netsim/([^/]+)/(\w+)/(\d+)$} do |shard_id, table_name, id|
    dont_cache
    table = get_table(shard_id, table_name)
    int_id = id.to_i

    if table_name == 'n' then
      # Cascade!
      # remove wires
      wireTable = get_table(shard_id, 'w')
      wires = wireTable.to_a().select do |wire|
        wire[:localNodeID] == int_id or wire[:remoteNodeID] == int_id
      end
      wires.each do |wire|
        wireTable.delete(wire[:id])
      end

      # remove messages
    end

    table.delete(int_id)
    get_pub_sub_api.publish(shard_id, table_name, {:action => 'delete', :id => int_id})
    no_content
  end

  #
  # POST /v3/netsim/<shard-id>/<table-name>/<row-id>/delete
  #
  # This mapping exists for older browsers that don't support the DELETE verb.
  #
  post %r{/v3/netsim/([^/]+)/(\w+)/(\d+)/delete$} do |shard_id, table_name, id|
    call(env.merge('REQUEST_METHOD'=>'DELETE', 'PATH_INFO'=>File.dirname(request.path_info)))
  end

  #
  # POST /v3/netsim/<shard-id>/<table-name>
  #
  # Insert a new row.
  #
  post %r{/v3/netsim/([^/]+)/(\w+)$} do |shard_id, table_name|
    unsupported_media_type unless has_json_utf8_headers(request)

    begin
      value = get_table(shard_id, table_name).
          insert(JSON.parse(request.body.read), request.ip)
      get_pub_sub_api.publish(shard_id, table_name, {:action => 'insert', :id => value[:id]})
    rescue JSON::ParserError
      bad_request
    end

    dont_cache
    content_type :json
    status 201
    value.to_json
  end

  #
  # PATCH (PUT, POST) /v3/netsim/<shard-id>/<table-name>/<row-id>
  #
  # Update an existing row.
  #
  post %r{/v3/netsim/([^/]+)/(\w+)/(\d+)$} do |shard_id, table_name, id|
    unsupported_media_type unless has_json_utf8_headers(request)

    begin
      table = get_table(shard_id, table_name)
      int_id = id.to_i
      value = table.update(int_id, JSON.parse(request.body.read), request.ip)
      get_pub_sub_api.publish(shard_id, table_name, {:action => 'update', :id => int_id})
    rescue JSON::ParserError
      bad_request
    end

    dont_cache
    content_type :json
    value.to_json
  end
  patch %r{/v3/netsim/([^/]+)/(\w+)/(\d+)$} do |shard_id, table_name, id|
    call(env.merge('REQUEST_METHOD'=>'POST'))
  end
  put %r{/v3/netsim/([^/]+)/(\w+)/(\d+)$} do |shard_id, table_name, id|
    call(env.merge('REQUEST_METHOD'=>'POST'))
  end

end
