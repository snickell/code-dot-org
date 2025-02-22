require 'metrics/events'

module Lti
  module V1
    class AccountLinkingController < ApplicationController
      before_action :authenticate_user!, only: %i[unlink]

      # GET /lti/v1/account_linking/landing
      def landing
        lti_provider = session.dig(:lms_landing, :lti_provider_name) || params[:lti_provider]
        new_cta_type = session.dig(:lms_landing, :new_cta_type) || params[:new_cta_type]
        user_type = session.dig(:lms_landing, :user_type) || current_user&.user_type

        if lti_provider.blank? || new_cta_type.blank? || user_type.blank?
          flash[:alert] = I18n.t('lti.account_linking.launch_from_lms')
          redirect_to root_path and return
        end
      end

      # GET /lti/v1/account_linking/finish_link
      def finish_link
        # If the user is logged in, we need to log them out. Signing them out will
        # clear the session, so we need to store cache key first, sign them out,
        # then set it again in their now empty session.
        if current_user
          partial_registration_cache_key = session[PartialRegistration::SESSION_KEY]
          sign_out current_user
          session[PartialRegistration::SESSION_KEY] = partial_registration_cache_key
        end

        redirect_to user_session_path
      end

      # POST /lti/v1/account_linking/link_email
      def link_email
        head :bad_request unless PartialRegistration.in_progress?(session)
        params.require([:email, :password])
        existing_user = User.find_by_email_or_hashed_email(params[:email])
        if existing_user&.admin?
          flash[:alert] = I18n.t('lti.account_linking.admin_not_allowed')
          redirect_to user_session_path(lti_provider: params[:lti_provider], lms_name: params[:lms_name]) and return
        end
        if existing_user&.valid_password?(params[:password])
          Services::Lti::AccountLinker.call(user: existing_user, session: session)
          sign_in existing_user
          metadata = {
            'user_type' => existing_user.user_type,
            'lms_name' => existing_user.lti_user_identities.first.lti_integration[:platform_name],
          }
          Metrics::Events.log_event(
            user: existing_user,
            event_name: 'lti_user_signin',
            metadata: metadata,
          )
          target_url = session[:user_return_to] || home_path
          flash[:notice] = I18n.t('lti.account_linking.successfully_linked')
          redirect_to target_url and return
        else
          flash.alert = I18n.t('lti.account_linking.invalid_credentials')
          redirect_to user_session_path(lti_provider: params[:lti_provider], lms_name: params[:lms_name]) and return
        end
      end

      # POST /lti/v1/account_linking/new_account
      def new_account
        if current_user
          current_user.lms_landing_opted_out = true
          current_user.verify_teacher! if Policies::Lti.unverified_teacher?(current_user)
          current_user.save!
        elsif PartialRegistration.in_progress?(session)
          partial_user = User.new_with_session(ActionController::Parameters.new, session)
          partial_user.lms_landing_opted_out = true
          PartialRegistration.persist_attributes(session, partial_user)
        else
          render status: :bad_request, json: {}
        end
      end

      # POST /lti/v1/account_linking/unlink
      def unlink
        ao_id = params[:authentication_option_id]
        return head :not_found if ao_id.blank?

        ao = AuthenticationOption.find_by(id: ao_id)
        return head :not_found unless ao.present? && ao.user == current_user

        Services::Lti::AccountUnlinker.call(user: current_user, auth_option: ao)
        flash.notice = I18n.t('lti.account_linking.successfully_unlinked')
        return head :ok
      end
    end
  end
end
