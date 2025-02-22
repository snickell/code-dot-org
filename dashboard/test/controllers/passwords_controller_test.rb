require 'test_helper'

class PasswordsControllerTest < ActionController::TestCase
  setup do
    @request.env["devise.mapping"] = Devise.mappings[:user]
  end

  test "new" do
    get :new
    assert_response :success
  end

  test "new allows admins" do
    sign_in create(:admin)
    get :new
    assert_response :success
  end

  test "new does not allow non-admins" do
    sign_in create(:teacher)

    get :new
    assert_response :redirect
  end

  test "create with valid email says it works" do
    create :user, email: 'anemail@email.xx'
    post :create, params: {user: {email: 'anemail@email.xx'}}

    assert_redirected_to '/users/sign_in'

    assert_equal I18n.t('password.reset_form.confirmation'), flash[:notice]
  end

  test "create with valid email includes link for admin" do
    sign_in create(:admin)
    @request.host = CDO.dashboard_hostname

    create :user, email: 'anemail@email.xx'
    post :create, params: {user: {email: 'anemail@email.xx'}}

    assert_redirected_to '/users/password/new'

    assert_includes(flash[:notice], 'Reset password link sent to user if email was used to reset. You may also send this link directly:')
    assert_includes(flash[:notice], 'http://test-studio.code.org/users/password/edit?reset_password_token=')
  end

  test "create with valid username includes link for admin" do
    sign_in create(:admin)
    @request.host = CDO.dashboard_hostname

    user = create :user
    user.update(username: "test_username")
    user.save
    post :create, params: {user: {username: "test_username"}}

    assert_redirected_to '/users/password/new'

    assert_includes(flash[:notice], 'Reset password link sent to user if email was used to reset. You may also send this link directly:')
    assert_includes(flash[:notice], 'http://test-studio.code.org/users/password/edit?reset_password_token=')
  end

  test "create with invalid email informs admin" do
    sign_in create(:admin)
    @request.host = CDO.dashboard_hostname

    post :create, params: {user: {email: 'test@email.com'}}
    assert_redirected_to '/users/password/new'
    assert_includes(flash[:alert], 'User does not have an email authentication option or does not exist')

    lti_user = create :teacher, :with_lti_auth
    post :create, params: {user: {email: lti_user.email}}
    assert_redirected_to '/users/password/new'
    assert_includes(flash[:alert], 'User does not have an email authentication option or does not exist')
  end

  test "create with invalid username informs admin" do
    sign_in create(:admin)
    @request.host = CDO.dashboard_hostname

    post :create, params: {user: {username: 'test_username'}}
    assert_redirected_to '/users/password/new'
    assert_includes(flash[:alert], 'User does not have an email authentication option or does not exist')
  end

  test "create with blank email says it doesn't work" do
    post :create, params: {user: {email: ''}}
    assert_response :success

    assert_equal ['Email is required'], assigns(:user).errors.full_messages
  end
end
