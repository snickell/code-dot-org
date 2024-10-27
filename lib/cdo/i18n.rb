# frozen_string_literal: true

require 'yaml'

require 'cdo/db'
require 'cdo/global_edition'

module Cdo
  module I18n
    LOCALE_CONFIGS = YAML.load_file(CDO.dir('config/i18n/locales.yml')).each do |_locale, data|
      data.symbolize_keys! if data.is_a?(Hash)
    end.freeze

    TEXT_DIRECTIONS = Set[
      TEXT_DIRECTION_LTR = 'ltr', # the left-to-right text direction
      TEXT_DIRECTION_RTL = 'rtl', # the right-to-left text direction
    ].freeze

    class << self
      # @see https://docs.google.com/spreadsheets/d/10dS5PJKRt846ol9f9L3pKh03JfZkN7UIEcwMmiGS4i0
      # @return [Array<CdoLanguage>] CDO language records for the Google doc
      def cdo_languages
        @cdo_languages ||= ::PEGASUS_DB[:cdo_languages]
      end

      # @return [Array<CdoLanguage>] available CDO language records
      def available_languages
        @available_languages ||= cdo_languages.all.filter_map do |cdo_language|
          next cdo_language if cdo_language[:supported_codeorg_b]
          # Enables languages available for debugging in all non-production environments
          cdo_language if debug_language?(cdo_language) && !CDO.rack_env?(:production)
        end
      end

      def locale_direction(locale)
        LOCALE_CONFIGS.dig(locale.to_s, :dir) || TEXT_DIRECTION_LTR
      end

      def locale_options
        @locale_options ||= available_languages.map do |cdo_language|
          locale = cdo_language[:locale_s]

          name = cdo_language[:native_name_s]
          name = "#{name} DBG" if debug_language?(cdo_language)

          [name, locale]
        end.sort_by(&:second).freeze
      end

      def locale_options_with_ge_regions
        return locale_options unless DCDO.get('global_edition_region_selection_enabled', false)

        @locale_options_with_ge_regions ||= begin
          options = locale_options.dup

          Cdo::GlobalEdition::REGIONS.excluding('en', 'root').each do |region|
            region_locale = Cdo::GlobalEdition.region_locale(region)
            language_name = Dashboard::Application::LOCALES.dig(region_locale, :native)
            options << ["#{language_name} (global)", "#{region_locale}|#{region}"] if language_name
          end

          options.sort_by(&:second).freeze
        end
      end

      def current_locale_option(locale, ge_region = nil)
        ge_region.nil? || ge_region.empty? ? locale.to_s : "#{locale}|#{ge_region}"
      end

      # @param cdo_language [CdoLanguage] CDO language record
      # @return [Boolean] whether the language is a debug language
      private def debug_language?(cdo_language)
        return false if cdo_language[:supported_codeorg_b]
        LOCALE_CONFIGS.dig(cdo_language[:locale_s], :debug)
      end
    end
  end
end
