// Analytics constants used within the apps directory.
// (See pegasus/helpers/analytics_constants.rb for constants in the
// pegasus directory)
const PLATFORMS = {
  AMPLITUDE: 'Amplitude',
  STATSIG: 'Statsig',
  BOTH: 'Both',
};

const EVENTS = {
  // Sign-up flow
  ACCOUNT_TYPE_PICKED_EVENT: 'Account Type Picked',
  SIGN_UP_STARTED_EVENT: 'Sign Up Started',
  SIGN_UP_LOGIN_TYPE_PICKED_EVENT: 'User Login Type Picked',
  SIGN_UP_FINISHED_EVENT: 'Sign Up Finished',
  SECTION_SETUP_SIGN_IN_EVENT: 'Section Setup Sign In',
  ABANDON_SECTION_SETUP_SIGN_IN_EVENT: 'Abandon Section Setup Sign In',
  TEACHER_LOGIN_EVENT: 'Teacher Login',
  STUDENT_LOGIN_EVENT: 'Student Login',
  ACCOUNT_SETTINGS_PAGE_VISITED: 'Account Settings Page Visited',
  LOGIN_PAGE_VISITED: 'Login Page Visited',
  LOGIN_PAGE_CREATE_ACCOUNT_CLICKED: 'Login Page Create Account Button Clicked',
  CURRICULUM_FREE_DIALOG_BUTTON_CLICKED:
    'Curriculum Free Dialog Button Clicked',
  LMS_INFORMATION_BUTTON_CLICKED: 'LMS Information Button Clicked',
  PARENT_OR_GUARDIAN_SIGN_UP_CLICKED: 'Parent or Guardian Sign Up Clicked',
  FINISH_ACCOUNT_PAGE_LOADED: 'Finish Account Page Loaded',

  // School Association
  // Update School Info Dialog
  UPDATE_SCHOOL_INFO_DIALOG_SHOWN: 'Update School Info Dialog Shown',
  UPDATE_SCHOOL_INFO_DIALOG_CLOSED: 'Update School Info Dialog Closed',
  CONFIRM_SCHOOL_CLICKED: 'Confirm School Clicked',
  UPDATE_SCHOOL_CLICKED: 'Update School Clicked',

  // School Interstitial
  SCHOOL_INTERSTITIAL_SHOW: 'School Interstitial Shown',
  SCHOOL_INTERSTITIAL_SUBMIT: 'School Interstitial Submitted',
  SCHOOL_INTERSTITIAL_SAVE_SUCCESS: 'School Interstitial Save Success',
  SCHOOL_INTERSTITIAL_SAVE_FAILURE: 'School Interstitial Save Failure',
  SCHOOL_INTERSTITIAL_DISMISS: 'School Interstitial Dismissed',

  // Child Account Policy
  CAP_STATE_FORM_SHOW: 'CAP State Form Shown',
  CAP_STATE_FORM_PROVIDED: 'CAP State Form Submitted',
  CAP_STATE_FORM_DISMISSED: 'CAP State Form Sign Out Button Clicked',
  CAP_PARENT_CONSENT_EXPIRED: 'CAP Parent Consent Expired',
  CAP_PARENT_CONSENT_GRANTED: 'CAP Parent Consent Granted',
  CAP_PARENT_EMAIL_BANNER_SHOWN: 'CAP Parent Email Banner Shown',
  CAP_PARENT_EMAIL_BANNER_CLICKED: 'CAP Parent Email Banner Clicked',
  CAP_PARENT_EMAIL_MODAL_SHOWN: 'CAP Parent Email Modal Shown',
  CAP_PARENT_EMAIL_MODAL_CLOSED: 'CAP Parent Email Modal Closed',
  CAP_LOCKOUT_SHOWN: 'CAP Lockout Shown',
  CAP_LOCKOUT_SIGN_OUT: 'CAP Lockout Sign Out',
  CAP_LOCKOUT_EMAIL_SUBMITTED: 'CAP Lockout Email Submitted',
  CAP_LOCKOUT_EMAIL_UPDATED: 'CAP Lockout Email Updated',
  CAP_LOCKOUT_EMAIL_RESEND: 'CAP Lockout Email Resend',
  CAP_PARENT_EMAIL_SUBMITTED: 'CAP Parent Email Submitted',
  CAP_PARENT_EMAIL_UPDATED: 'CAP Parent Email Updated',
  CAP_PARENT_EMAIL_RESEND: 'CAP Parent Email Resend',
  CAP_AGE_GATED_MODAL_SHOWN: 'CAP Teacher Students Warning Modal Shown',
  CAP_AGE_GATED_MODAL_CLOSED: 'CAP Teacher Students Warning Modal Closed',
  CAP_SETTINGS_SHOWN: 'CAP Settings Shown',
  CAP_SETTINGS_EMAIL_SUBMITTED: 'CAP Settings Email Submitted',
  CAP_SETTINGS_EMAIL_UPDATED: 'CAP Settings Email Updated',
  CAP_SETTINGS_EMAIL_RESEND: 'CAP Settings Email Resend',
  CAP_STUDENT_WARNING_LINK_CLICKED:
    'CAP Teacher Students Warning Modal Documentation Clicked',
  CAP_AGE_GATED_BANNER_SHOWN: 'CAP Teacher Students Banner Shown',
  CAP_AGE_GATED_SECTIONS_BANNER_SHOWN: 'CAP Teacher Sections Banner Shown',
  CAP_AGE_GATED_SECTIONS_MODAL_SHOWN:
    'CAP Teacher Sections Warning Modal Shown',
  CAP_AGE_GATED_SECTIONS_MODAL_CLOSED:
    'CAP Teacher Sections Warning Modal Closed',
  CAP_AGE_GATED_SECTIONS_TABLE_SECTION_NAME_LINK_CLICKED:
    'CAP Teacher Sections Table Section Name Clicked',

  // School Selection Component
  COUNTRY_SELECTED: 'User Selects Country',
  ZIP_CODE_ENTERED: 'Valid Zip Code Entered',
  SCHOOL_SEARCH_INPUT_ENTERED: 'School Search Input Entered',
  SCHOOL_SELECTED_FROM_LIST: 'School Selected from Dropdown',
  ADD_MANUALLY_CLICKED: 'User Elects to Add School Name Manually',
  DO_NOT_TEACH_AT_SCHOOL_CLICKED:
    'User Clicks I Do Not Teach In A School Setting',

  // Course/Unit info
  COURSE_OVERVIEW_PAGE_VISITED_BY_TEACHER_EVENT:
    'Course Overview Page Visited By Teacher',
  COURSE_OVERVIEW_PAGE_VISITED_BY_STUDENT_EVENT:
    'Course Overview Page Visited By Student',
  COURSE_OVERVIEW_PAGE_VISITED_BY_SIGNED_OUT_USER_EVENT:
    'Course Overview Page Visited By Signed Out User',
  UNIT_OVERVIEW_PAGE_VISITED_BY_TEACHER_EVENT:
    'Unit Overview Page Visited By Teacher',
  UNIT_OVERVIEW_PAGE_VISITED_BY_STUDENT_EVENT:
    'Unit Overview Page Visited By Student',
  UNIT_OVERVIEW_PAGE_VISITED_BY_SIGNED_OUT_USER_EVENT:
    'Unit Overview Page Visited By Signed Out User',
  TRY_NOW_BUTTON_CLICK_EVENT: 'Try Now Button Clicked',

  // Lesson info
  LESSON_OVERVIEW_PAGE_VISITED_EVENT: 'Lesson Overview Page Visited',
  LESSON_RESOURCE_LINK_VISITED_EVENT: 'Lesson Resource Link Visited',

  // Workshop enrollment
  WORKSHOP_ENROLLMENT_COMPLETED_EVENT: 'Workshop Enrollment Completed',

  // PD Application flow
  TEACHER_APP_VISITED_EVENT: '6-12 Teacher Application Visited',
  PAGE_CHANGED_EVENT: 'Page Changed',
  PROGRAM_PICKED_EVENT: 'Professional Learning Program Picked',
  SCHOOL_ID_CHANGED_EVENT: 'School ID Changed',
  RP_FOUND_EVENT: 'Regional Partner Found',
  APPLICATION_SAVED_EVENT: 'Application Saved',
  APPLICATION_SUBMITTED_EVENT: 'Application Submitted',
  APP_STATUS_CHANGE_EVENT: 'Application Status Changed',
  ADMIN_APPROVAL_RECEIVED_EVENT: 'Administrator Approval Received',
  SUBMIT_RP_CONTACT_FORM_EVENT: 'Submit Regional Partner Contact Form',
  RP_LANDING_PAGE_VISITED_EVENT: 'Regional Partner Landing Page Visited',

  // Marketing site pages
  ADMIN_INTEREST_FORM_SUBMIT_EVENT: 'Administrator Interest Form Submitted',

  // Amazon future engineer
  AFE_START: 'AFE Start',
  AFE_SIGN_IN_BUTTON_PRESS: 'AFE Sign In Button Press',
  AFE_SIGN_UP_BUTTON_PRESS: 'AFE Sign Up Button Press',
  AFE_SUBMIT_SCHOOL_INFO: 'AFE Submit School Info',
  AFE_INELIGIBLE: 'AFE Ineligible',
  AFE_CONTINUE: 'AFE Continue',
  AFE_SUBMIT: 'AFE Submit',
  AFE_HOMEPAGE_BANNER_SUBMIT: 'AFE Teacher Homepage Banner Submitted',

  // Sections
  SECTION_SETUP_COMPLETED: 'Section Setup Completed',
  CURRICULUM_ASSIGNED: 'Section Curriculum Assigned',
  PROGRESS_VIEWED: 'Section Progress Viewed',
  PROGRESS_VIEWED_FIXED: 'Accurate V1 Section Progress Viewed',
  PROGRESS_TOGGLE: 'Section Progress Toggled',
  PROGRESS_CHANGE_UNIT: 'Section Progress Unit Changed',
  PROGRESS_JUMP_TO_LESSON: 'Section Progress Jump to Lesson',
  SORT_BY_FAMILY_NAME: 'Sorted by family name',
  SORT_BY_DISPLAY_NAME: 'Sorted by display name',

  // Section table on teacher My Dashboard
  SECTION_TABLE_PRINT_LOGIN_CARDS_CLICKED:
    'Section table print login cards clicked',
  SECTION_TABLE_JOIN_INSTRUCTIONS_CLICKED:
    'Section table join instructions clicked',
  SECTION_TABLE_EDIT_SECTION_DETAILS_CLICKED:
    'Section table edit section details clicked',
  SECTION_TABLE_VIEW_PROGRESS_CLICKED: 'Section table view progress clicked',
  SECTION_TABLE_MANAGE_STUDENTS_CLICKED:
    'Section table manage students clicked',
  SECTION_TABLE_ARCHIVE_SECTION_CLICKED:
    'Section table archive section clicked',
  SECTION_TABLE_RESTORE_SECTION_CLICKED:
    'Section table restore section clicked',
  SECTION_TABLE_DELETE_SECTION_CLICKED: 'Section table delete section clicked',
  SECTION_TABLE_PRINT_CERTIFICATES_CLICKED:
    'Section table print certificates clicked',
  SECTION_TABLE_SYNC_GOOGLE_CLASSROOM_CLICKED:
    'Section table sync google classroom clicked',
  SECTION_TABLE_SYNC_CLEVER_CLICKED: 'Section table sync clever clicked',

  // Section students table on teacher My Dashboard
  SECTION_STUDENTS_TABLE_US_STATE_SET: 'Section students table US state set',
  SECTION_STUDENTS_TABLE_US_STATE_BULK_SET:
    'Section students table US state bulk set',
  SECTION_STUDENTS_TABLE_ADD_ROW_CLICKED:
    'Section students table add row clicked',
  SECTION_STUDENTS_TABLE_SAVE_ROW_CLICKED:
    'Section students table save row clicked',
  SECTION_STUDENTS_TABLE_SAVE_ALL_CLICKED:
    'Section students table save all clicked',

  // Section progress v2
  PROGRESS_V2_VIEW: 'Section New Progress Viewed ',
  PROGRESS_V2_VIEW_NEW_PROGRESS: 'New Progress Link Clicked',
  PROGRESS_V2_VIEW_OLD_PROGRESS: 'Old Progress Link Clicked',
  PROGRESS_V2_CHANGE_UNIT: 'Section New Progress Unit Changed',
  PROGRESS_V2_LESSON_EXPAND: 'Section New Progress Lesson Expand',
  PROGRESS_V2_LESSON_COLLAPSE: 'Section New Progress Lesson Collapse',
  PROGRESS_V2_EXPAND_CHOICE_LEVEL: 'Section New Progress Choice Expand',
  PROGRESS_V2_COLLAPSE_CHOICE_LEVEL: 'Section New Progress Choice Collapse',
  PROGRESS_V2_EXPAND_ICON_KEY: 'Section New Progress Icon Key Expand',
  PROGRESS_V2_COLLAPSE_ICON_KEY: 'Section New Progress Icon Key Collapse',
  PROGRESS_V2_VIEW_MORE_DETAILS: 'Section New Progress More Details',
  PROGRESS_V2_VIEW_LEVEL_DETAILS: 'Section New Progress Level Details',
  PROGRESS_V2_ACCEPT_INVITATION: 'Section Progress Invitation Modal Accept',
  PROGRESS_V2_DISMISS_INVITATION: 'Section Progress Invitation Modal Dismiss',
  PROGRESS_V2_DELAY_INVITATION:
    'Section Progress Invitation Modal Remind Later',
  PROGRESS_V2_SEEN_INVITATION: 'Section Progress Invitation Modal seen by user',
  PROGRESS_V2_ONE_ROW_EXPANDED: 'Section New Progress One Student Row Expanded',
  PROGRESS_V2_ALL_ROWS_EXPANDED:
    'Section New Progress All Student Rows Expanded',
  PROGRESS_V2_ONE_ROW_COLLAPSED:
    'Section New Progress One Student Row Collapsed',
  PROGRESS_V2_ALL_ROWS_COLLAPSED:
    'Section New Progress All Student Rows Collapsed',

  // Levels
  FEEDBACK_SUBMITTED: 'Level Feedback Submitted',
  RUBRIC_LEVEL_VIEWED_EVENT: 'Rubric Level Viewed',
  RUBRIC_ACTIVITY: 'Rubric Activity',
  TEACHER_VIEWING_STUDENT_WORK: 'Teacher Viewing Student Work',
  SUMMARY_PAGE_LOADED: 'Summary Page Loaded',
  SUMMARY_PAGE_NEXT_LEVEL_CLICKED: 'Summary Page Next Level Clicked',
  SUMMARY_PAGE_BACK_TO_LEVEL_CLICKED: 'Summary Page Back To Level Clicked',
  LEVEL_ACTIVITY: 'Level Activity',

  // Projects
  PROJECT_ACTIVITY: 'Project Activity',

  // Check for understanding
  CFU_NAMES_TOGGLED_ON: 'Summary Page Names Toggled On',
  CFU_NAMES_TOGGLED_OFF: 'Summary Page Names Toggled Off',
  CFU_RESPONSE_HIDDEN: 'Summary Page Response Hidden',
  CFU_RESPONSE_PINNED: 'Summary Page Response Pinned',
  CFU_RESPONSE_UNPINNED: 'Summary Page Response Unpinned',
  CFU_RESPONSE_ALL_UNHID: 'Summary Page Response Hidden Responses Unhidden',
  CFU_RESPONSE_ALL_UNPINNED: 'Summary Page Response All Unpinned',

  // Maker setup
  MAKER_SETUP_PAGE_BOARD_TYPE_EVENT: 'Board Type On Maker Setup Page',
  MAKER_SETUP_PAGE_MB_VERSION_EVENT: 'Microbit Version',
  MAKER_SETUP_PAGE_MB_UPDATE_ERROR_EVENT: 'Microbit Software Update Error',

  // Curriculum Catalog page
  CURRICULUM_CATALOG_VISITED_EVENT: 'Curriculum Catalog Visited',
  CURRICULUM_CATALOG_ASSIGN_CLICKED_EVENT: 'Assign Clicked',
  CURRICULUM_CATALOG_SIGN_IN_CLICKED_IN_ASSIGN_DIALOG:
    'Sign In Or Create Account Clicked In Assign Dialog',
  CURRICULUM_CATALOG_ASSIGN_COMPLETED_EVENT:
    'Course Offering Assignment Completed',
  CURRICULUM_CATALOG_DROPDOWN_FILTER_SELECTED_EVENT: 'Filter Selected',
  CURRICULUM_CATALOG_TOGGLE_LANGUAGE_FILTER_EVENT:
    'Show Only Translated Curriculums Toggled',
  CURRICULUM_CATALOG_NO_AVAILABLE_CURRICULA_EVENT:
    'No Available Curriculums Message Shown',
  CURRICULUM_CATALOG_QUICK_VIEW_CLICKED_EVENT: 'Quick View Clicked',

  // Rubrics
  TA_RUBRIC_OPENED_FROM_FAB_EVENT: 'TA Rubric Opened From FAB',
  TA_RUBRIC_CLOSED_FROM_FAB_EVENT: 'TA Rubric Closed From FAB',
  TA_RUBRIC_OPEN_ON_PAGE_LOAD: 'TA Rubric Open on Page Load',
  TA_RUBRIC_CLOSED_ON_PAGE_LOAD: 'TA Rubric Closed on Page Load',
  TA_RUBRIC_LEARNING_GOAL_EXPANDED_EVENT: 'TA Rubric Learning Goal Expanded',
  TA_RUBRIC_LEARNING_GOAL_COLLAPSED_EVENT: 'TA Rubric Learning Goal Collapsed',
  TA_RUBRIC_ON_STUDENT_WORK_LOADED: 'TA Rubric On Student Work Loaded',
  TA_RUBRIC_ON_STUDENT_WORK_UNLOADED: 'TA Rubric On Student Work Unloaded',
  TA_RUBRIC_SUBMITTED: 'TA Rubric Submitted',
  TA_RUBRIC_SUBMITTEED_WRITTEN_FEEDBACK:
    'TA Rubric Submitted Written Feedback To Student',
  TA_RUBRIC_EVIDENCE_LEVEL_SELECTED: 'TA Rubric Evidence Level Selected',
  TA_RUBRIC_RUN_BUTTON_CLICKED:
    'TA Rubric Teacher clicked RUN button on student work',
  TA_RUBRIC_LEARNING_GOAL_SELECTED: 'TA Rubric Learning Goal Selected',
  TA_RUBRIC_DROPDOWN_STUDENT_SELECTED: 'TA Rubric Student Switched',
  TA_RUBRIC_CSV_DOWNLOADED: 'TA Rubric CSV Downloaded',
  TA_RUBRIC_INDIVIDUAL_AI_EVAL: 'TA Rubric Individual AI Eval Requested',
  TA_RUBRIC_SECTION_AI_EVAL: 'TA Rubric Section AI Eval Requested',
  TA_RUBRIC_AI_PAGE_VISITED: 'TA Rubric AI Level Page Visited',
  TA_RUBRIC_STUDENT_AI_SUBMITTED: 'TA Rubric Student AI Level Submitted',
  TA_RUBRIC_AI_EVAL_FROM_SECTION:
    'TA Rubric AI Eval started from section request',
  TA_RUBRIC_WINDOW_MOVE_START: 'TA Rubric window move start',
  TA_RUBRIC_WINDOW_MOVE_END: 'TA Rubric window move end',
  TA_RUBRIC_TOUR_STARTED: 'First view of TA Rubric product tour',
  TA_RUBRIC_TOUR_RESTARTED: 'TA Rubric product tour restart from ? button',
  TA_RUBRIC_TOUR_NEXT: 'TA Rubric product tour next button clicked',
  TA_RUBRIC_TOUR_BACK: 'TA Rubric product tour back button clicked',
  TA_RUBRIC_TOUR_CLOSED: 'TA Rubric product tour closed',
  TA_RUBRIC_TOUR_COMPLETE: 'User viewed all of TA Rubric product tour',
  TA_RUBRIC_EVIDENCE_TOOLTIP_HOVERED: 'TA Rubric Evidence Tooltip Hovered',
  TA_RUBRIC_EVIDENCE_GOTO_CLICKED: 'TA Rubric Evidence Line Number Clicked',
  TA_RUBRIC_ANNOUNCEMENT_VIEWED: 'TA Rubric Announcement Viewed',
  TA_RUBRIC_ANNOUNCEMENT_CLICKED: 'TA Rubric Announcement Clicked',
  TA_RUBRIC_ANNOUNCEMENT_DISMISSED: 'TA Rubric Announcement Dismissed',

  //AI Differentiation
  AI_DIFF_CHAT_OPENED: 'AI Differentiation Chat Opened',
  AI_DIFF_CHAT_CLOSED: 'AI Differentiation Chat Closed',
  AI_DIFF_CHAT_EVENT: 'AI Differentiation Message Event',

  // AI Tutor
  AI_TUTOR_PANEL_OPENED: 'AI Tutor Panel Opened',
  AI_TUTOR_PANEL_CLOSED: 'AI Tutor Panel Closed',
  AI_TUTOR_CHAT_EVENT: 'AI Tutor was asked a question',
  AI_TUTOR_SUGGESTED_PROMPT_NONE: 'None - general chat',
  AI_TUTOR_SUGGESTED_PROMPT_COMPILATION: 'Compilation',
  AI_TUTOR_SUGGESTED_PROMPT_VALIDATION: 'Validation',
  AI_TUTOR_DISABLED: 'Teacher disabled AI Tutor for a section',
  AI_TUTOR_ENABLED: 'Teacher enabled AI Tutor for a section',
  AI_TUTOR_FEEDBACK_SUBMITTED: 'AI Tutor Feedback Submitted',

  // Javalab
  JAVALAB_RUN_BUTTON_CLICK: 'Javalab Run Button Clicked',
  JAVALAB_TEST_BUTTON_CLICK: 'Javalab Test Button Clicked',
  JAVALAB_COMPILATION_ERROR: 'Javalab Compilation Error',
  JAVALAB_COMPILATION_SUCCESS: 'Javalab Compilation Success',
  JAVALAB_TEST_PASSED: 'Javalab Test Passed',
  JAVALAB_TEST_FAILED: 'Javalab Test Failed',

  // Hour of Code
  AGE_21_SELECTED_EVENT: 'Age 21+ Selected',
  HOC_GUIDE_DIALOG_SHOWN: 'HOC Guide Dialog Shown',
  GUIDE_SENT_EVENT: 'Guide Sent',
  HOC_ACTIVITY_START_BUTTON_CLICKED:
    'Hour of Code Activity Start Button Clicked',

  // Hour of Code - Dance Party
  DANCE_PARTY_ACTIVITY_STARTED: 'Dance Party Activity Started',
  DANCE_PARTY_LEVEL_COMPLETED: 'Dance Party Level Completed',
  DANCE_PARTY_AI_BACKGROUND_GENERATED: 'Dance Party AI Background Generated',
  DANCE_PARTY_AI_BACKGROUND_REGENERATED:
    'Dance Party AI Background Regenerated',
  DANCE_PARTY_AI_BACKGROUND_USED: 'Dance Party AI Background Used',
  DANCE_PARTY_AI_BACKGROUND_RESTARTED: 'Dance Party AI Background Restarted',
  DANCE_PARTY_AI_BACKGROUND_EDITED: 'Dance Party AI Background Edited',
  DANCE_PARTY_AI_BACKGROUND_EXPLAINED: 'Dance Party AI Background Explained',
  DANCE_PARTY_AI_EMOJI_USED: 'Dance Party AI Emoji Used',
  DANCE_PARTY_SONG_UNAVAILABLE: 'Dance Party Song Unavailable',
  DANCE_PARTY_VALIDATION: 'Dance Party Validation',
  DANCE_PARTY_AI_MODAL_CLOSED: 'Dance Party AI Modal Closed',

  // videos
  VIDEO_LOADED: 'Video Loaded',
  VIDEO_FALLBACK_LOADED: 'Video Fallback Loaded',
  VIDEO_STARTED: 'Video Started',
  VIDEO_PAUSED: 'Video Paused',
  VIDEO_ENDED: 'Video Played To Completion',

  // congrats and certificates
  BATCH_CERTIFICATES_PAGE_VIEWED: 'Batch Certificates Page Viewed',
  TEACHER_VISITED_CONGRATS_PAGE: 'Teacher Visited Congrats Page',
  CERTIFICATE_SHARED: 'Certificate Shared',
  CERTIFICATE_PRINT_PAGE_VISITED: 'Certificate Print Page Visited',

  // Coteacher
  COTEACHER_INVITE_SENT: 'Coteacher Invite Sent',
  COTEACHER_EMAIL_INVALID: 'Coteacher Email Invalid',
  COTEACHER_INVITE_ACCEPTED: 'Coteacher Invite Accepted',
  COTEACHER_INVITE_DECLINED: 'Coteacher Invite Declined',
  COTEACHER_REMOVED: 'Coteacher Removed',

  // PL Landing Page
  MY_PL_PAGE_VISITED: 'My Professional Learning Page Visited',

  // Header navigation - signed out
  SIGNED_OUT_USER_CLICKS_HEADER_LINK: 'Signed Out User Clicks Header Link',
  SIGNED_OUT_USER_CLICKS_HAMBURGER_LINK:
    'Signed Out User Clicks Hamburger Link',
  SIGNED_OUT_USER_CLICKS_HELP_MENU: 'Signed Out User Clicks Help Menu',
  CREATE_ACCOUNT_BUTTON_CLICKED: 'Create Account Button Clicked',

  // Header Create menu - signed out
  SIGNED_OUT_USER_CLICKS_CREATE_DROPDOWN:
    'Signed Out User Clicks Create Dropdown',
  SIGNED_OUT_USER_SELECTS_CREATE_DROPDOWN_OPTION:
    'Signed Out User Selects Create Dropdown Option',

  // Header navigation - signed in
  SIGNED_IN_USER_CLICKS_HEADER_LINK: 'Signed In User Clicks Header Link',
  SIGNED_IN_USER_CLICKS_HAMBURGER_LINK: 'Signed In User Clicks Hamburger Link',
  SIGNED_IN_USER_CLICKS_HAMBURGER_OPTION:
    'Signed In User Clicks Hamburger Dropdown Option',
  SIGNED_IN_USER_CLICKS_HELP_MENU: 'Signed In User Clicks Help Menu',
  SIGNED_IN_USER_CLICKS_HELP_MENU_OPTION:
    'Signed In User Clicks Help Menu Option',
  SIGNED_IN_USER_CLICKS_USER_MENU: 'Signed In User Clicks User Menu',
  SIGNED_IN_USER_CLICKS_USER_MENU_OPTION:
    'Signed In User Clicks User Menu Option',

  // Header Create menu - signed in
  SIGNED_IN_USER_CLICKS_CREATE_DROPDOWN:
    'Signed In User Clicks Create Dropdown',
  SIGNED_IN_USER_SELECTS_CREATE_DROPDOWN_OPTION:
    'Signed In User Selects Create Dropdown Option',

  // Project sharing via 'Share' button
  SHARING_DIALOG_OPEN: 'User Opens Project Share Dialog',
  SHARING_LINK_COPY: 'User Clicks Project Copy Link In Share Dialog',
  SHARING_PUBLISH: 'User Clicks Publish In Project Share Dialog',
  SHARING_FB: 'User Clicks Facebook Icon In Project Share Dialog',
  SHARING_TWITTER: 'User Clicks Twitter Icon In Project Share Dialog',
  SHARING_LINK_SEND_TO_PHONE:
    'User Clicks Send To Phone In Project Share Dialog',
  SHARING_CLOSE_ESCAPE: 'User Clicks X Or Esc Button In Project Share Dialog',

  // Project sharing via 'Finish' button
  FINISH_SHARING_LINK_COPY:
    'User Clicks Project Copy Link In Finish Congrats Dialog',
  FINISH_SHARING_PUBLISH: 'User Clicks Publish In Finish Congrats Dialog',
  FINISH_SHARING_FB: 'User Clicks Facebook Icon In Finish Congrats Dialog',
  FINISH_SHARING_TWITTER: 'User Clicks Twitter Icon In Finish Congrats Dialog',
  FINISH_SHARING_LINK_SEND_TO_PHONE:
    'User Clicks Send To Phone In Finish Congrats Dialog',
  FINISH_BUTTON_CERTIFICATE:
    'User Clicks on Finish Button in Finish Congrats Dialog - Certificate',

  // Project submission
  SHARING_DIALOG_SUBMIT_TO_BE_FEATURED:
    'User Clicks Submit To Be Featured In Share Dialog',
  SUBMIT_PROJECT_DIALOG_SUBMIT: 'User Clicks Submit In Submit Project Dialog',

  // Export app
  EXPORT_APP: 'User Exports App From Share Advanced Options',

  // Curriculumm Recommender
  RECOMMENDED_CATALOG_CURRICULUM_SHOWN: 'Recommended Catalog Curriculum Shown',
  RECOMMENDED_SIMILAR_CURRICULUM_CLICKED:
    'Recommended Similar Curriculum Clicked',
  RECOMMENDED_STRETCH_CURRICULUM_CLICKED:
    'Recommended Stretch Curriculum Clicked',

  // LTI & LMS
  LTI_UNLINK_MODAL_SHOWN: 'lti_unlink_modal_shown',
  LTI_UNLINK_CLICK: 'lti_unlink_click',
  LTI_UNLINK_CANCEL: 'lti_unlink_cancel',
  LTI_DYNAMIC_REGISTRATION_COMPLETED: 'lti_dynamic_registration_completed',
  LTI_NEW_ACCOUNT_CLICK: 'lti_new_account_click',

  // Teacher Homepage
  TEACHER_HOMEPAGE_VISITED: 'Teacher Homepage Visited',

  // Student Homepage
  STUDENT_HOMEPAGE_VISITED: 'Student Homepage Visited',

  // Aichat
  UPDATE_CHATBOT: 'Student updates their aichat bot',
  AICHAT_VALIDATION: 'Student passes/fails validation on an aichat level',
  CHAT_ACTION: 'Student takes a chat action',
  SAVE_MODEL_CARD_INFO: 'Student saves their model card info',
  PUBLISH_MODEL_CARD_INFO: 'Student publishes their model card info',
  AICHAT_START_OVER: 'Student starts over and resets to default model settings',
  SUBMIT_AICHAT_REQUEST_SUCCESS: 'User submits aichat request successfully',
  SUBMIT_AICHAT_REQUEST_UNAUTHORIZED:
    'Unauthorized user attempts to submit aichat request or model customizations and fails',
  SUBMIT_AICHAT_TEACHER_FEEDBACK: 'Teacher submits feedback on aichat message',
  // Codebridge - File broswer-related events
  CODEBRIDGE_DELETE_FILE: 'Delete file on codebridge',
  CODEBRIDGE_DELETE_FOLDER: 'Delete folder on codebridge',
  CODEBRIDGE_MOVE_FILE: 'Move file on codebridge',
  CODEBRIDGE_MOVE_FOLDER: 'Move folder on codebridge',
  CODEBRIDGE_NEW_FILE: 'Create a new file on codebridge',
  CODEBRIDGE_NEW_FOLDER: 'Create a new folder on codebridge',
  CODEBRIDGE_NEW_SUBFOLDER: 'Create a new subfolder on codebridge',
  CODEBRIDGE_RENAME_FILE: 'Rename file on codebridge',
  CODEBRIDGE_RENAME_FOLDER: 'Rename folder on codebridge',
  CODEBRIDGE_DOWNLOAD_FILE: 'Download file on codebridge',
  CODEBRIDGE_UPLOAD_FILE: 'Upload file on codebridge',
  CODEBRIDGE_UPLOAD_UNACCEPTED_FILE:
    'Attempted upload of unaccepted file on codebridge',
  CODEBRIDGE_UPLOAD_FAILED: 'Failed to upload file on codebridge',

  // Codebridge - Other events
  CODEBRIDGE_CLEAR_CONSOLE: 'Console cleared on codebridge',
  CODEBRIDGE_MOVE_CONSOLE: 'Console moved on codebridge',
  CODEBRIDGE_POP_OUT_IMAGE: 'Image popped out of console on codebridge',
  CODEBRIDGE_RUN_CLICK: 'Run button clicked on codebridge',
  CODEBRIDGE_VALIDATE_CLICK: 'Validate button clicked on codebridge',
  CODEBRIDGE_VERSION_RESTORED: 'Version restored on codebridge',
  CODEBRIDGE_VERSION_VIEWED: 'Version viewed on codebridge',
  CODEBRIDGE_FOR_TEACHERS_ONLY_TOGGLE:
    'Toggled to For Teachers Only on codebridge',
  CODEBRIDGE_INSTRUCTIONS_TOGGLE: 'Toggled to Instructions on codebridge',
  CODEBRIDGE_HELP_TIPS_TOGGLE: 'Toggled to Help and Tips on codebridge',

  // Blockly Lab Settings
  BLOCKLY_LAB_SETTING_CHANGED: 'Setting changed in Blockly Lab',
  BLOCKLY_SETTING_KEYBOARD_NAVIGATION: 'keyboardNavigation',
  BLOCKLY_SETTING_THEME: 'theme',
  BLOCKLY_SETTING_ON: 'on',
  BLOCKLY_SETTING_OFF: 'off',
  BLOCKLY_APP_TYPE_MUSIC: 'music',

  // Teacher Navigation V2
  NAVIGATE_TO_SECTION: 'Local Nav Class Section Selected',
  NAVIGATE_TO_PAGE: 'Local Nav Page Clicked',
  SECTION_LOAD_FAILURE: 'Local Nav Section Load Failure',
  UNIT_CALENDAR_FAILURE: 'Local Nav Unit Calendar Load Failure',
  VIEW_UNIT_CALENDAR: 'Local Nav View Unit Calendar',
  CHANGED_CALENDAR_MINUTES: 'Local Nav Changed Calendar Minutes',

  // Lesson Materials page
  VIEW_LESSON_MATERIALS: 'Local Nav View Lesson Materials',
  LESSON_MATERIALS_LESSON_CHANGE: 'Local Nav Lesson Materials Lesson Change',
  LESSON_MATERIALS_FAILURE: 'Local Nav Lesson Materials Load Failure',
  LESSON_MATERIALS_DOWNLOAD_ALL_LESSON_PLANS:
    'Local Nav Download All Lesson Plans',
  LESSON_MATERIALS_DOWNLOAD_ALL_HANDOUTS: 'Local Nav Download All Handouts',
  LESSON_MATERIALS_RESOURCE_DROPDOWN_OPTION:
    'Local Nav Resource Dropdown Option Clicked',

  // Unit Overview
  TEACHER_NAV_UNIT_OVERVIEW_PAGE_VIEWED:
    'Teacher Nav Unit Overview Page Viewed',
  TEACHER_NAV_UNIT_OVERVIEW_FAILED: 'Teacher Nav Unit Overview Load Failure',

  // Course Overview
  TEACHER_NAV_COURSE_OVERVIEW_PAGE_VIEWED:
    'Teacher Nav Course Overview Page Viewed',
  TEACHER_NAV_COURSE_OVERVIEW_FAILED:
    'Teacher Nav Course Overview Load Failure',

  // Lab2
  SKIP_TO_PROJECT: 'User Skipped To Project From Tutorial Level',

  // Global Edition - Region Reset Button
  GLOBAL_EDITION_REGION_RESET_BUTTON_CLICKED:
    'Global Edition Return to Full Site Clicked',
  // Global Edition - Region Switch Confirm events
  GLOBAL_EDITION_REGION_SWITCH_CONFIRM_SHOWN:
    'Global Edition Region Switch Confirm Shown',
  GLOBAL_EDITION_REGION_SWITCH_CONFIRM_CLOSED:
    'Global Edition Region Switch Confirm Closed',
  GLOBAL_EDITION_REGION_SWITCH_CONFIRM_ACCEPTED:
    'Global Edition Region Switch Confirm Accepted',
  GLOBAL_EDITION_REGION_SWITCH_CONFIRM_REJECTED:
    'Global Edition Region Switch Confirm Rejected',

  // Sign in callout on CSF and CSC levels
  LEVEL_SIGN_IN_CALLOUT_SHOWN: 'Level Sign In Callout Shown',
};

const EVENT_GROUP_NAMES = {
  VIDEO_EVENTS: 'video-events',
  DANCE_PARTY: 'dance-party-events',
  PROJECT_SHARING: 'project-sharing-events',
  FINISH_PROJECT_SHARING: 'finish-project-sharing-events',
};

const EVENT_GROUPS = {
  // Hour of Code - Dance Party
  [EVENTS.DANCE_PARTY_ACTIVITY_STARTED]: EVENT_GROUP_NAMES.DANCE_PARTY,
  [EVENTS.DANCE_PARTY_LEVEL_COMPLETED]: EVENT_GROUP_NAMES.DANCE_PARTY,
  [EVENTS.DANCE_PARTY_AI_BACKGROUND_GENERATED]: EVENT_GROUP_NAMES.DANCE_PARTY,
  [EVENTS.DANCE_PARTY_AI_BACKGROUND_REGENERATED]: EVENT_GROUP_NAMES.DANCE_PARTY,
  [EVENTS.DANCE_PARTY_AI_BACKGROUND_USED]: EVENT_GROUP_NAMES.DANCE_PARTY,
  [EVENTS.DANCE_PARTY_AI_BACKGROUND_RESTARTED]: EVENT_GROUP_NAMES.DANCE_PARTY,
  [EVENTS.DANCE_PARTY_AI_BACKGROUND_EDITED]: EVENT_GROUP_NAMES.DANCE_PARTY,
  [EVENTS.DANCE_PARTY_AI_BACKGROUND_EXPLAINED]: EVENT_GROUP_NAMES.DANCE_PARTY,
  [EVENTS.DANCE_PARTY_AI_EMOJI_USED]: EVENT_GROUP_NAMES.DANCE_PARTY,
  [EVENTS.DANCE_PARTY_SONG_UNAVAILABLE]: EVENT_GROUP_NAMES.DANCE_PARTY,
  [EVENTS.DANCE_PARTY_AI_MODAL_CLOSED]: EVENT_GROUP_NAMES.DANCE_PARTY,

  // videos
  [EVENTS.VIDEO_LOADED]: EVENT_GROUP_NAMES.VIDEO_EVENTS,
  [EVENTS.VIDEO_STARTED]: EVENT_GROUP_NAMES.VIDEO_EVENTS,
  [EVENTS.VIDEO_PAUSED]: EVENT_GROUP_NAMES.VIDEO_EVENTS,
  [EVENTS.VIDEO_ENDED]: EVENT_GROUP_NAMES.VIDEO_EVENTS,

  // Project sharing via 'Share' button
  [EVENTS.SHARING_LINK_COPY]: EVENT_GROUP_NAMES.PROJECT_SHARING,
  [EVENTS.SHARING_PUBLISH]: EVENT_GROUP_NAMES.PROJECT_SHARING,
  [EVENTS.SHARING_FB]: EVENT_GROUP_NAMES.PROJECT_SHARING,
  [EVENTS.SHARING_TWITTER]: EVENT_GROUP_NAMES.PROJECT_SHARING,
  [EVENTS.SHARING_LINK_SEND_TO_PHONE]: EVENT_GROUP_NAMES.PROJECT_SHARING,
  [EVENTS.SHARING_CLOSE_ESCAPE]: EVENT_GROUP_NAMES.PROJECT_SHARING,

  // Project sharing via 'Finish' button
  [EVENTS.FINISH_SHARING_LINK_COPY]: EVENT_GROUP_NAMES.FINISH_PROJECT_SHARING,
  [EVENTS.FINISH_SHARING_PUBLISH]: EVENT_GROUP_NAMES.FINISH_PROJECT_SHARING,
  [EVENTS.FINISH_SHARING_FB]: EVENT_GROUP_NAMES.FINISH_PROJECT_SHARING,
  [EVENTS.FINISH_SHARING_TWITTER]: EVENT_GROUP_NAMES.FINISH_PROJECT_SHARING,
  [EVENTS.FINISH_SHARING_LINK_SEND_TO_PHONE]:
    EVENT_GROUP_NAMES.FINISH_PROJECT_SHARING,
  [EVENTS.FINISH_BUTTON_CERTIFICATE]: EVENT_GROUP_NAMES.FINISH_PROJECT_SHARING,
};

export {EVENTS, EVENT_GROUP_NAMES, EVENT_GROUPS, PLATFORMS};
