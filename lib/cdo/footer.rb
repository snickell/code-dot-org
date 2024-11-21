require 'cdo/global_edition'

module Cdo
  class Footer
    def self.get_locale_options(options)
      ge_region = options[:ge_region] || :root
      @locale_options = Cdo::GlobalEdition.locales_for(ge_region)
    end

    def self.get_footer_contents(options)
      ge_region = options[:ge_region] || :root
      @footer_config = Cdo::GlobalEdition.configuration_for(ge_region)[:footer] || {}
    end
  end
end
