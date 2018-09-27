require 'test_helper'

module Pd::Application
  class PrincipalApproval1920ApplicationTest < ActiveSupport::TestCase
    test 'does not require user or status' do
      application = build :pd_principal_approval1920_application, user: nil, status: nil, approved: 'Yes'
      assert application.valid?
    end

    test 'does not require answers for school demographic data if application is rejected' do
      application = build :pd_principal_approval1920_application, approved: 'No'
      assert application.valid?
      application.update_form_data_hash({do_you_approve: 'Yes'})
      refute application.valid?
    end

    test 'requires csp/csd replacement course info if a course is being replaced' do
      application = build :pd_principal_approval1920_application, replace_course: Pd::Application::PrincipalApproval1920Application::REPLACE_COURSE_NO
      assert application.valid?
      application.update_form_data_hash({replace_course: 'Yes'})
      refute application.valid?
    end

    test 'do not require anything if placeholder' do
      application = build :pd_principal_approval1920_application, form_data: {}.to_json
      assert application.valid?
    end

    test 'underrepresented minority percent' do
      application = build :pd_principal_approval1920_application
      application.update_form_data_hash(
        {
          black: '10',
          hispanic: '15%',

          pacific_islander: '20.5%',
          american_indian: '11.0',
          white: '100000000',

          asian: '100000000',
          other: '100000000'
        }
      )
      assert_equal 56.5, application.underrepresented_minority_percent
    end

    test 'corresponding teacher application is required' do
      principal_application = build :pd_principal_approval1920_application, teacher_application: nil
      refute principal_application.valid?
      assert_equal ['Teacher application is required'], principal_application.errors.full_messages

      # fake guid won't work
      principal_application.application_guid = SecureRandom.uuid
      refute principal_application.valid?

      # real teacher application guid is required
      teacher_application = create :pd_teacher1920_application
      principal_application.application_guid = teacher_application.application_guid
      assert principal_application.valid?
    end

    test 'create placeholder and send mail creates a placeholder and sends principal approval' do
      teacher_application = create :pd_teacher1920_application
      Pd::Application::Teacher1920ApplicationMailer.expects(:principal_approval).
        with(instance_of(Pd::Application::Teacher1920Application)).
        returns(mock {|mail| mail.expects(:deliver_now)})

      assert_creates Pd::Application::PrincipalApproval1920Application do
        Pd::Application::PrincipalApproval1920Application.create_placeholder_and_send_mail(teacher_application)
      end

      assert Pd::Application::PrincipalApproval1920Application.last.placeholder?
    end
  end
end
