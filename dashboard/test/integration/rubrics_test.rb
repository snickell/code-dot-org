require 'test_helper'

class ScriptsTest < ActionDispatch::IntegrationTest
  include LevelsHelper # for build_script_level_path

  test 'set_seen_ta_scores sets canShowTaScoresAlert to false for csd level' do
    teacher = create :authorized_teacher
    sign_in teacher

    unit = create :script, :with_levels, lessons_count: 2, name: 'test-unit', is_course: true, family_name: 'csd', version_year: '2024'
    CourseOffering.add_course_offering(unit)
    script_level = unit.script_levels.first
    script_level_path = build_script_level_path(script_level)
    create :rubric, lesson: script_level.lesson, level: script_level.levels.first

    get script_level_path
    assert_response :success
    rubric_data = JSON.parse(css_select('script[data-rubricdata]').first.attribute('data-rubricdata').to_s)
    assert rubric_data['canShowTaScoresAlert']

    post '/api/v1/users/set_seen_ta_scores', params: {lesson_position: script_level.lesson.absolute_position}
    assert_response :success

    # can no longer show alert for this lesson
    get script_level_path
    assert_response :success
    rubric_data = JSON.parse(css_select('script[data-rubricdata]').first.attribute('data-rubricdata').to_s)
    refute rubric_data['canShowTaScoresAlert']

    # can still show alert for other lessons
    other_script_level = unit.script_levels.last
    refute_equal other_script_level.lesson.absolute_position, script_level.lesson.absolute_position
    create :rubric, lesson: other_script_level.lesson, level: other_script_level.levels.first
    get build_script_level_path(other_script_level)
    assert_response :success
    rubric_data = JSON.parse(css_select('script[data-rubricdata]').first.attribute('data-rubricdata').to_s)
    assert rubric_data['canShowTaScoresAlert']
  end
end
