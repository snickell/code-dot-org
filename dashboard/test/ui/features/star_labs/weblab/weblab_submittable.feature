# Brad investigating (2018-04-25)
@skip
@no_mobile
@as_taught_student
@no_ci
Feature: Submittable WebLab

Background:
  Given I am on "http://studio.code.org/s/allthethings/lessons/32/levels/1?noautoplay=true"
  Then I wait until element "#submitButton" is visible

Scenario: Submit anything, unsubmit, be able to resubmit.
  # First, submit something.
  When I submit this level

  # Reload the page to see that unsubmit is the option.
  Then I am on "http://studio.code.org/s/allthethings/lessons/32/levels/1?noautoplay=true"
  And I wait until element "#unsubmitButton" is visible

  # Unsubmit.
  Then I press "unsubmitButton"
  And I wait to see ".modal"
  And I press "confirm-button" to load a new page

  # Make sure that submit is the option after the page reloads.
  Then I am on "http://studio.code.org/s/allthethings/lessons/32/levels/1?noautoplay=true"
  And I wait until element "#submitButton" is visible
