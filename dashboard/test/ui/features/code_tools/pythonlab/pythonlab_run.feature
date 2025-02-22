@no_mobile
# Our minimum version of Safari does not support web workers
@no_safari
Feature: Python Lab run code

Background:
  Given I create a student named "Penelope"
  And I am on "http://studio.code.org/s/allthethings/lessons/50/levels/1"
  And I wait to see "#uitest-codebridge-run"
  And I wait until "#uitest-codebridge-run" is not disabled

Scenario: Can run and see output of Python program
  And I press "uitest-codebridge-run"
  And I wait until "#uitest-codebridge-console" contains text "Hello from the start!"
  Then I sign out

Scenario: Continue button and progress status shows up correctly
  # Level 1 is not validated; continue button will show up after editing and running code.
  And I verify progress in the header of the current page is "not_tried" for level 1
  And I focus selector ".cm-content"
  And I press keys "print('more code')\n"
  # Wait to ensure the editor has the updated text before clicking run 
  And I wait for 1 second
  And I press "uitest-codebridge-run"
  And I wait until "#uitest-codebridge-console" contains text "more code"
  Then I verify progress in the header of the current page is "attempted" for level 1
  And element "#instructions-navigation" is visible
  And element "#instructions-navigation" contains text "Continue"
  And I press "instructions-navigation"

  # Validated level that passes by default, running validation will pass the level and
  # cause the continue button to show up
  And I wait until current URL contains "http://studio.code.org/s/allthethings/lessons/50/levels/2"
  # Check that progress has been updated for the previous level
  Then I verify progress in the header of the current page is "perfect" for level 1
  And I wait to see "#uitest-validate-button"
  And I wait until "#uitest-validate-button" is not disabled
  And I press "uitest-validate-button"
  And I wait until element "#instructions-navigation" is visible
  And element "#instructions-navigation" contains text "Continue"
  And I wait for 2 seconds
  Then I verify progress in the header of the current page is "perfect" for level 2
  Then I sign out
