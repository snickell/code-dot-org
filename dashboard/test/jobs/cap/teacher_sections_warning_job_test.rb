# frozen_string_literal: true

require 'test_helper'

class CAP::TeacherSectionsWarningJobTest < ActiveJob::TestCase
  describe '.perform_later' do
    subject(:perform_later) {described_class.perform_later}

    let(:student_aga_gate_start_date) {30.days.ago}
    let(:teacher_email) {Faker::Internet.unique.email}
    let(:teacher_name) {Faker::Name.unique.name}
    let(:section_name) {Faker::Educator.unique.course_name}
    let(:section_hidden) {false}

    let(:teacher) {create(:teacher, email: teacher_email, name: teacher_name)}
    let(:section) {create(:section, user: teacher, name: section_name, hidden: section_hidden)}
    let(:student) {create(:cpa_non_compliant_student, :in_grace_period, cap_status_date: student_aga_gate_start_date)}

    let(:expect_teacher_warning_to_be_sent) do
      MailJet.expects(:send_email).with(
        :cap_section_warning,
        teacher_email,
        teacher_name,
        vars: {
          capSections: [
            Name: section_name,
            Link: "//test-studio.code.org/teacher_dashboard/sections/#{section.id}/manage_students"
          ],
        },
      )
    end
    let(:expect_event_logging) do
      Metrics::Events.expects(:log_event).with(
        event_name: 'cap_teacher_sections_warning',
        metadata: {
          teacher_id: teacher.id,
          cap_section_ids: [section.id],
        },
      )
    end

    around do |test|
      Timecop.freeze {test.call}
    end

    before do
      create(:follower, section: section, student_user: student)
    end

    it 'enqueues job to "default" queue' do
      assert_enqueued_with(job: described_class, queue: 'default') do
        perform_later
      end
    end

    it 'send an email using MailJet with expected arguments' do
      expect_teacher_warning_to_be_sent.once
      perform_enqueued_jobs {perform_later}
    end

    it 'logs event' do
      expect_event_logging.once
      perform_enqueued_jobs {perform_later}
    end

    context 'when the first attempt raises TooManyRequests' do
      let(:exception) {RestClient::TooManyRequests}

      it 'it will try to send the email again' do
        expect_teacher_warning_to_be_sent.twice.raises(exception).then.returns(nil)
        perform_enqueued_jobs {perform_later}
      end
    end

    context 'when StandardError is raised' do
      let(:exception) {StandardError.new('expected_exception')}

      before do
        expect_teacher_warning_to_be_sent.raises(exception)
      end

      it 'rescues from exception with #report_exception' do
        described_class.any_instance.expects(:report_exception).with(exception).once
        expect_event_logging.never
        perform_enqueued_jobs {perform_later}
      end
    end

    context 'when student is age-gated for more than 30 days' do
      let(:student_aga_gate_start_date) {30.days.ago - 1.second}

      it 'does not warn teacher' do
        expect_teacher_warning_to_be_sent.never
        expect_event_logging.never
        perform_enqueued_jobs {perform_later}
      end
    end

    context 'when student has parental permission' do
      let(:student) {create(:student, :with_parent_permission, cap_status_date: student_aga_gate_start_date)}

      it 'does not warn teacher' do
        expect_teacher_warning_to_be_sent.never
        expect_event_logging.never
        perform_enqueued_jobs {perform_later}
      end
    end

    context 'when section is hidden (archived)' do
      let(:section_hidden) {true}

      it 'does not warn teacher' do
        expect_teacher_warning_to_be_sent.never
        expect_event_logging.never
        perform_enqueued_jobs {perform_later}
      end
    end

    # We have legacy teacher accounts which don't have a plaintext email
    context 'teacher email is blank' do
      let(:teacher) {create(:teacher, :without_email, name: teacher_name)}

      it 'does not warn teacher' do
        expect_teacher_warning_to_be_sent.never
        expect_event_logging.never
        perform_enqueued_jobs {perform_later}
      end
    end
  end
end
