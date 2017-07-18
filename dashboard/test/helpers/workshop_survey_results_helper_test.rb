require 'test_helper'

class Pd::WorkshopSurveyResultsHelperTest < ActionView::TestCase
  include Pd::WorkshopSurveyResultsHelper

  test 'summarize summarizes teachercons as expected' do
    enrollment_1 = create :pd_enrollment
    enrollment_1.workshop.facilitators << create(:facilitator, name: 'Facilitator Bob')
    hash_1 = build :pd_teachercon_survey_hash
    hash_1[:whoFacilitated] = ['Facilitator Bob']
    hash_1[:thingsFacilitatorDidWell] = {'Facilitator Bob': 'Bob did well'}
    hash_1[:thingsFacilitatorCouldImprove] = {'Facilitator Bob': 'Bob could improve'}
    create :pd_teachercon_survey, pd_enrollment: enrollment_1, form_data: hash_1.to_json

    enrollment_2 = create :pd_enrollment
    enrollment_2.workshop.facilitators << create(:facilitator, name: 'Facilitator Jane')
    hash_2 = build :pd_teachercon_survey_hash
    hash_2[:personalLearningNeedsMet] = 'Strongly Disagree'
    hash_2[:venueFeedback] = 'more venue feedback'
    hash_2[:howCouldImprove] = 'so much'
    hash_2[:whoFacilitated] = ['Facilitator Jane']
    hash_2[:thingsFacilitatorDidWell] = {'Facilitator Jane': 'Jane did well'}
    hash_2[:thingsFacilitatorCouldImprove] = {'Facilitator Jane': 'Jane could improve'}
    create :pd_teachercon_survey, form_data: hash_2.to_json, pd_enrollment: enrollment_2
    workshops = [enrollment_1.workshop, enrollment_2.workshop]
    workshops.each {|w| w.update(course: Pd::Workshop::COURSE_CSP, subject: Pd::Workshop::SUBJECT_CSP_TEACHER_CON)}

    result_hash = summarize_workshop_surveys(workshops)
    assert_equal 3.5, result_hash[:personal_learning_needs_met]
    assert_equal 1, result_hash[:have_ideas_about_formative]
    assert_equal ['venue feedback', 'more venue feedback'], result_hash[:venue_feedback]
    assert_equal [['Facilitator Bob'], ['Facilitator Jane']], result_hash[:who_facilitated]

    assert_equal({'Facilitator Bob' => ['Bob did well'], 'Facilitator Jane' => ['Jane did well']}, result_hash[:things_facilitator_did_well])
    assert_equal({'Facilitator Bob' => ['Bob could improve'], 'Facilitator Jane' => ['Jane could improve']}, result_hash[:things_facilitator_could_improve])

    # When viewing workshop surveys for just Facilitator Bob, expect to only see bob's feedback
    result_hash = summarize_workshop_surveys(workshops, 'Facilitator Bob')
    assert_equal ['Bob did well'], result_hash[:things_facilitator_did_well]
    assert_equal ['Bob could improve'], result_hash[:things_facilitator_could_improve]
  end

  test 'summarize summarizes local workshops as expected' do
    enrollment_1 = create :pd_enrollment
    enrollment_1.workshop.facilitators << create(:facilitator, name: 'Facilitator Bert')
    enrollment_1.workshop.facilitators << create(:facilitator, name: 'Facilitator Ernie')
    hash_1 = build :pd_local_summer_workshop_survey_hash
    hash_1[:who_facilitated] = ['Facilitator Bert']
    hash_1[:how_clearly_presented] = {'Facilitator Bert': 'Extremely clearly'}
    hash_1[:how_interesting] = {'Facilitator Bert': 'Extremely interesting'}
    hash_1[:how_often_given_feedback] = {'Facilitator Bert': 'All the time'}
    hash_1[:help_quality] = {'Facilitator Bert': 'Extremely good'}
    hash_1[:how_comfortable_asking_questions] = {'Facilitator Bert': 'Extremely comfortable'}
    hash_1[:how_often_taught_new_things] = {'Facilitator Bert': 'All the time'}
    hash_1[:things_facilitator_did_well] = {'Facilitator Bert': 'Bert was very clean'}
    hash_1[:things_facilitator_could_improve] = {'Facilitator Bert': 'Bert was very strict'}
    create :pd_local_summer_workshop_survey, form_data: hash_1.to_json, pd_enrollment: enrollment_1

    enrollment_2 = create :pd_enrollment
    hash_2 = build :pd_local_summer_workshop_survey_hash
    hash_2[:who_facilitated] = ['Facilitator Ernie']
    hash_2[:how_clearly_presented] = {'Facilitator Ernie': 'Extremely clearly'}
    hash_2[:how_interesting] = {'Facilitator Ernie': 'Extremely interesting'}
    hash_2[:how_often_given_feedback] = {'Facilitator Ernie': 'All the time'}
    hash_2[:help_quality] = {'Facilitator Ernie': 'Extremely good'}
    hash_2[:how_comfortable_asking_questions] = {'Facilitator Ernie': 'Extremely comfortable'}
    hash_2[:how_often_taught_new_things] = {'Facilitator Ernie': 'All the time'}
    hash_2[:things_facilitator_did_well] = {'Facilitator Ernie': 'Ernie was very fun'}
    hash_2[:things_facilitator_could_improve] = {'Facilitator Ernie': 'Ernie did not put down the ducky'}
    create :pd_local_summer_workshop_survey, form_data: hash_2.to_json, pd_enrollment: enrollment_2

    enrollment_3 = create :pd_enrollment
    hash_3 = build :pd_local_summer_workshop_survey_hash
    hash_3[:how_much_learned] = 'A little bit'
    hash_3[:who_facilitated] = ['Facilitator Ernie']
    hash_3[:how_clearly_presented] = {'Facilitator Ernie': 'Not at all clearly'}
    hash_3[:how_interesting] = {'Facilitator Ernie': 'Extremely interesting'}
    hash_3[:how_often_given_feedback] = {'Facilitator Ernie': 'All the time'}
    hash_3[:help_quality] = {'Facilitator Ernie': 'Extremely good'}
    hash_3[:how_comfortable_asking_questions] = {'Facilitator Ernie': 'Extremely comfortable'}
    hash_3[:how_often_taught_new_things] = {'Facilitator Ernie': 'All the time'}
    hash_3[:things_facilitator_did_well] = {'Facilitator Ernie': 'Ernie was a good saxophone player'}
    hash_3[:things_facilitator_could_improve] = {'Facilitator Ernie': 'Ernie was disorganized'}
    create :pd_local_summer_workshop_survey, form_data: hash_3.to_json, pd_enrollment: enrollment_3

    workshops = [enrollment_1.workshop, enrollment_2.workshop, enrollment_3.workshop]
    workshops.each {|w| w.update(course: Pd::Workshop::COURSE_CSP, subject: Pd::Workshop::SUBJECT_CSP_SUMMER_WORKSHOP)}
    create :pd_enrollment, workshop: workshops.first

    result_hash = summarize_workshop_surveys(workshops)
    assert_equal 4, result_hash[:num_enrollments]
    assert_equal 3, result_hash[:num_surveys]
    assert_equal 4, result_hash[:how_much_learned]
    assert_equal ['venue feedback', 'venue feedback', 'venue feedback'], result_hash[:venue_feedback]
    assert_equal [['Facilitator Bert'], ['Facilitator Ernie'], ['Facilitator Ernie']], result_hash[:who_facilitated]
    assert_equal({'Facilitator Bert' => 5.0, 'Facilitator Ernie' => 3.0}, result_hash[:how_clearly_presented])
    assert_equal({'Facilitator Bert' => ['Bert was very strict'], 'Facilitator Ernie' => ['Ernie did not put down the ducky', 'Ernie was disorganized']}, result_hash[:things_facilitator_could_improve])

    result_hash = summarize_workshop_surveys(workshops, 'Facilitator Ernie')
    assert_equal 4.0, result_hash[:how_much_learned]
    assert_equal ['venue feedback', 'venue feedback', 'venue feedback'], result_hash[:venue_feedback]
    assert_equal [['Facilitator Bert'], ['Facilitator Ernie'], ['Facilitator Ernie']], result_hash[:who_facilitated]
    assert_equal 3.0, result_hash[:how_clearly_presented]
    assert_equal ['Ernie did not put down the ducky', 'Ernie was disorganized'], result_hash[:things_facilitator_could_improve]

    result_hash = summarize_workshop_surveys(workshops, nil, false)
    assert_equal 3.67, result_hash[:how_clearly_presented]
  end

  test 'get an error if summarizing a mix of workshop surveys' do
    assert_raise RuntimeError do
      summarize_workshop_surveys(
        [create(:pd_local_summer_workshop_survey).pd_enrollment.workshop, create(:pd_teachercon_survey).pd_enrollment.workshop],
        Pd::TeacherconSurvey.options
      )
    end
  end
end
