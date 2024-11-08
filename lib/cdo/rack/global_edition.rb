# frozen_string_literal: true

require 'active_support/all'
require 'request_store'

require 'cdo/global_edition'
require 'helpers/cookies'

module Rack
  class GlobalEdition
    REGION_KEY = Cdo::GlobalEdition::REGION_KEY

    class RouteHandler
      include Middleware::Helpers::Cookies

      ROOT_PATH = '/global'
      # @example Matches paths like `/global/fa/home`, capturing:
      # - ge_prefix: "/global/fa"
      # - ge_region: "fa"
      # - main_path: "/home"
      PATH_PATTERN = Regexp.new <<~REGEXP.remove(/\s+/)
        ^(?<ge_prefix>
          #{ROOT_PATH}/
          (?<ge_region>#{Cdo::GlobalEdition::REGIONS.join('|')})
        )
        (?<main_path>/.*|$)
      REGEXP

      attr_reader :app, :request

      def initialize(app, request)
        @app = app
        @request = request
      end

      # @note Changes to the `request` should be made before the `response` is initialized to apply the changes.
      def call
        if request.params.key?(REGION_KEY)
          new_region = request.params[REGION_KEY].presence

          redirect_path = ::File.join('/', request_path_vars(:main_path).first || request.path)
          redirect_path = regional_path_for(new_region, redirect_path) if Cdo::GlobalEdition.region_available?(new_region)
          # Pegasus requires a predefined template for each path, unlike Dashboard, which manages paths dynamically.
          redirect_path = '/' if pegasus_route? && !pegasus_route?(redirect_path)

          redirect_uri = URI(redirect_path)
          redirect_uri.query = URI.encode_www_form(request.params.except(REGION_KEY)).presence
          redirect_path = redirect_uri.to_s

          setup_region(new_region)
          response.redirect(redirect_path)
        elsif PATH_PATTERN.match?(request.path_info)
          ge_prefix, ge_region, main_path = request_path_vars(:ge_prefix, :ge_region, :main_path)

          if dashboard_route?(main_path)
            # Strips the Global Edition path prefix (e.g., `/global/fa`) from the request path.
            # request.path == request.script_name + request.path_info
            # - `request.script_name` strips the prefix from the request path
            #   so the application processes requests as if it were running at the root level.
            # - `request.path_info` provides the specific path that should be handled by the application.
            request.script_name = ::File.join(ge_prefix, request.script_name).chomp('/')
            request.path_info = main_path
          end

          setup_region(ge_region) if region_changed?(ge_region)
        elsif Cdo::GlobalEdition.region_available?(region)
          # Redirects to the regional version of the path if it's available.
          redirect_path = regional_path_for(region, request.fullpath)
          response.redirect(redirect_path) if redirectable?(redirect_path)
        end

        response.finish
      ensure
        RequestStore.store.delete(Cdo::GlobalEdition::REGION_KEY)
      end

      private def region
        request.cookies[REGION_KEY].presence
      end

      # @note Once the `response` instance is initialized, any changes to the `request` made afterward will not be applied.
      private def response
        @response ||= begin
          RequestStore.store[Cdo::GlobalEdition::REGION_KEY] = region if Cdo::GlobalEdition.region_available?(region)
          Rack::Response[*app.call(request.env)]
        end
      end

      private def region_changed?(new_region)
        region != new_region
      end

      private def request_path_vars(*keys)
        PATH_PATTERN.match(request.path_info)&.values_at(*keys) || []
      end

      private def setup_region(region)
        # Resets the region if it's `nil` or sets it only if it's available.
        return unless region.nil? || Cdo::GlobalEdition.region_available?(region)

        # Sets the request cookies to apply changes immediately without needing to reload the page.
        request.cookies[REGION_KEY] = region

        if region
          region_locales = Cdo::GlobalEdition.region_locales(region)
          request.cookies[LOCALE_KEY] = region_locales.first unless region_locales.include?(request.cookies[LOCALE_KEY])
        end

        # Updates the global `ge_region` cookie to lock the platform to the regional version.
        set_global_cookie(REGION_KEY, region, high_priority: true)
        # Updates the global `language` cookie to enforce the switch to the regional language.
        set_locale_cookie(request.cookies[LOCALE_KEY])
      end

      private def dashboard_route?(path = request.path)
        return false unless request.hostname == CDO.dashboard_hostname
        Dashboard::Application.routes.recognize_path(path, method: request.request_method).present?
      rescue ActionController::RoutingError
        false
      end

      private def pegasus_helpers
        @pegasus_helpers ||= begin
          pegasus_app = Documents.new
          pegasus_app.helpers.setup_for(request)
          pegasus_app.helpers
        end
      end

      private def pegasus_route?(path = request.path)
        return false unless request.hostname == CDO.pegasus_hostname

        pegasus_helpers.resolve_document(path).present? || pegasus_helpers.resolve_view_template(path).present?
      rescue StandardError
        false
      end

      # Determines if the request is eligible for redirection.
      # To improve efficiency, the redirection should only affect the browser's address bar,
      # avoiding redirection for non-visible to user requests such as AJAX, non-GET, or asset requests.
      private def redirectable?(redirect_path)
        return false unless request.get? # only GET request can be redirected
        return false if request.xhr? # only non-AJAX requests should be redirected

        # Unlike in Dashboard, where any route can be dynamically changed to a regional version,
        # Pegasus requires an existing regional template.
        dashboard_route? || pegasus_route?(URI(redirect_path).path)
      end

      private def regional_path_for(region, main_path)
        ::File.join(ROOT_PATH, region, main_path)
      end
    end

    def initialize(app)
      @app = app
    end

    def call(env)
      request = Request.new(env)

      if Cdo::GlobalEdition.target_host?(request.hostname)
        RouteHandler.new(@app, request).call
      else
        @app.call(env)
      end
    end
  end
end
