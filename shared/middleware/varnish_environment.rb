require 'sinatra/base'

require 'cdo/i18n'
require 'cdo/shared_constants'
require 'cdo/rack/global_edition'
require 'helpers/cookies'

class VarnishEnvironment < Sinatra::Base
  LOCALE_PARAM_KEY = 'set_locale'.freeze

  def self.load_supported_locales
    ::Cdo::I18n.available_languages.map(&:locale_s).map(&:downcase).sort
  end

  configure do
    set :locales_supported, load_supported_locales
  end

  before do
    env['cdo.locale'] = param_locale || varnish_locale || cookie_locale || default_locale
  end

  after do
    if param_locale
      set_locale_cookie(param_locale)

      redirect_uri = URI(request.path)
      redirect_params = request.params.except(LOCALE_PARAM_KEY)
      redirect_params[Rack::GlobalEdition::REGION_KEY] = param_ge_region unless param_ge_region == request.ge_region
      redirect_uri.query = URI.encode_www_form(redirect_params).presence

      response.redirect(redirect_uri.to_s)
    end
  end

  helpers do
    include Middleware::Helpers::Cookies

    def varnish_locale
      language_to_locale(request.env['HTTP_X_VARNISH_ACCEPT_LANGUAGE'])
    end

    def cookie_locale
      language_to_locale(locale_cookie)
    end

    def param_locale
      return @param_locale if defined? @param_locale
      @param_locale ||= language_to_locale(request.params[LOCALE_PARAM_KEY]&.split('|')&.first)
    end

    def param_ge_region
      return @param_ge_region if defined? @param_ge_region
      @param_ge_region = request.params[LOCALE_PARAM_KEY]&.split('|')&.second
    end

    def default_locale
      ::SharedConstants::DEFAULT_LOCALE
    end

    def language_to_locale(language)
      case language
      when 'en'
        return 'en-US'
      when 'es'
        return 'es-ES'
      when 'fa'
        return 'fa-IR'
      else
        language = language.to_s.downcase
        return nil unless locale = settings.locales_supported.find {|i| i == language || i.split('-').first == language}
        parts = locale.split('-')
        return "#{parts[0].downcase}-#{parts[1].upcase}"
      end
    end
  end
end
