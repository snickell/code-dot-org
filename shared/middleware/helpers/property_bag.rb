#
# PropertyBag
#
class PropertyBag

  class NotFound < Sinatra::NotFound
  end

  def initialize(channel_id, storage_id)
    channel_owner, @channel_id = storage_decrypt_channel_id(channel_id) # TODO(if/when needed): Ensure this is a registered channel?
    @storage_id = storage_id

    @table = PEGASUS_DB[:app_properties]
  end

  def items()
    @items ||= @table.where(app_id:@channel_id, storage_id:@storage_id)
  end

  def delete(name)
    delete_count = items.where(name:name).delete
    raise NotFound, "property `#{name}` not found" unless delete_count > 0
    true
  end

  def get(name)
    row = items.where(name:name).first
    raise NotFound, "property `#{name}` not found" unless row
    PropertyBag.parse_value(row[:value])
  end

  def set(name, value, ip_address)
    row = {
      app_id:@channel_id,
      storage_id:@storage_id,
      name:name,
      value:value.to_json,
      updated_at:DateTime.now,
      updated_ip:ip_address,
    }

    update_count = items.where(name:name).update(row)
    if update_count == 0
      row[:id] = @table.insert(row)
    end

    JSON.load(row[:value])
  end

  def to_hash()
    {}.tap do |results|
      items.each do |row|
        results[row[:name]] = PropertyBag.parse_value(row[:value])
      end
    end
  end

  def self.parse_value(str)
    # safely parse a string, number or boolean encoded as a JSON value.
    JSON.parse("{\"value\":#{str}}")['value']
  end
end

class DynamoPropertyBag

  class NotFound < Sinatra::NotFound
  end

  def initialize(channel_id, storage_id)
    channel_owner, @channel_id = storage_decrypt_channel_id(channel_id)
    @storage_id = storage_id

    @hash = "#{@channel_id}:#{storage_id}"
  end

  def db
    @@dynamo_db ||= Aws::DynamoDB::Client.new(
      region: 'us-east-1',
      access_key_id: CDO.s3_access_key_id, 
      secret_access_key: CDO.s3_secret_access_key, 
    )
  end

  def delete(name)
    begin
      db.delete_item(
        table_name:CDO.dynamo_properties_table,
        key:{'hash'=>@hash,name:name},
        expected:name_exists(name),
      )
    rescue Aws::DynamoDB::Errors::ConditionalCheckFailedException
      raise NotFound, "key '#{name}' not found"
    end
    true
  end

  def get(name)
    item = db.get_item(
      table_name:CDO.dynamo_properties_table,
      key:{'hash'=>@hash, 'name'=>name},
    ).item

    raise NotFound, "key '#{name}' not found" unless item
    JSON.load(item['value'])
  end

  def set(name, value, ip_address)
    db.put_item(
      table_name:CDO.dynamo_properties_table,
      item:{
        hash:@hash,
        name:name,
        updated_at:DateTime.now.to_s,
        updated_ip:ip_address,
        value:value.to_json,
      },
    )
    value
  end

  def to_hash()
    last_evaluated_key = nil
    
    results = {}
    begin
      page = db.query(
        table_name:CDO.dynamo_properties_table,
        key_conditions: {
          "hash" => {
            attribute_value_list: [@hash],
            comparison_operator: "EQ",
          },
        },
        attributes_to_get:['name', 'value'],
        exclusive_start_key:last_evaluated_key,
      ).first

      page[:items].each do |item|
        results[item['name']] = JSON.load(item['value'])
      end

      last_evaluated_key = page[:last_evaluated_key]
    end while last_evaluated_key
    results
  end

 
  def name_exists(id)
    { "name" => { value:id, comparison_operator:'EQ', } }
  end

end

