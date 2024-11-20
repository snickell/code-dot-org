# frozen_string_literal: true

require 'request_store'
require 'cdo'

module Cdo
  # Lazily loads global configurations for regional pages
  module GlobalEdition
    REGION_KEY = 'ge_region'

    # Retrieves a list a global region names.
    REGIONS = Dir.glob('*.yml', base: CDO.dir('config', 'global_editions')).map {|f| File.basename(f, '.yml')}.freeze

    TARGET_HOSTNAMES = Set[
      CDO.dashboard_hostname,
    ].freeze

    # @see +Rack::GlobalEdition::RouteHandler#response+
    def self.current_region
      RequestStore.store[REGION_KEY]
    end

    # Freezes an entire complex data structure
    def self.deep_freeze(data)
      if data.is_a?(Enumerable)
        data.each do |item|
          deep_freeze(item)
        end
      end

      data.freeze
    end

    # Retrieves the global configuration for the given region.
    def self.configuration_for(region)
      @@configurations ||= {}
      @@configurations[region.to_s] ||= load_config(region) || {}
    end

    # Returns the parsed configuration for the given region.
    def self.load_config(region)
      return unless region_available?(region)
      config = YAML.load_file(CDO.dir('config', 'global_editions', "#{region}.yml")) || {}
      deep_freeze(config.deep_symbolize_keys)
    end

    def self.target_host?(hostname)
      TARGET_HOSTNAMES.include?(hostname)
    end

    def self.region_available?(region)
      region.present? && REGIONS.include?(region.to_s)
    end

    def self.region_locale(region)
      configuration_for(region)[:locale]
    end 

    # Loads all default locale from config/locales.yml
    def self.load_default_locales
      root = File.expand_path(File.join('..', '..'), __dir__)
      unless defined? @@default_locales
        @@default_locales = YAML.load_file(File.join(root, "dashboard", "config", "locales.yml"))
        @@default_locales = @@default_locales.filter_map do |locale, data|
          next nil unless data.is_a? Hash
          [data['native'], locale].freeze
        end.freeze
      end
      @@default_locales
    end

    # Returns the available locales specified for a region in the form of an Array of Arrays
    # containing the native name and the locale key. ['native name', 'locale-key']
    def self.locales_for(region)
      config = configuration_for(region)
      config[:locale_options] || load_default_locales
    end
  end
end
