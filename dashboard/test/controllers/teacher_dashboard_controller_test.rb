require 'test_helper'

class TeacherDashboardControllerTest < ActionController::TestCase
  self.use_transactional_test_case = true

  setup_all do
    @section_owner = create :teacher
    @sections = create_list :section, 3, user: @section_owner
    @section = @sections.first
  end

  test 'index: redirects home if no logged in user' do
    get :show, params: {section_id: @section.id}
    assert_response :redirect
    assert_redirected_to "http://test.host/home"
  end

  test 'index: redirects home if logged in user is not a teacher' do
    sign_in create(:student)
    get :show, params: {section_id: @section.id}
    assert_response :redirect
    assert_redirected_to "http://test.host/home"
  end

  test 'index: redirects home if requested section does not belong to teacher' do
    sign_in @section_owner
    other_teacher_section = create :section
    get :show, params: {section_id: other_teacher_section.id}
    assert_response :redirect
    assert_redirected_to "http://test.host/home"
  end

  test 'index: returns success if requested section belongs to the section owner' do
    sign_in @section_owner
    section = create :section, user: @section_owner
    get :show, params: {section_id: section.id}
    assert_response :success
  end

  test 'index: redirects to generic course page if requested section does not belong to teacher' do
    @section_owner_2 = create :teacher
    @sections_2 = create_list :section, 3, user: @section_owner_2
    @section_2 = @sections_2.first
    sign_in @section_owner_2
    section = create :section, user: @section_owner
    get :show, params: {section_id: section.id, path: 'courses/csd-2024'}
    assert_response :redirect
    assert_redirected_to "http://test.host/courses/csd-2024"
  end

  test 'index: returns success if requested section is an instructed section for a coteacher' do
    cotaught_section = create(:section, user: @section_owner, login_type: 'word')
    other_teacher = create :teacher
    create(:section_instructor, instructor: other_teacher, section: cotaught_section, status: :active)

    sign_in other_teacher
    get :show, params: {section_id: cotaught_section.id}
    assert_response :success
  end

  test 'redirect_to_newest_section: redirects to support URL if no sections instructed' do
    other_teacher = create(:teacher)
    sign_in other_teacher

    get :redirect_to_newest_section_progress

    assert_redirected_to 'https://support.code.org/hc/en-us/articles/25195525766669-Getting-Started-New-Progress-View'
  end

  test 'redirect_to_newest_section: redirects to newest section progress page if sections instructed' do
    sign_in @section_owner

    section = create :section, user: @section_owner, created_at: 2.days.from_now

    get :redirect_to_newest_section_progress

    assert_redirected_to "/teacher_dashboard/sections/#{section.id}/progress?view=v2"
  end

  test 'enable_experiments: redirects to home if no sections' do
    other_teacher = create(:teacher)
    sign_in other_teacher

    get :enable_experiments

    assert_redirected_to '/home'
  end

  test 'enable_experiments: redirects to newest section with flags' do
    sign_in @section_owner

    section = create :section, user: @section_owner, created_at: 2.days.from_now

    get :enable_experiments

    assert_redirected_to "/teacher_dashboard/sections/#{section.id}/progress?enableExperiments=teacher-local-nav-v2"
  end

  test 'disable_experiments: redirects to home if no sections' do
    other_teacher = create(:teacher)
    sign_in other_teacher

    get :disable_experiments

    assert_redirected_to '/home'
  end

  test 'disable_experiments: redirects to newest section with flags' do
    sign_in @section_owner

    section = create :section, user: @section_owner, created_at: 2.days.from_now

    get :disable_experiments

    assert_redirected_to "/teacher_dashboard/sections/#{section.id}/progress?disableExperiments=teacher-local-nav-v2"
  end
end
