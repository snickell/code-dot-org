@eyes
Feature: Looking at a few things with Applitools Eyes

Scenario:
  When I open my eyes to test "bounce game"
  And I am on "http://learn.code.org/2014/1?noautoplay=true"
  When I rotate to landscape
  And I see no difference for "initial load"
  And I wait to see "#x-close"
  And I press "x-close"
  And I see no difference for "closed dialog"
  And I drag block "1" to block "3"
  Then block "4" is child of block "3"
  And I see no difference for "block snap"
  And I press "runButton"
  And I hold key "LEFT"
  And I wait to see ".congrats"
  And element ".congrats" is visible
  And I see no difference for "level completion"
  And I close my eyes

Scenario:
  When I open my eyes to test "multi"
  Given I am on "http://learn.code.org/s/course1/stage/2/puzzle/2?noautoplay=true"
  And I rotate to landscape
  Then element ".submitButton" is visible
  And I see no difference for "level load"
  And I close my eyes

Scenario:
  When I open my eyes to test "match"
  Given I am on "http://learn.code.org/s/course1/stage/14/puzzle/13?noautoplay=true"
  And I rotate to landscape
  Then element ".submitButton" is visible
  And I see no difference for "level load"
  And I close my eyes

