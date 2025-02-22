require 'test_helper'

class AichatRequestsControllerTest < ActionController::TestCase
  self.use_transactional_test_case = true

  setup_all do
    @authorized_teacher1 = create :authorized_teacher
    unit_group = create :unit_group, name: 'exploring-gen-ai-2024'
    section = create :section, user: @authorized_teacher1, unit_group: unit_group
    @authorized_student1 = create(:follower, section: section).student_user

    @level = create(:level)
    @script = create(:script)

    @default_model_customizations = {temperature: 0.5, retrievalContexts: ["test"], systemPrompt: "test"}.stringify_keys
    @default_aichat_context = {
      currentLevelId: @level.id,
      scriptId: @script.id,
      channelId: "test"
    }

    @common_params = {
      storedMessages: [],
      aichatModelCustomizations: @default_model_customizations,
      aichatContext: @default_aichat_context
    }

    valid_student1_chat_message1 = {role: 'user', chatMessageText: 'hello from authorized student 1 - message 1', status: 'ok', timestamp: Time.now.to_i}
    @valid_params_chat_completion = @common_params.merge(newMessage: valid_student1_chat_message1)

    @missing_stored_messages_params = @common_params.except(:storedMessages)
  end

  setup do
    @controller.stubs(:storage_decrypt_channel_id).returns([123, @project_id])
  end

  users = [:student, :teacher]
  [
    :start_chat_completion,
    [:chat_request, :get, {id: 1}]
  ].each do |action, method = :post, params = {}|
    users.each do |user|
      test_user_gets_response_for action,
        name: "#{user}_no_access_#{action}_test",
        user: user,
        method: method,
        params: params,
        response: :forbidden
    end
  end

  # start_chat_completion tests
  test 'authorized teacher has access to start_chat_completion test' do
    sign_in(@authorized_teacher1)
    post :start_chat_completion, params: @valid_params_chat_completion, as: :json
    assert_response :success
  end

  test 'student of authorized teacher has access to start_chat_completion test' do
    sign_in(@authorized_student1)
    post :start_chat_completion, params: @valid_params_chat_completion, as: :json
    assert_response :success
  end

  test 'Bad request if required params are not included for start_chat_completion' do
    sign_in(@authorized_teacher1)
    post :start_chat_completion, params: {newMessage: "hello"}, as: :json
    assert_response :bad_request
  end

  test 'Bad request if storedMessages param is not included for start_chat_completion' do
    sign_in(@authorized_teacher1)
    post :start_chat_completion, params: @missing_stored_messages_params, as: :json
    assert_response :bad_request
  end

  test 'start_chat_completion creates new request and returns correct parameters' do
    AichatRequestChatCompletionJob.stubs(:perform_later)

    sign_in(@authorized_teacher1)
    post :start_chat_completion, params: @valid_params_chat_completion, as: :json
    assert_response :success

    assert_equal json_response.keys, ['requestId', 'pollingIntervalMs', 'backoffRate']
    assert_equal json_response['pollingIntervalMs'], 1000
    assert_equal json_response['backoffRate'], 1.2

    # Verify the created AichatRequest
    request_id = json_response['requestId']
    request = AichatRequest.find(request_id)
    assert request.present?
    assert_equal request.user_id, @authorized_teacher1.id
    assert_equal request.level_id, @level.id
    assert_equal request.script_id, @script.id
    assert_equal request.project_id, @project_id
    assert_equal request.model_customizations, @default_model_customizations
    assert_equal request.stored_messages, []
    assert_equal request.new_message, @valid_params_chat_completion[:newMessage].stringify_keys
    assert_equal request.execution_status, SharedConstants::AI_REQUEST_EXECUTION_STATUS[:NOT_STARTED]
  end

  test 'start_chat_completion returns too many requests when request is throttled' do
    Cdo::Throttle.stubs(:throttle).returns(true)
    sign_in(@authorized_teacher1)
    post :start_chat_completion, params: @valid_params_chat_completion, as: :json
    assert_response :too_many_requests
  end

  test 'can_request_aichat_chat_completion returns false when DCDO flag is set to `false`' do
    DCDO.stubs(:get).with('aichat_chat_completion', true).returns(false)
    assert_equal false, AichatSagemakerHelper.can_request_aichat_chat_completion?
  end

  test 'returns forbidden when DCDO flag is set to `false`' do
    AichatSagemakerHelper.stubs(:can_request_aichat_chat_completion?).returns(false)
    sign_in(@authorized_teacher1)
    post :start_chat_completion, params: @valid_params_chat_completion, as: :json
    assert_response :forbidden
  end

  # chat_request tests
  test 'GET chat_request returns not found if request does not exist' do
    sign_in(@authorized_student1)
    get :chat_request, params: {id: 100}, as: :json
    assert_response :not_found
  end

  test 'GET chat_request returns forbidden if user is not the requester' do
    sign_in(@authorized_teacher1)
    request = create(:aichat_request, user: @authorized_student1)
    get :chat_request, params: {id: request.id}, as: :json
    assert_response :forbidden
  end

  test 'GET chat_request returns request status and response' do
    response = "AI model response"
    execution_status = SharedConstants::AI_REQUEST_EXECUTION_STATUS[:SUCCESS]

    sign_in(@authorized_teacher1)
    request = create(:aichat_request, user: @authorized_teacher1, response: response, execution_status: execution_status)
    get :chat_request, params: {id: request.id}, as: :json

    assert_response :success
    assert_equal json_response.keys, ['executionStatus', 'response']
    assert_equal json_response['executionStatus'], execution_status
    assert_equal json_response['response'], response
  end
end
