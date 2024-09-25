module Cdo
  # Lazily loads global configurations for regional pages
  module GlobalEdition
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
      @@configurations[region] ||= load_config(region)
    end

    # Retrieves a list a global region names.
    REGIONS = Dir.glob('*.yml', base: CDO.dir('config', 'global_editions')).map {|f| File.basename(f, '.yml')}.freeze

    # Returns the parsed configuration for the given region.
    def self.load_config(region)
      raise ArgumentError, "Region #{region} is not available" unless REGIONS.include?(region.to_s)
      config = YAML.load_file(CDO.dir('config', 'global_editions', "#{region}.yml")) || {}
      deep_freeze(config.deep_symbolize_keys)
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
