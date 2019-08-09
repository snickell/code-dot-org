#!/usr/bin/env ruby
require 'ipaddr'
require 'json'

# found via:
# mysql> select id from user_geos where created_at > "2017-11-17 12:25:11 -0800" limit 1;
first_id = 23_153_485

# found via:
# mysql> select id from user_geos where created_at > "2019-05-17 16:34:31 -0700" limit 1;
last_id = 40_626_687

proxy_ip_ranges = JSON.parse(File.read('lib/cdo/trusted_proxies.json'))['ranges'].map do |ip|
  IPAddr.new(ip).to_range
end

puts %(
SELECT id FROM user_geos
  WHERE (
    id >= #{first_id} AND
    id <= #{last_id}
  ) AND (
    #{proxy_ip_ranges.map do |range|
      "(INET_ATON(ip_address) BETWEEN #{range.first.to_i} AND #{range.last.to_i})"
    end.join(" OR \n    ")}
  );
)
