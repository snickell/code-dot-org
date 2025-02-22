module Curriculum
  module SharedCourseConstants
    # Used to determine who can access curriculum content
    PUBLISHED_STATE = OpenStruct.new(
      {
        in_development: "in_development",
        pilot: "pilot",
        beta: "beta",
        preview: "preview",
        stable: "stable",
        sunsetting: "sunsetting",
        deprecated: "deprecated"
      }
    ).freeze

    # Used to determine style a course is taught in
    INSTRUCTION_TYPE = OpenStruct.new(
      {
        teacher_led: "teacher_led",
        self_paced: "self_paced"
      }
    ).freeze

    # Used to determine who can teach a course
    INSTRUCTOR_AUDIENCE = OpenStruct.new(
      {
        universal_instructor: "universal_instructor",
        plc_reviewer: "plc_reviewer",
        facilitator: "facilitator",
        teacher: "teacher"
      }
    ).freeze

    # Used to determine who the learners are in a course
    PARTICIPANT_AUDIENCE = OpenStruct.new(
      {
        facilitator: "facilitator",
        teacher: "teacher",
        student: "student"
      }
    ).freeze

    # An allowlist of all curriculum umbrellas for scripts.
    CURRICULUM_UMBRELLA = OpenStruct.new(
      {
        CSF: 'CSF',
        CSD: 'CSD',
        CSP: 'CSP',
        CSA: 'CSA',
        HOC: 'HOC',
        foundations_of_cs: 'Foundations of CS and AI',
        foundations_of_programming: 'Foundations of Programming',
        CSC_K_5: 'CSC K-5',
        CSC_6_8: 'CSC 6-8',
        CSC_9_12: 'CSC 9-12',
        special_topics_k_5: 'K-5 Special topics',
        special_topics_6_8: '6-8 Special topics',
        special_topics_9_12: '9-12 Special topics',
        pd_for_facilitators: 'PD for Facilitators',
        pd_workshop_activity_csf: 'PD Workshop Activity CSF',
        pd_workshop_activity_csd: 'PD Workshop Activity CSD',
        pd_workshop_activity_csp: 'PD Workshop Activity CSP',
        pd_workshop_activity_csa: 'PD Workshop Activity CSA',
        CSA_self_paced_pl: 'Self-paced PL - CSA',
        CSP_self_paced_pl: 'Self-paced PL - CSP',
        CSD_self_paced_pl: 'Self-paced PL - CSD',
        CSF_self_paced_pl: 'Self-paced PL - CSF',
        CSC_k_5_self_paced_pl: 'Self-paced PL - CSC K-5',
        foundations_of_cs_selfpaced_pl: 'Self-paced PL - Foundations of CS and AI',
        ai_for_teachers_selfpaced_pl: 'Self-paced PL - AI for teachers',
        special_topics_curriculum_selfpaced_pl_k_5: 'Self-paced PL - K-5 special topics',
        special_topics_curriculum_selfpaced_pl_6_8: 'Self-paced PL - 6-8 special topics',
        special_topics_curriculum_selfpaced_pl_9_12: 'Self-paced PL - 9-12 special topics',
        pedagogy_special_topics_selfpaced_pl: 'Self-paced PL - Pedagogy special topics',
        cs_basics_selfpaced_pl: 'Self-paced PL - CS Basics',
        other: 'Other'
      }
    ).freeze

    # An allowlist of all topic tags that can be applied for units.
    CURRICULUM_TOPIC_TAGS = OpenStruct.new(
      {
        ai: 'AI',
        maker: 'Maker',
        music_lab: 'Music lab',
        survey: 'Survey',
        data_science: 'Data Science'
      }
    ).freeze

    # A list of all content area categories that can be set to units.
    CURRICULUM_CONTENT_AREA = OpenStruct.new(
      {
        curriculum_k_5: 'K-5 Curriculum',
        curriculum_6_8: '6-8 Curriculum',
        curriculum_9_12: '9-12 Curriculum',
        hoc: 'HOC',
        pl_workshop_activities: 'PL Workshop activities',
        self_paced_pl_k_5: 'K-5 self-paced PL',
        self_paced_pl_6_8: '6-8 self-paced PL',
        self_paced_pl_9_12: '9-12 self-paced PL',
        skills_focused_self_paced_pl: 'Skills-focused self-paced PL',
        pd_for_facilitators: 'PD for Facilitators',
        other: 'Other'
      }
    ).freeze

    # The curriculum types used in curriculum quick assign
    COURSE_OFFERING_CURRICULUM_TYPES = OpenStruct.new(
      {
        module: 'Module',
        course: 'Course',
        standalone_unit: 'Standalone Unit',
        hoc: 'Hour of Code',
        pl: 'Professional Learning'
      }
    ).freeze

    # The headers used to organize course offerings in curriculum quick assign
    COURSE_OFFERING_HEADERS = OpenStruct.new(
      {
        favorites: 'Favorites',
        labs_and_skills: 'Labs and Skills',
        minecraft: 'Minecraft',
        hello_world: 'Hello World',
        popular_media: 'Popular Media',
        sports: 'Sports',
        express: 'Express',
        csf: 'CS Fundamentals',
        csc: 'CS Connections',
        year_long: 'Year Long',
        csa_labs: 'CSA Labs',
        self_paced: 'Self-Paced',
        teacher_led: 'Teacher-Led',
        collections: 'Collections',
        workshops_k5: 'K-5 Workshops',
        summer_workshops_612: '6-12 Summer Workshops',
        virtual_academic_year_workshops_612: '6–12 Virtual Academic Year Workshops',
        unsupported: 'Unsupported'
      }
    ).freeze

    # Used in curriculum quick assign
    COURSE_OFFERING_MARKETING_INITIATIVES = OpenStruct.new(
      {
        hoc: 'HOC',
        csc: 'CSC',
        csf: 'CSF',
        csa: 'CSA',
        csp: 'CSP',
        csd: 'CSD'
      }
    )

    # CS topic field values for course offerings
    COURSE_OFFERING_CS_TOPICS = %w(
      art_and_design
      app_design
      artificial_intelligence
      cybersecurity
      data
      digital_literacy
      games_and_animations
      internet
      physical_computing
      web_design
      programming
    ).freeze

    # School subject field values for course offerings
    COURSE_OFFERING_SCHOOL_SUBJECTS = %w(
      math
      science
      english_language_arts
      history
    ).freeze

    # Device types for course offerings
    DEVICE_TYPES = %w(
      computer
      chromebook
      tablet
      mobile
      no_device
    ).freeze

    # Device compatibility levels for course offerings
    DEVICE_COMPATIBILITY_LEVELS = %w(
      ideal
      not_recommended
      incompatible
    ).freeze

    # Sections have a participant_type and courses have a participant_audience. A section
    # should never be assigned a course where the participants in the section can not be
    # participants in the course. There this will tell you give the participant_audience of the
    # course what the valid participant_types of a section are.
    PARTICIPANT_AUDIENCES_BY_TYPE = OpenStruct.new(
      {
        student: ['student'],
        teacher: ['student', 'teacher'],
        facilitator: ['student', 'teacher', 'facilitator']
      }
    ).freeze
  end
end
