@no_mobile
Feature: Submittable AppLab

Background:
  Given I create a teacher-associated student named "Lillian"
  And I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/7?noautoplay=true"
  Then I rotate to landscape
  And I wait to see "#runButton"

Scenario: Submit anything, unsubmit, be able to resubmit.
  # First, submit something.
  When I press "runButton"
  And I wait to see "#submitButton"
  And I press "submitButton"
  And I wait to see ".modal"
  And I press "confirm-button" to load a new page

  # Reload the page to see that unsubmit is the option.
  Then I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/7?noautoplay=true"
  And I wait to see "#unsubmitButton"

  # Unsubmit.
  Then I press "unsubmitButton"
  And I wait to see ".modal"
  And I press "confirm-button" to load a new page

  # Make sure that submit is the option after the page reloads.
  Then I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/7?noautoplay=true"
  And I press "runButton"
  And I wait to see "#submitButton"

Scenario: Submit anything, teacher is able to unsubmit
  # First, submit something.
  When I press "runButton"
  And I wait to see "#submitButton"
  And I press "submitButton"
  And I wait to see ".modal"
  And I press "confirm-button" to load a new page

  # Reload the page to see that unsubmit is the option.
  Then I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/7?noautoplay=true"
  And I wait to see "#unsubmitButton"

  # Unsubmit as teacher
  Then I sign in as "Teacher_Lillian"
  Then I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/7?noautoplay=true"
  And I wait to see ".show-handle"
  Then I click selector ".show-handle .fa-chevron-left"
  Then I click selector ".section-student .name a"
  And I wait to see "#unsubmit"
  Then I press "unsubmit" to load a new page

  # Shouldn't be able to see unsubmit anymore
  And I wait to see ".show-handle"
  Then I click selector ".show-handle .fa-chevron-left"
  And I wait until I don't see selector "#unsubmit"
  Then I sign out

Scenario: 'Help & Tips' and 'Instruction' tabs are visible
  Given I am on "http://studio.code.org/s/csp3/stage/4/puzzle/3?enableExperiments=resourcesTab"
  When I click selector ".uitest-helpTab" if I see it
  And I wait until ".editor-column" contains text "Turtle Programming"
  And I click selector ".uitest-instructionsTab" if I see it
  And I wait until ".editor-column" contains text "Given only 4 turtle commands,"
  Then I am on "http://studio.code.org/s/csp3/stage/4/puzzle/3?disableExperiments=resourcesTab"

Scenario: Do not display resources tab when there are no videos
  Given I am on "http://studio.code.org/s/csp3/stage/4/puzzle/4?enableExperiments=resourcesTab"
  And element ".uitest-helpTab" is not visible
  Then I am on "http://studio.code.org/s/csp3/stage/4/puzzle/4?disableExperiments=resourcesTab"
