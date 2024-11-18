require 'test_helper'

class UserLevelInteractionsControllerTest < ActionController::TestCase
  include LevelsHelper
  setup do
    @student = create :student
    sign_in @student
  end

  test "create User Level Interaction with valid params" do
    @script = create(:csp_script, :with_levels)
    @level = @script.levels.first
    assert_creates(UserLevelInteraction) do
      post :create, params: {
        level_id: @level.id,
        script_id: @script.id,
        interaction: SharedConstants::USER_LEVEL_INTERACTIONS.click_help_and_tips,
      }
    end
    created_uli = UserLevelInteraction.last
    assert_equal @student.id, created_uli.user_id
    assert_equal @script.id, created_uli.script_id
    assert_equal @level.id, created_uli.level_id
    assert_equal SharedConstants::USER_LEVEL_INTERACTIONS.click_help_and_tips, created_uli.interaction
    metadata = JSON.parse(created_uli.metadata)
    assert_equal @script.properties["curriculum_umbrella"], metadata["course_offering"]
    assert_equal @script.name, metadata["unit"]
    assert_equal @level.type, metadata["level_type"]
    assert_equal @student.user_type, metadata["user_type"]
    # There isn't a project associated with this level; check these values are nil.
    assert_nil created_uli.code_version
    assert_nil metadata["project_id"]
  end

  test "create User Level Interaction for project level" do
    @script = create(:csp_script)
    @lesson = create(:lesson, :with_lesson_group, script: @script)
    @level = create(:level)
    @script_level = create :script_level, script: @lesson.script, lesson: @lesson, levels: [@level]
    @fake_ip = '127.0.0.1'
    @storage_id = create_storage_id_for_user(@student.id)
    channel_token = ChannelToken.find_or_create_channel_token(@script_level.level, @fake_ip, @storage_id, @script_level.script_id)
    @channel_id = channel_token.channel

    # Don't actually talk to S3 when running SourceBucket.new
    AWS::S3.stubs :create_client
    stub_project_source_data(@channel_id)
    _, @project_id = storage_decrypt_channel_id(@channel_id)
    @version_id = "fake-version-id"

    assert_creates(UserLevelInteraction) do
      post :create, params: {
        level_id: @level.id,
        script_id: @script.id,
        interaction: SharedConstants::USER_LEVEL_INTERACTIONS.click_help_and_tips,
      }
    end
    created_uli = UserLevelInteraction.last
    assert_equal @student.id, created_uli.user_id
    assert_equal @script.id, created_uli.script_id
    assert_equal @level.id, created_uli.level_id
    assert_equal SharedConstants::USER_LEVEL_INTERACTIONS.click_help_and_tips, created_uli.interaction
    metadata = JSON.parse(created_uli.metadata)
    assert_equal @script.properties["curriculum_umbrella"], metadata["course_offering"]
    assert_equal @script.name, metadata["unit"]
    assert_equal @level.type, metadata["level_type"]
    assert_equal @student.user_type, metadata["user_type"]
    assert_equal @fake_version_id, created_uli.code_version
    assert_equal @project_id, metadata["project_id"]
  end
end
