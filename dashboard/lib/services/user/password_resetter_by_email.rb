module Services
  module User
    class PasswordResetterByEmail < Services::Base
      attr_reader :email

      def initialize(email:)
        @email = email
      end

      def call
        return user if user.errors.present?

        if user.new_record?
          log_user_metric('PasswordResetUserNotFound')
          # Only send if the user has an email auth option OR if the user is unmigrated and has a password login
        elsif user.authentication_options.any?(&:email?) || user.provider.nil?
          user.raw_token = send_reset_password_instructions
        else
          log_user_metric('PasswordResetEmailAuthNotFound')
        end
        user
      end

      private def user
        return @user if defined? @user
        if email.blank?
          @user = ::User.new
          @user.errors.add :email, ::I18n.t('activerecord.errors.messages.blank')
        else
          # We are no longer sending an email to parents, so grab the first user we find
          # (a user with an Email auth option first, otherwise any user that has that email)
          @user = ::User.find_by_email_or_hashed_email(email) || ::User.new(email: email)
        end
        @user
      end

      private def send_reset_password_instructions
        raw = user.send(:set_reset_password_token)
        user.send(:send_devise_notification, :reset_password_instructions, raw, {to: email})
        log_user_metric('PasswordResetEmailSuccessful')
        raw
      rescue ArgumentError
        user.errors.add :base, I18n.t('password.reset_errors.invalid_email')
        user.send(:clear_reset_password_token)
        nil
      end

      private def log_user_metric(metric_name)
        Cdo::Metrics.put('User', metric_name, 1, {Environment: CDO.rack_env})
      end
    end
  end
end
