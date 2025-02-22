require 'test_helper'

class Lti::V1::AccountLinkingControllerTest < ActionController::TestCase
  setup do
    @user = create(:teacher, email: 'test@lti.com')
    @admin = create :admin
    @lti_integration = create :lti_integration
    DCDO.stubs(:get)
  end

  test 'links an LTI login to an existing account' do
    partial_lti_teacher = create :teacher
    fake_id_token = {iss: @lti_integration.issuer, aud: @lti_integration.client_id, sub: 'foo'}
    auth_id = Services::Lti::AuthIdGenerator.new(fake_id_token).call
    ao = AuthenticationOption.new(
      authentication_id: auth_id,
      credential_type: AuthenticationOption::LTI_V1,
      email: @user.email,
    )
    target_url = "some/test/path"
    session[:user_return_to] = target_url
    partial_lti_teacher.authentication_options = [ao]
    PartialRegistration.persist_attributes session, partial_lti_teacher
    User.any_instance.stubs(:valid_password?).returns(true)

    Metrics::Events.expects(:log_event).with(
      has_entries(
        user: @user,
        event_name: 'lti_account_linked'
      )
    )
    Metrics::Events.expects(:log_event).with(
      has_entries(
        user: @user,
        event_name: 'lti_user_signin'
      )
    )
    post :link_email, params: {email: @user.email, password: 'password'}
    assert_equal I18n.t('lti.account_linking.successfully_linked'), flash[:notice]
    assert_redirected_to target_url
    assert Policies::Lti.lti?(@user)
  end

  test 'links a roster-synced LTI account to an existing account' do
    roster_synced_teacher = create :teacher
    fake_id_token = {iss: @lti_integration.issuer, aud: @lti_integration.client_id, sub: 'foo'}
    auth_id = Services::Lti::AuthIdGenerator.new(fake_id_token).call
    ao = AuthenticationOption.new(
      authentication_id: auth_id,
      credential_type: AuthenticationOption::LTI_V1,
      email: @user.email,
      )
    target_url = "some/test/path"
    session[:user_return_to] = target_url
    roster_synced_teacher.authentication_options = [ao]
    Services::Lti.create_lti_user_identity(roster_synced_teacher)
    PartialRegistration.persist_attributes session, roster_synced_teacher
    User.any_instance.stubs(:valid_password?).returns(true)

    Metrics::Events.expects(:log_event).with(
      has_entries(
        user: @user,
        event_name: 'lti_account_linked'
      )
    )
    Metrics::Events.expects(:log_event).with(
      has_entries(
        user: @user,
        event_name: 'lti_user_signin'
      )
    )
    post :link_email, params: {email: @user.email, password: 'password'}
    assert_equal I18n.t('lti.account_linking.successfully_linked'), flash[:notice]
    assert_redirected_to target_url
    assert Policies::Lti.lti?(@user)
  end

  test 'disallow account linking for admin users' do
    partial_lti_teacher = create :teacher
    fake_id_token = {iss: @lti_integration.issuer, aud: @lti_integration.client_id, sub: 'bar'}
    auth_id = Services::Lti::AuthIdGenerator.new(fake_id_token).call
    ao = AuthenticationOption.new(
      authentication_id: auth_id,
      credential_type: AuthenticationOption::LTI_V1,
      email: @admin.email,
    )
    partial_lti_teacher.authentication_options = [ao]
    PartialRegistration.persist_attributes session, partial_lti_teacher
    User.any_instance.stubs(:valid_password?).returns(true)

    post :link_email, params: {email: @admin.email, password: 'password', lti_provider: 'test-provider', lms_name: 'test-lms'}
    assert_equal I18n.t('lti.account_linking.admin_not_allowed'), flash[:alert]
    assert_redirected_to user_session_path(lti_provider: 'test-provider', lms_name: 'test-lms')
  end

  test 'fails if the password is wrong' do
    PartialRegistration.stubs(:in_progress?).returns(true)
    Services::Lti::AccountLinker.expects(:call).never
    post :link_email, params: {email: @user.email, password: 'password'}
  end

  test 'returns bad request if not logged in' do
    post :new_account

    assert_response :bad_request
  end

  test 'opts out of lms landing for a signed in user' do
    lti_user = create :student
    sign_in lti_user

    post :new_account

    lti_user.reload

    assert_equal true, lti_user.lms_landing_opted_out
  end

  test 'opts out of lms landing for a partial registration user' do
    lti_user = create :student
    PartialRegistration.persist_attributes(session, lti_user)

    post :new_account

    partial_user = User.new_with_session(ActionController::Parameters.new, session)

    assert_equal true, partial_user.lms_landing_opted_out
  end

  test 'verifies roster-synced teacher if they are not already verified' do
    lti_user = create :teacher
    sign_in lti_user

    post :new_account

    lti_user.reload

    assert lti_user.verified_teacher?
  end

  test 'do not verify roster-synced student' do
    lti_user = create :student
    sign_in lti_user

    post :new_account

    lti_user.reload

    refute lti_user.verified_teacher?
  end

  describe '#unlink' do
    let(:user) {create :teacher}
    let(:auth_option) {create :lti_authentication_option, user: user}

    context 'valid request' do
      it 'calls the AccountUnlinker service and returns 200' do
        sign_in user
        Services::Lti::AccountUnlinker.expects(:call).with(user: user, auth_option: auth_option).once
        post :unlink, params: {authentication_option_id: auth_option.id}
        assert_response :ok
      end
    end

    context 'when logged out' do
      it 'redirects to sign in page' do
        post :unlink, params: {authentication_option_id: 'fake-id'}
        assert_redirected_to new_user_session_path
      end
    end

    context 'when auth option not found' do
      it 'returns 404' do
        sign_in user
        post :unlink, params: {authentication_option_id: 'fake-id'}
        assert_response :not_found
      end
    end

    context 'when caller does not own the auth option' do
      let(:non_owned_auth_option) {create :lti_authentication_option}

      it 'returns 404' do
        sign_in user
        post :unlink, params: {authentication_option_id: non_owned_auth_option.id}
        assert_response :not_found
      end
    end

    context 'when nil input' do
      it 'returns 404' do
        sign_in user
        post :unlink
        assert_response :not_found
      end
    end
  end
end
