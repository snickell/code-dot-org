require 'cdo/http_cache'

# Monkeypatch Sprockets::Server to add headers to assets
# Required to use SharedArrayBuffer, see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer#security_requirements
module Sprockets
  module Server
    alias_method :original_headers, :headers

    def headers(env, asset, length)
      original_headers(env, asset, length).merge(
        HttpCache::ASSETS_CROSS_ORIGIN_POLICY_HEADERS,
      )
    end
  end
end
