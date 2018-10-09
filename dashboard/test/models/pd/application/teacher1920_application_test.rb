require 'test_helper'

module Pd::Application
  class Teacher1920ApplicationTest < ActiveSupport::TestCase
    include Pd::Teacher1920ApplicationConstants
    include ApplicationConstants
    include RegionalPartnerTeacherconMapping

    freeze_time

    test 'application guid is generated on create' do
      teacher_application = build :pd_teacher1920_application
      assert_nil teacher_application.application_guid

      teacher_application.save!
      assert_not_nil teacher_application.application_guid
    end

    test 'existing guid is preserved' do
      guid = SecureRandom.uuid
      teacher_application = create :pd_teacher1920_application, application_guid: guid
      assert_equal guid, teacher_application.application_guid

      # save again
      teacher_application.save!
      assert_equal guid, teacher_application.application_guid
    end

    test 'principal_approval_url' do
      teacher_application = build :pd_teacher1920_application
      assert_nil teacher_application.principal_approval_url

      # save to generate guid and therefore principal approval url
      teacher_application.save!
      assert teacher_application.principal_approval_url
    end

    test 'principal_greeting' do
      hash_with_principal_title = build :pd_teacher1920_application_hash
      hash_without_principal_title = build :pd_teacher1920_application_hash, principal_title: nil

      application_with_principal_title = build :pd_teacher1920_application, form_data_hash: hash_with_principal_title
      application_without_principal_title = build :pd_teacher1920_application, form_data_hash: hash_without_principal_title

      assert_equal 'Dr. Dumbledore', application_with_principal_title.principal_greeting
      assert_equal 'Albus Dumbledore', application_without_principal_title.principal_greeting
    end

    test 'meets criteria says an application meets critera when all YES_NO fields are marked yes' do
      teacher_application = build :pd_teacher1920_application, course: 'csp',
        response_scores: CRITERIA_SCORE_QUESTIONS_CSP.map {|x| [x, 'Yes']}.to_h.to_json
      assert_equal 'Yes', teacher_application.meets_criteria

      teacher_application = build :pd_teacher1920_application, course: 'csd',
        response_scores: CRITERIA_SCORE_QUESTIONS_CSD.map {|x| [x, 'Yes']}.to_h.to_json
      assert_equal 'Yes', teacher_application.meets_criteria
    end

    test 'meets criteria says an application does not meet criteria when any YES_NO fields are marked NO' do
      teacher_application = build :pd_teacher1920_application, response_scores: {
        committed: 'No'
      }.to_json
      assert_equal 'No', teacher_application.meets_criteria
    end

    test 'meets criteria returns incomplete when an application does not have YES on all YES_NO fields but has no NOs' do
      teacher_application = build :pd_teacher1920_application, response_scores: {
        committed: 'Yes'
      }.to_json
      assert_equal 'Reviewing incomplete', teacher_application.meets_criteria
    end

    test 'total score calculates the sum of all response scores' do
      teacher_application = build :pd_teacher1920_application, response_scores: {
        free_lunch_percent: '5',
        underrepresented_minority_percent: '5',
        able_to_attend_single: TEXT_FIELDS[:able_to_attend_single],
        csp_which_grades: nil
      }.to_json

      assert_equal 10, teacher_application.total_score
    end

    test 'autoscore does not override existing scores' do
      application_hash = build :pd_teacher1920_application_hash, {
        committed: YES,
        able_to_attend_single: TEXT_FIELDS[:able_to_attend_single],
        csp_which_grades: ['12'],
        csp_course_hours_per_year: Pd::Application::ApplicationBase::COMMON_OPTIONS[:course_hours_per_year].first,
        previous_yearlong_cdo_pd: ['CS Discoveries'],
        csp_how_offer: Pd::Application::Teacher1920Application.options[:csp_how_offer].last,
        taught_in_past: ['CS in Algebra']
      }

      application = create(:pd_teacher1920_application, course: 'csp', form_data_hash: application_hash, regional_partner: (create :regional_partner))
      application.auto_score!

      assert_equal(
        {
          regional_partner_name: YES,
          committed: YES,
          able_to_attend_single: YES,
          csp_which_grades: YES,
          csp_course_hours_per_year: YES,
          previous_yearlong_cdo_pd: YES,
          csp_how_offer: 2,
          taught_in_past: 2
        }, application.response_scores_hash
      )

      application.update_form_data_hash(
        {
          principal_approval: YES,
          schedule_confirmed: YES,
          diversity_recruitment: YES,
          free_lunch_percent: '50.1%',
          underrepresented_minority_percent: '50.1%',
          wont_replace_existing_course: Pd::Application::PrincipalApproval1920Application.options[:replace_course].second,
        }
      )

      application.update(response_scores: application.response_scores_hash.merge({regional_partner_name: NO}).to_json)

      application.auto_score!
      assert_equal(
        {
          regional_partner_name: NO,
          committed: YES,
          able_to_attend_single: YES,
          principal_approval: YES,
          schedule_confirmed: YES,
          diversity_recruitment: YES,
          free_lunch_percent: 5,
          underrepresented_minority_percent: 5,
          wont_replace_existing_course: 5,
          csp_which_grades: YES,
          csp_course_hours_per_year: YES,
          previous_yearlong_cdo_pd: YES,
          csp_how_offer: 2,
          taught_in_past: 2
        }, application.response_scores_hash
      )
    end

    test 'autoscore for a CSP application where they should get YES/Points for everything' do
      application_hash = build :pd_teacher1920_application_hash, {
        committed: YES,
        able_to_attend_single: TEXT_FIELDS[:able_to_attend_single],
        principal_approval: YES,
        schedule_confirmed: YES,
        diversity_recruitment: YES,
        free_lunch_percent: '50.1%',
        underrepresented_minority_percent: '50.1%',
        wont_replace_existing_course: Pd::Application::PrincipalApproval1920Application.options[:replace_course].second,
        csp_which_grades: ['12'],
        csp_course_hours_per_year: Pd::Application::ApplicationBase::COMMON_OPTIONS[:course_hours_per_year].first,
        previous_yearlong_cdo_pd: ['CS Discoveries'],
        csp_how_offer: Pd::Application::Teacher1920Application.options[:csp_how_offer].last,
        taught_in_past: ['CS in Algebra']
      }

      application = create :pd_teacher1920_application, course: 'csp', form_data_hash: application_hash
      application.update(regional_partner: (create :regional_partner))
      application.auto_score!

      assert_equal(
        {
          regional_partner_name: YES,
          committed: YES,
          able_to_attend_single: YES,
          principal_approval: YES,
          schedule_confirmed: YES,
          diversity_recruitment: YES,
          free_lunch_percent: 5,
          underrepresented_minority_percent: 5,
          wont_replace_existing_course: 5,
          csp_which_grades: YES,
          csp_course_hours_per_year: YES,
          previous_yearlong_cdo_pd: YES,
          csp_how_offer: 2,
          taught_in_past: 2
        }, application.response_scores_hash
      )
    end

    test 'autoscore for a CSP application where they should get NO/No points for everything' do
      application_hash = build :pd_teacher1920_application_hash, {
        committed: Pd::Application::Teacher1920Application.options[:committed].last,
        able_to_attend_single: TEXT_FIELDS[:no_explain],
        principal_approval: YES,
        schedule_confirmed: NO,
        diversity_recruitment: NO,
        free_lunch_percent: '49.9%',
        underrepresented_minority_percent: '49.9%',
        wont_replace_existing_course: YES,
        csp_which_grades: ['12'],
        csp_course_hours_per_year: Pd::Application::ApplicationBase::COMMON_OPTIONS[:course_hours_per_year].last,
        previous_yearlong_cdo_pd: ['CS Principles'],
        csp_how_offer: Pd::Application::Teacher1920Application.options[:csp_how_offer].first,
        taught_in_past: ['AP CS A']
      }

      application = create :pd_teacher1920_application, course: 'csp', form_data_hash: application_hash, regional_partner: nil
      application.auto_score!

      assert_equal(
        {
          regional_partner_name: NO,
          committed: NO,
          able_to_attend_single: NO,
          principal_approval: YES, # Keep this as yes to test additional fields
          schedule_confirmed: NO,
          diversity_recruitment: NO,
          free_lunch_percent: 0,
          underrepresented_minority_percent: 0,
          wont_replace_existing_course: nil,
          csp_which_grades: YES, # Not possible to select responses for which this would be No
          csp_course_hours_per_year: NO,
          previous_yearlong_cdo_pd: NO,
          csp_how_offer: 0,
          taught_in_past: 0
        }, application.response_scores_hash
      )
    end

    test 'autoscore for a CSD application where they should get YES/Points for everything' do
      application_hash = build(:pd_teacher1920_application_hash, :csd,
        committed: YES,
        able_to_attend_single: TEXT_FIELDS[:able_to_attend_single],
        principal_approval: YES,
        schedule_confirmed: YES,
        diversity_recruitment: YES,
        free_lunch_percent: '50.1%',
        underrepresented_minority_percent: '50.1%',
        wont_replace_existing_course: Pd::Application::PrincipalApproval1920Application.options[:replace_course].second,
        csd_which_grades: ['10', '11'],
        csd_course_hours_per_year: Pd::Application::ApplicationBase::COMMON_OPTIONS[:course_hours_per_year].first,
        previous_yearlong_cdo_pd: ['CS in Science'],
        taught_in_past: Pd::Application::Teacher1920Application.options[:taught_in_past].last
      )

      application = create :pd_teacher1920_application, course: 'csd', form_data_hash: application_hash
      application.update(regional_partner: (create :regional_partner))
      application.auto_score!

      assert_equal(
        {
          regional_partner_name: YES,
          committed: YES,
          able_to_attend_single: YES,
          principal_approval: YES,
          schedule_confirmed: YES,
          diversity_recruitment: YES,
          free_lunch_percent: 5,
          underrepresented_minority_percent: 5,
          wont_replace_existing_course: 5,
          csd_which_grades: YES,
          csd_course_hours_per_year: YES,
          previous_yearlong_cdo_pd: YES,
          taught_in_past: 2
        }, application.response_scores_hash
      )
    end

    test 'autoscore for a CSD application where they should get NO/No points for everything' do
      application_hash = build(:pd_teacher1920_application_hash, :csd,
        committed: Pd::Application::Teacher1920Application.options[:committed].last,
        able_to_attend_single: TEXT_FIELDS[:no_explain],
        principal_approval: YES,
        schedule_confirmed: NO,
        diversity_recruitment: NO,
        free_lunch_percent: '49.9%',
        underrepresented_minority_percent: '49.9%',
        wont_replace_existing_course: YES,
        csd_which_grades: ['12'],
        csd_course_hours_per_year: Pd::Application::ApplicationBase::COMMON_OPTIONS[:course_hours_per_year].last,
        previous_yearlong_cdo_pd: ['Exploring Computer Science'],
        taught_in_past: ['Exploring Computer Science']
      )

      application = create :pd_teacher1920_application, course: 'csd', form_data_hash: application_hash, regional_partner: nil
      application.auto_score!

      assert_equal(
        {
          regional_partner_name: NO,
          committed: NO,
          able_to_attend_single: NO,
          principal_approval: YES, # Keep this as yes to test additional fields
          schedule_confirmed: NO,
          diversity_recruitment: NO,
          free_lunch_percent: 0,
          underrepresented_minority_percent: 0,
          wont_replace_existing_course: nil,
          csd_which_grades: NO,
          csd_course_hours_per_year: NO,
          previous_yearlong_cdo_pd: NO,
          taught_in_past: 0
        }, application.response_scores_hash
      )
    end

    test 'autoscore for able_to_attend_multiple' do
      application_hash = build :pd_teacher1920_application_hash, :with_multiple_workshops, :csd
      application = create :pd_teacher1920_application, form_data: application_hash.to_json, regional_partner: nil

      application.auto_score!

      assert_equal(YES, application.response_scores_hash[:able_to_attend_multiple])
    end

    test 'autoscore for ambiguous responses to able_to_attend_multiple' do
      application_hash = build(:pd_teacher1920_application_hash, :csd, :with_multiple_workshops,
        able_to_attend_multiple: [
          "December 11-15, 2017 in Indiana, USA",
          TEXT_FIELDS[:no_explain]
        ]
      )

      application = create :pd_teacher1920_application, form_data: application_hash.to_json, regional_partner: nil
      application.auto_score!

      assert_nil application.response_scores_hash[:able_to_attend_multiple]
    end

    test 'autoscore for not able_to_attend_multiple' do
      application_hash = build(:pd_teacher1920_application_hash, :csd, :with_multiple_workshops,
        program: Pd::Application::Teacher1920Application::PROGRAM_OPTIONS.first,
        able_to_attend_multiple: [TEXT_FIELDS[:no_explain]]
      )

      application = create :pd_teacher1920_application, form_data: application_hash.to_json, regional_partner: nil
      application.auto_score!

      assert_equal(NO, application.response_scores_hash[:able_to_attend_multiple])
    end

    test 'application meets criteria if able to attend single workshop' do
      application_hash = build(:pd_teacher1920_application_hash,
        principal_approval: YES,
        schedule_confirmed: YES,
        diversity_recruitment: YES
      )
      application = create :pd_teacher1920_application, form_data: application_hash.to_json, regional_partner: (create :regional_partner)
      application.auto_score!

      assert_equal(YES, application.meets_criteria)
    end

    test 'application meets criteria if able to attend multiple workshops' do
      application_hash = build(:pd_teacher1920_application_hash, :with_multiple_workshops,
        principal_approval: YES,
        schedule_confirmed: YES,
        diversity_recruitment: YES
      )
      application = create :pd_teacher1920_application, form_data: application_hash.to_json, regional_partner: (create :regional_partner)
      application.auto_score!

      assert_equal(YES, application.meets_criteria)
    end

    test 'application does not meet criteria if unable to attend single workshop' do
      application_hash = build(:pd_teacher1920_application_hash,
        able_to_attend_single: [TEXT_FIELDS[:no_explain]],
        principal_approval: YES,
        schedule_confirmed: YES,
        diversity_recruitment: YES
      )
      application = create :pd_teacher1920_application, form_data: application_hash.to_json, regional_partner: (create :regional_partner)
      application.auto_score!

      assert_equal(NO, application.meets_criteria)
    end

    test 'application does not meet criteria if unable to attend multiple workshops' do
      application_hash = build(:pd_teacher1920_application_hash, :with_multiple_workshops,
        able_to_attend_multiple: [TEXT_FIELDS[:no_explain]],
        principal_approval: YES,
        schedule_confirmed: YES,
        diversity_recruitment: YES
      )
      application = create :pd_teacher1920_application, form_data: application_hash.to_json, regional_partner: (create :regional_partner)
      application.auto_score!
      assert_equal(NO, application.meets_criteria)
    end

    test 'accepted_at updates times' do
      today = Date.today.to_time
      tomorrow = Date.tomorrow.to_time
      application = create :pd_teacher1920_application
      assert_nil application.accepted_at

      Timecop.freeze(today) do
        application.update!(status: 'accepted_not_notified')
        assert_equal today, application.accepted_at.to_time

        application.update!(status: 'declined')
        assert_nil application.accepted_at
      end

      Timecop.freeze(tomorrow) do
        application.update!(status: 'accepted_not_notified')
        assert_equal tomorrow, application.accepted_at.to_time
      end
    end

    test 'find_default_workshop finds no workshop for applications without a regional partner' do
      application = build :pd_teacher1920_application
      assert_nil application.find_default_workshop
    end

    test 'find_default_workshop finds a teachercon workshop for applications with a G3 partner' do
      # stub process_location to prevent making Geocoder requests in test
      Pd::Workshop.any_instance.stubs(:process_location)

      teachercon_workshops = {}
      [Pd::Workshop::COURSE_CSD, Pd::Workshop::COURSE_CSP].each do |course|
        TEACHERCONS.each do |teachercon|
          city = teachercon[:city]
          teachercon_workshops[[course, city]] = create :pd_workshop,
            num_sessions: 1, course: course, subject: Pd::Workshop::SUBJECT_TEACHER_CON, location_address: city
        end
      end

      g3_partner_name = REGIONAL_PARTNER_TC_MAPPING.keys.sample
      g3_partner = build :regional_partner, group: 3, name: g3_partner_name
      application = build :pd_teacher1920_application, regional_partner: g3_partner

      [Pd::Workshop::COURSE_CSD, Pd::Workshop::COURSE_CSP].each do |course|
        city = get_matching_teachercon(g3_partner)[:city]
        workshop = teachercon_workshops[[course, city]]

        application.course = course === Pd::Workshop::COURSE_CSD ? 'csd' : 'csp'
        assert_equal workshop, application.find_default_workshop
      end
    end

    test 'find_default_workshop find an appropriate partner workshop for G1 and G2 partners' do
      partner = create :regional_partner
      program_manager = create :program_manager, regional_partner: partner

      # where "appropriate workshop" is the earliest teachercon or local summer
      # workshop matching the application course.

      invalid_workshop = create :pd_workshop, organizer: program_manager
      create :pd_session,
        workshop: invalid_workshop,
        start: Date.new(2018, 1, 10)

      earliest_valid_workshop = create :pd_workshop, :local_summer_workshop, organizer: program_manager
      create :pd_session,
        workshop: earliest_valid_workshop,
        start: Date.new(2018, 1, 15)

      latest_valid_workshop = create :pd_workshop, :local_summer_workshop, organizer: program_manager
      create :pd_session,
        workshop: latest_valid_workshop,
        start: Date.new(2018, 12, 15)

      application = build :pd_teacher1920_application, course: 'csp', regional_partner: partner
      assert_equal earliest_valid_workshop, application.find_default_workshop
    end

    test 'locking an application with pd_workshop_id automatically enrolls user' do
      application = create :pd_teacher1920_application
      workshop = create :pd_workshop

      application.pd_workshop_id = workshop.id
      application.status = 'accepted_not_notified'

      assert_creates(Pd::Enrollment) do
        application.lock!
      end
      assert_equal Pd::Enrollment.last.workshop, workshop
      assert_equal Pd::Enrollment.last.id, application.auto_assigned_enrollment_id
    end

    test 'updating and re-locking an application with an auto-assigned enrollment will delete old enrollment' do
      application = create :pd_teacher1920_application
      first_workshop = create :pd_workshop
      second_workshop = create :pd_workshop

      application.pd_workshop_id = first_workshop.id
      application.status = 'accepted_not_notified'
      application.lock!

      first_enrollment = Pd::Enrollment.find(application.auto_assigned_enrollment_id)

      application.unlock!
      application.pd_workshop_id = second_workshop.id
      application.lock!

      assert first_enrollment.reload.deleted?
      assert_not_equal first_enrollment.id, application.auto_assigned_enrollment_id
    end

    test 'updating the application to unaccepted will also delete the autoenrollment' do
      application = create :pd_teacher1920_application
      workshop = create :pd_workshop

      application.pd_workshop_id = workshop.id
      application.status = 'accepted_not_notified'
      application.lock!
      first_enrollment = Pd::Enrollment.find(application.auto_assigned_enrollment_id)

      application.unlock!
      application.status = "waitlisted"
      application.lock!

      assert first_enrollment.reload.deleted?

      application.unlock!
      application.status = 'accepted_not_notified'

      assert_creates(Pd::Enrollment) do
        application.lock!
      end

      assert_not_equal first_enrollment.id, application.auto_assigned_enrollment_id
    end

    test 'school_info_attr for specific school' do
      school = create :school
      form_data_hash = build :pd_teacher1920_application_hash, school: school
      application = create :pd_teacher1920_application, form_data_hash: form_data_hash
      assert_equal({school_id: school.id}, application.school_info_attr)
    end

    test 'school_info_attr for custom school' do
      application = create :pd_teacher1920_application, form_data_hash: (
      build :pd_teacher1920_application_hash,
        :with_custom_school,
        school_name: 'Code.org',
        school_address: '1501 4th Ave',
        school_city: 'Seattle',
        school_state: 'Washington',
        school_zip_code: '98101',
        school_type: 'Public school'
      )
      assert_equal(
        {
          country: 'US',
          school_type: 'public',
          state: 'Washington',
          zip: '98101',
          school_name: 'Code.org',
          full_address: '1501 4th Ave',
          validation_type: SchoolInfo::VALIDATION_NONE
        },
        application.school_info_attr
      )
    end

    test 'update_user_school_info with specific school overwrites user school info' do
      user = create :teacher, school_info: create(:school_info)
      application_school_info = create :school_info
      application = create :pd_teacher1920_application, user: user, form_data_hash: (
        build :pd_teacher1920_application_hash, school: application_school_info.school
      )

      application.update_user_school_info!
      assert_equal application_school_info, user.school_info
    end

    test 'update_user_school_info with custom school does nothing when the user already a specific school' do
      original_school_info = create :school_info
      user = create :teacher, school_info: original_school_info
      application = create :pd_teacher1920_application, user: user, form_data_hash: (
        build :pd_teacher1920_application_hash, :with_custom_school
      )

      application.update_user_school_info!
      assert_equal original_school_info, user.school_info
    end

    test 'update_user_school_info with custom school updates user info when user does not have a specific school' do
      original_school_info = create :school_info_us_other
      user = create :teacher, school_info: original_school_info
      application = create :pd_teacher1920_application, user: user, form_data_hash: (
        build :pd_teacher1920_application_hash, :with_custom_school
      )

      application.update_user_school_info!
      refute_equal original_school_info.id, user.school_info_id
      assert_not_nil user.school_info_id
    end

    test 'get_first_selected_workshop single local workshop' do
      Pd::Workshop.any_instance.stubs(:process_location)

      workshop = create :pd_workshop, location_address: 'Address', sessions_from: Date.today, num_sessions: 1
      application = create :pd_teacher1920_application, form_data_hash: (
        build :pd_teacher1920_application_hash,
          regional_partner_workshop_ids: [workshop.id],
          able_to_attend_multiple: ["#{Date.today.strftime '%B %-d, %Y'} in Address"]
      )

      assert_equal workshop, application.get_first_selected_workshop
    end

    test 'get_first_selected_workshop multiple local workshops' do
      workshops = (1..3).map {|i| create :pd_workshop, num_sessions: 2, sessions_from: Date.today + i, location_address: %w(tba TBA tba)[i - 1]}

      application = create :pd_teacher1920_application, form_data_hash: (
        build(:pd_teacher1920_application_hash, :with_multiple_workshops,
          regional_partner_workshop_ids: workshops.map(&:id),
          able_to_attend_multiple: (
            # Select all but the first. Expect the first selected to be returned below
            workshops[1..-1].map do |workshop|
              "#{workshop.friendly_date_range} in #{workshop.location_address} hosted by Code.org"
            end
          )
        )
      )
      assert_equal workshops[1], application.get_first_selected_workshop
    end

    test 'get_first_selected_workshop multiple local workshops no selection returns first' do
      workshops = (1..2).map {|i| create :pd_workshop, num_sessions: 2, sessions_from: Date.today + i}

      application = create :pd_teacher1920_application, form_data_hash: (
        build(:pd_teacher1920_application_hash, :with_multiple_workshops,
          regional_partner_workshop_ids: workshops.map(&:id),
          able_to_attend_multiple: ['Not a workshop', 'Not a workshop 2']
        )
      )
      assert_equal workshops.first, application.get_first_selected_workshop
    end

    test 'get_first_selected_workshop with no workshops returns nil' do
      application = create :pd_teacher1920_application, form_data_hash: (
      build(:pd_teacher1920_application_hash, :with_multiple_workshops,
        regional_partner_workshop_ids: []
        )
      )
      assert_nil application.get_first_selected_workshop
    end

    test 'get_first_selected_workshop ignores single deleted workshops' do
      Pd::Workshop.any_instance.stubs(:process_location)

      workshop = create :pd_workshop, :local_summer_workshop, num_sessions: 5, location_address: 'Buffalo, NY', sessions_from: Date.new(2019, 1, 1)
      application = create :pd_teacher1920_application, form_data_hash: (
        build :pd_teacher1920_application_hash,
          regional_partner_workshop_ids: [workshop.id],
          able_to_attend_multiple: ['January 1-5, 2019 in Buffalo, NY']
      )

      workshop.destroy
      assert_nil application.get_first_selected_workshop
    end

    test 'get_first_selected_workshop ignores deleted workshop from multiple list' do
      workshops = (1..2).map {|i| create :pd_workshop, num_sessions: 2, sessions_from: Date.today + i}

      application = create :pd_teacher1920_application, form_data_hash: (
        build(:pd_teacher1920_application_hash, :with_multiple_workshops,
          regional_partner_workshop_ids: workshops.map(&:id),
          able_to_attend: [workshops.first.id, workshops.second.id]
        )
      )

      workshops[0].destroy
      assert_equal workshops[1], application.get_first_selected_workshop

      workshops[1].destroy
      assert_nil application.get_first_selected_workshop
    end

    test 'get_first_selected_workshop picks correct workshop even when multiple are on the same day' do
      workshop_1 = create :pd_workshop, num_sessions: 2, sessions_from: Date.today + 2
      workshop_2 = create :pd_workshop, num_sessions: 2, sessions_from: Date.today + 2
      workshop_1.update_column(:location_address, 'Location 1')
      workshop_2.update_column(:location_address, 'Location 2')

      application = create :pd_teacher1920_application, form_data_hash: (
        build(:pd_teacher1920_application_hash, :with_multiple_workshops,
          regional_partner_workshop_ids: [workshop_1.id, workshop_2.id],
          able_to_attend_multiple: ["#{workshop_2.friendly_date_range} in Location 2 hosted by Code.org"]
        )
      )

      assert_equal workshop_2, application.get_first_selected_workshop

      application_2 = create :pd_teacher1920_application, form_data_hash: (
        build(:pd_teacher1920_application_hash, :with_multiple_workshops,
          regional_partner_workshop_ids: [workshop_1.id, workshop_2.id],
          able_to_attend_multiple: ["#{workshop_2.friendly_date_range} in Location 1 hosted by Code.org"]
        )
      )

      assert_equal workshop_1, application_2.get_first_selected_workshop
    end

    test 'assign_default_workshop! saves the default workshop' do
      application = create :pd_teacher1920_application
      workshop = create :pd_workshop
      application.expects(:find_default_workshop).returns(workshop)

      application.assign_default_workshop!
      assert_equal workshop.id, application.reload.pd_workshop_id
    end

    test 'assign_default_workshop! does nothing when a workshop is already assigned' do
      workshop = create :pd_workshop
      application = create :pd_teacher1920_application, pd_workshop_id: workshop.id
      application.expects(:find_default_workshop).never

      application.assign_default_workshop!
      assert_equal workshop.id, application.reload.pd_workshop_id
    end

    test 'can_see_locked_status?' do
      teacher = create :teacher
      g1_program_manager = create :program_manager, regional_partner: create(:regional_partner, group: 1)
      g3_program_manager = create :program_manager, regional_partner: create(:regional_partner, group: 3)
      workshop_admin = create :workshop_admin

      refute Teacher1920Application.can_see_locked_status?(teacher)
      refute Teacher1920Application.can_see_locked_status?(g1_program_manager)

      assert Teacher1920Application.can_see_locked_status?(g3_program_manager)
      assert Teacher1920Application.can_see_locked_status?(workshop_admin)
    end

    test 'locked status appears in csv only when the supplied user can_see_locked_status' do
      application = create :pd_teacher1920_application
      mock_user = mock

      Teacher1920Application.stubs(:can_see_locked_status?).returns(false)
      header_without_locked = Teacher1920Application.csv_header('csf', mock_user)
      refute header_without_locked.include? 'Locked'
      row_without_locked = application.to_csv_row(mock_user)
      assert_equal CSV.parse(header_without_locked).length, CSV.parse(row_without_locked).length,
        "Expected header and row to have the same number of columns, excluding Locked"

      Teacher1920Application.stubs(:can_see_locked_status?).returns(true)
      header_with_locked = Teacher1920Application.csv_header('csf', mock_user)
      assert header_with_locked.include? 'Locked'
      row_with_locked = application.to_csv_row(mock_user)
      assert_equal CSV.parse(header_with_locked).length, CSV.parse(row_with_locked).length,
        "Expected header and row to have the same number of columns, including Locked"
    end

    test 'to_cohort_csv' do
      application = build :pd_teacher1920_application
      optional_columns = {registered_workshop: false, accepted_teachercon: true}

      assert (header = Teacher1920Application.cohort_csv_header(optional_columns))
      assert (row = application.to_cohort_csv_row(optional_columns))
      assert_equal CSV.parse(header).length, CSV.parse(row).length,
        "Expected header and row to have the same number of columns"
    end

    test 'school cache' do
      school = create :school
      form_data_hash = build :pd_teacher1920_application_hash, school: school
      application = create :pd_teacher1920_application, form_data_hash: form_data_hash

      # Original query: School, SchoolDistrict
      assert_queries 2 do
        assert_equal school.name.titleize, application.school_name
        assert_equal school.school_district.name.titleize, application.district_name
      end

      # Cached
      assert_queries 0 do
        assert_equal school.name.titleize, application.school_name
        assert_equal school.school_district.name.titleize, application.district_name
      end
    end

    test 'cache prefetch' do
      school = create :school
      workshop = create :pd_workshop
      form_data_hash = build :pd_teacher1920_application_hash, school: school
      application = create :pd_teacher1920_application, form_data_hash: form_data_hash, pd_workshop_id: workshop.id

      # Workshop, Session, Enrollment, School, SchoolDistrict
      assert_queries 5 do
        Teacher1920Application.prefetch_associated_models([application])
      end

      assert_queries 0 do
        assert_equal school.name.titleize, application.school_name
        assert_equal school.school_district.name.titleize, application.district_name
        assert_equal workshop, application.workshop
      end
    end

    test 'memoized filtered_labels' do
      Teacher1920Application::FILTERED_LABELS.clear

      filtered_labels_csd = Teacher1920Application.filtered_labels('csd')
      assert filtered_labels_csd.include? :csd_which_grades
      refute filtered_labels_csd.include? :csp_which_grades
      assert_equal ['csd'], Teacher1920Application::FILTERED_LABELS.keys

      filtered_labels_csd = Teacher1920Application.filtered_labels('csp')
      refute filtered_labels_csd.include? :csd_which_grades
      assert filtered_labels_csd.include? :csp_which_grades
      assert_equal ['csd', 'csp'], Teacher1920Application::FILTERED_LABELS.keys
    end

    test 'status changes are logged' do
      application = build :pd_teacher1920_application
      assert_nil application.status_log

      application.save!
      assert application.status_log.is_a? Array
      assert_status_log [{status: 'unreviewed', at: Time.zone.now}], application

      # update unrelated field
      Timecop.freeze 1
      application.update!(notes: 'some notes')
      assert_equal Time.zone.now, application.updated_at
      assert_equal 1, application.status_log.count

      Timecop.freeze 1
      application.update!(status: 'pending')
      assert_status_log(
        [
          {status: 'unreviewed', at: Time.zone.now - 2.seconds},
          {status: 'pending', at: Time.zone.now}
        ],
        application
      )
    end

    test 'setting an auto-email status queues up an email' do
      application = create :pd_teacher1920_application
      assert_empty application.emails

      application.expects(:queue_email).with('accepted_no_cost_registration')
      application.update!(status: 'accepted_no_cost_registration')
    end

    test 'setting an non auto-email status does not queue up a status email' do
      application = create :pd_teacher1920_application
      assert_empty application.emails

      application.expects(:queue_email).never
      application.update!(status: 'pending')
    end

    test 'setting an auto-email status deletes unsent emails for the application' do
      unrelated_email = create :pd_application_email
      application = create :pd_teacher1920_application
      associated_sent_email = create :pd_application_email, application: application, sent_at: Time.now
      associated_unsent_email = create :pd_application_email, application: application

      application.update!(status: 'waitlisted')
      assert Email.exists?(unrelated_email.id)
      assert Email.exists?(associated_sent_email.id)
      refute Email.exists?(associated_unsent_email.id)
    end

    test 'formatted_partner_contact_email' do
      application = build :pd_teacher1920_application
      partner = build :regional_partner

      # no partner
      assert_nil application.formatted_partner_contact_email

      # partner w no contact info
      application.regional_partner = partner
      assert_nil application.formatted_partner_contact_email

      # name only? still nil
      partner.contact_name = 'We Teach Code'
      assert_nil application.formatted_partner_contact_email

      # name and email
      partner.contact_email = 'we_teach_code@ex.net'
      assert_equal 'We Teach Code <we_teach_code@ex.net>', application.formatted_partner_contact_email

      # email only
      partner.contact_name = nil
      assert_equal 'we_teach_code@ex.net', application.formatted_partner_contact_email
    end

    test 'test non course dynamically required fields' do
      application_hash = build :pd_teacher1920_application_hash,
        completing_on_behalf_of_someone_else: YES,
        does_school_require_cs_license: YES,
        pay_fee: TEXT_FIELDS[:no_pay_fee_1920],
        regional_partner_workshop_ids: [1, 2, 3],
        able_to_attend_multiple: [TEXT_FIELDS[:unable_to_attend_1920]],
        what_license_required: nil

      application = build :pd_teacher1920_application, form_data_hash: application_hash
      assert_nil application.formatted_partner_contact_email

      refute application.valid?
      assert_equal %w(completingOnBehalfOfName whatLicenseRequired travelToAnotherWorkshop scholarshipReasons), application.errors.messages[:form_data]
    end

    test 'test csd dynamically required fields' do
      application_hash = build :pd_teacher1920_application_hash_common,
        :csd,
        csd_which_grades: nil

      application = build :pd_teacher1920_application, form_data_hash: application_hash
      refute application.valid?
      assert_equal ['csdWhichGrades'], application.errors.messages[:form_data]
    end

    test 'test csp dynamically required fields' do
      application_hash = build :pd_teacher1920_application_hash_common,
        :csp,
        csp_which_grades: nil,
        csp_how_offer: nil

      application = build :pd_teacher1920_application, form_data_hash: application_hash
      refute application.valid?
      assert_equal %w(cspWhichGrades cspHowOffer), application.errors.messages[:form_data]
    end

    test 'queue_email skips principal_approval_completed_partner with no partner email address' do
      application = build :pd_teacher1920_application
      application.expects(:formatted_partner_contact_email).returns(nil)
      CDO.log.expects(:info).with("Skipping principal_approval_completed_partner for application id #{application.id}")

      assert_does_not_create Email do
        application.queue_email :principal_approval_completed_partner
      end
    end

    test 'queue_email queues up principal_approval_completed_partner with a partner email address' do
      application = build :pd_teacher1920_application
      application.expects(:formatted_partner_contact_email).returns('partner@ex.net')
      CDO.log.expects(:info).never

      assert_creates Email do
        application.queue_email :principal_approval_completed_partner
      end
    end

    test 'should_send_decision_email?' do
      application = build :pd_teacher1920_application, status: :pending

      # no auto-email status: no email
      refute application.should_send_decision_email?

      # auto-email status with no partner: yes email
      application.status = :accepted_no_cost_registration
      assert application.should_send_decision_email?

      # auto-email status, partner with sent_by_system: yes email
      application.regional_partner = build(:regional_partner, applications_decision_emails: RegionalPartner::SENT_BY_SYSTEM)
      assert application.should_send_decision_email?

      # auto-email status, partner with sent_by_partner: no email
      application.regional_partner.applications_decision_emails = RegionalPartner::SENT_BY_PARTNER
      refute application.should_send_decision_email?
    end

    test 'Can create applications for the same user in 1819 and 1920' do
      teacher = create :teacher

      assert_creates Pd::Application::Teacher1819Application do
        create :pd_teacher1819_application, user: teacher
      end

      assert_creates Pd::Application::Teacher1920Application do
        create :pd_teacher1920_application, user: teacher
      end

      assert_raises ActiveRecord::RecordInvalid do
        create :pd_teacher1920_application, user: teacher
      end
    end

    test 'principal_approval' do
      application = create :pd_teacher1920_application
      assert_nil application.principal_approval

      incomplete = "Incomplete - Principal email sent on Oct 8"
      Timecop.freeze Date.new(2018, 10, 8) do
        application.stubs(:deliver_email)
        application.queue_email :principal_approval, deliver_now: true
        assert_equal incomplete, application.reload.principal_approval
      end

      # even if it's not required, when an email was sent display incomplete
      application.update!(principal_approval_not_required: true)
      assert_equal incomplete, application.reload.principal_approval

      application.emails.last.destroy
      assert_equal 'Not required', application.reload.principal_approval

      create :pd_principal_approval1920_application, teacher_application: application, approved: 'Yes'
      assert_equal 'Complete - Yes', application.reload.principal_approval
    end

    private

    def assert_status_log(expected, application)
      assert_equal JSON.parse(expected.to_json), application.status_log
    end
  end
end
