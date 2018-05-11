@no_mobile
Feature: CSP Instructions

Scenario: 'Help & Tips' and 'Instruction' tabs are visible if level has videos
  Given I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/1"
  When I click selector ".uitest-helpTab" once I see it
  And I wait until ".editor-column" contains text "Turtle Programming"
  And I click selector ".uitest-instructionsTab"
  And I wait until ".editor-column" contains text "Given only 4 turtle commands,"

Scenario: 'Help & Tips' and 'Instruction' tabs are visible if the level has a map reference
  Given I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/18"
  When I click selector ".uitest-helpTab" once I see it
  And I wait until ".editor-column" contains text "The Circuit Playground is a simple single board computer with many built in Inputs and Outputs for us to explore."
  And I click selector ".uitest-instructionsTab"
  And I wait until ".editor-column" contains text "Given only 4 turtle commands,"

Scenario: 'Help & Tips' and 'Instruction' tabs are visible if the level has reference links
  Given I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/19"
  When I click selector ".uitest-helpTab" once I see it
  And I wait until ".editor-column" contains text "The Circuit Playground is a simple single board computer with many built in Inputs and Outputs for us to explore."
  And I click selector ".uitest-instructionsTab"
  And I wait until ".editor-column" contains text "Given only 4 turtle commands,"

Scenario: Do not display resources tab when there are no videos, map references, or reference links
  Given I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/3"
  And element ".uitest-helpTab" is not visible

Scenario: Resources tab displays videos, map references, and reference links with correct text and link
  Given I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/20"
  When I click selector ".uitest-helpTab" once I see it
  And I wait until ".editor-column" contains text "App Lab - Make It Interactive"
  And I wait until ".editor-column" contains text "Welcome to the Circuit Playground"
  And I click selector ".uitest-instructionsTab"
  And I wait until ".editor-column" contains text "Given only 4 turtle commands,"
  
Scenario: Instructions can be collapsed and expanded
  Given I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/20"
  And I wait for the page to fully load
  And I click selector "#ui-test-collapser"
  And element ".instructions-markdown" is hidden
  And I click selector "#ui-test-collapser"
  And element ".instructions-markdown" is visible

Scenario: Instructions have a resizer for non-embedded levels
  Given I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/20"
  And I wait for the page to fully load
  And element "#ui-test-resizer" is visible

Scenario: Instructions do not show a resizer on embedded levels
  Given I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/12"
  And I wait for the page to fully load
  And element "#ui-test-resizer" is not visible

Scenario: 'Feedback' tab is visible if user is a teacher and flag is on and displays 'Coming soon'
  Given I am a teacher
  And I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/20?enableExperiments=commentBoxTab"
  And I click selector ".uitest-feedback" once I see it
  And I wait until ".editor-column" contains text "Coming soon"
  And I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/20?disableExperiments=commentBoxTab"

Scenario: 'Feedback' tab is not visible if user is a student
  Given I am a student
  And I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/20?enableExperiments=commentBoxTab"
  And element ".uitest-feedback" is not visible
  And I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/20?disableExperiments=commentBoxTab"

Scenario: 'Feedback' tab is not visible if user is a teacher but flag is off
  Given I am a teacher
  And I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/20"
  And element ".uitest-feedback" is not visible