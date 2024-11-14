require 'test_helper'

class RubricsTest < ActionDispatch::IntegrationTest
  include LevelsHelper # for build_script_level_path

  setup do
    @teacher = create :authorized_teacher
    @unit = create :script, :with_levels, lessons_count: 2, name: 'test-unit', is_course: true, family_name: 'csd', version_year: '2024'
    @script_level = @unit.script_levels.first
    create :rubric, lesson: @script_level.lesson, level: @script_level.levels.first
    @other_script_level = @unit.script_levels.last
    create :rubric, lesson: @other_script_level.lesson, level: @other_script_level.levels.first
  end

  test 'canShowTaScoresAlert is true by default' do
    sign_in @teacher
    CourseOffering.add_course_offering(@unit)

    get build_script_level_path(@script_level)
    assert_response :success
    rubric_data = JSON.parse(css_select('script[data-rubricdata]').first.attribute('data-rubricdata').to_s)
    assert rubric_data['canShowTaScoresAlert']
  end

  test 'set_seen_ta_scores sets canShowTaScoresAlert to false' do
    sign_in @teacher
    CourseOffering.add_course_offering(@unit)

    get build_script_level_path(@script_level)
    assert_response :success
    rubric_data = JSON.parse(css_select('script[data-rubricdata]').first.attribute('data-rubricdata').to_s)
    assert rubric_data['canShowTaScoresAlert']

    post '/api/v1/users/set_seen_ta_scores', params: {lesson_id: @script_level.lesson.id}
    assert_response :success

    # can no longer show alert for this lesson
    get build_script_level_path(@script_level)
    assert_response :success
    rubric_data = JSON.parse(css_select('script[data-rubricdata]').first.attribute('data-rubricdata').to_s)
    refute rubric_data['canShowTaScoresAlert']

    # can still show alert for other lessons
    refute_equal @other_script_level.lesson, @script_level.lesson
    get build_script_level_path(@other_script_level)
    assert_response :success
    rubric_data = JSON.parse(css_select('script[data-rubricdata]').first.attribute('data-rubricdata').to_s)
    assert rubric_data['canShowTaScoresAlert']
  end
end
