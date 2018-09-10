module Pd::Application
  class PrincipalApprovalApplicationBase < ApplicationBase
    include Pd::PrincipalApprovalCommonApplicationConstants

    # Implement in derived class.
    # @return a valid year (see ApplicationConstants.APPLICATION_YEARS)
    def year
      raise 'Abstract method must be overridden by inheriting class'
    end

    # @override
    def set_type_and_year
      self.application_type = PRINCIPAL_APPROVAL_APPLICATION
      self.application_year = year
    end

    REPLACE_COURSE_NO = "No, this course will be added to the schedule, but it won't replace an existing computer science course"
    def self.options
      {
        title: COMMON_OPTIONS[:title],
        school_state: COMMON_OPTIONS[:state],
        school_type: COMMON_OPTIONS[:school_type],
        do_you_approve: [YES, NO, TEXT_FIELDS[:other_with_text]],
        committed_to_master_schedule: [YES, NO, TEXT_FIELDS[:other_with_text]],
        hours_per_year: COMMON_OPTIONS[:course_hours_per_year],
        terms_per_year: COMMON_OPTIONS[:terms_per_year],
        replace_course: [
          YES,
          REPLACE_COURSE_NO,
          TEXT_FIELDS[:dont_know_explain]
        ],
        replace_which_course_csp: [
          'Beauty and Joy of Computing',
          'CodeHS',
          'Computer Applications (ex: using Microsoft programs)',
          'CS50',
          'Exploring Computer Science',
          'Intro to Computer Science',
          'Intro to Programming',
          'Mobile CSP',
          'Project Lead the Way - Computer Science',
          'UTeach CSP',
          'Web Development',
          'We’ve created our own course',
          TEXT_FIELDS[:other_please_explain]
        ],
        replace_which_course_csd: [
          'CodeHS',
          'Codesters',
          'Computer Applications (ex: using Microsoft programs)',
          'CS Fundamentals',
          'Exploring Computer Science',
          'Globaloria',
          'My CS',
          'Project Lead the Way - Computer Science',
          'Robotics',
          'ScratchEd',
          'Typing',
          'We’ve created our own course',
          TEXT_FIELDS[:other_please_explain]
        ],
        committed_to_diversity: [YES, NO, TEXT_FIELDS[:other_please_explain]],
        pay_fee: [
          'Yes, my school or my teacher will be able to pay the full summer workshop program fee.',
          'No, my school or my teacher will not be able to pay the summer workshop program fee.',
          'Not applicable: there is no fee for the summer workshop for teachers in my region.'
        ]
      }
    end

    def dynamic_required_fields(hash)
      [].tap do |required|
        unless hash.empty?
          required.concat [
            :first_name,
            :last_name,
            :email,
            :do_you_approve,
            :confirm_principal
          ]

          unless hash[:do_you_approve] == NO
            required.concat [
              :total_student_enrollment,
              :free_lunch_percent,
              :white,
              :black,
              :hispanic,
              :asian,
              :pacific_islander,
              :american_indian,
              :other,
              :committed_to_master_schedule,
              :hours_per_year,
              :terms_per_year,
              :replace_course,
              :committed_to_diversity,
              :understand_fee,
              :pay_fee
            ]

            if hash[:replace_course] == YES
              if course == 'csd'
                required << :replace_which_course_csd
              elsif course == 'csp'
                required << :replace_which_course_csp
              end
            end
          end
        end
      end
    end

    def additional_text_fields
      [
        [:committed_to_master_schedule],
        [:replace_course, TEXT_FIELDS[:dont_know_explain], :replace_course_other],
        [:committed_to_diversity, TEXT_FIELDS[:other_please_explain], :committed_to_diversity_other],
        [:replace_which_course_csd, TEXT_FIELDS[:other_please_explain], :replace_which_course_csd_other],
        [:replace_which_course_csp, TEXT_FIELDS[:other_please_explain], :replace_which_course_csp_other],
        [:do_you_approve]
      ]
    end

    def underrepresented_minority_percent
      sanitize_form_data_hash.select do |k, _|
        [
          :black,
          :hispanic,
          :pacific_islander,
          :american_indian
        ].include? k
      end.values.map(&:to_f).reduce(:+)
    end

    def placeholder?
      JSON.parse(form_data).empty?
    end
  end
end
