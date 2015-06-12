var testUtils = require('../../util/testUtils');
var TestResults = require('@cdo/apps/constants').TestResults;
var _ = require('lodash');
var $ = require('jquery');
var React = require('react');
require('react/addons');
var ReactTestUtils = React.addons.TestUtils;

// i'd like this test to not run through level tests, which has a lot of hacks,
// but this is the easiest approach for now. hopefully at some point in the
// (nearish) future, we have a better approach and this code can be moved
// without too much difficulty

function validatePropertyRow(index, label, value, assert) {
  var table = $("#design-properties table")[0];
  assert(table, 'has design properties table');

  var tableRow = $("#design-properties table tr").eq(index);
  assert.equal(tableRow.children(0).text(), label);
  // second col has an input with val screen 2
  assert.equal(tableRow.children(1).children(0).val(), value);
}

module.exports = {
  app: "applab",
  skinId: "applab",
  levelFile: "levels",
  levelId: "ec_simple",
  tests: [
    {
      description: "button image",
      editCode: true,
      xml: '',
      runBeforeClick: function (assert) {
        $("#designModeButton").click();

        testUtils.dragToVisualization('BUTTON', 10, 10);

        validatePropertyRow(1, 'id', 'button1', assert);

        // take advantage of the fact that we expose the filesystem via
        // localhost:8001
        var assetUrl = 'http://localhost:8001/apps/static/flappy_promo.png';
        var imageInput = $("#design-properties input").last()[0];

        ReactTestUtils.Simulate.change(imageInput, {
          target: { value: assetUrl }
        });

        var buttonElement = $("#button1")[0];

        // wait until image has loaded to do validation
        var img = new Image();
        img.src = assetUrl;
        img.onload = function () {
          // There's no guarantee that we hit this onload after the onload in
          // designMode.js, so the styles won't always be set immediately.
          // Instead, wait until the level starts to do our validation

          // add a completion on timeout since this is a freeplay level
          testUtils.runOnAppTick(Applab, 2, function () {
            assert.equal(buttonElement.style.backgroundImage, 'url(' + assetUrl + ')');
            assert.equal(buttonElement.style.width, '200px');
            assert.equal(buttonElement.style.height, '113px');
            assert.equal(buttonElement.style.backgroundSize, '200px 113px');

            Applab.onPuzzleComplete();
          });
        };
        img.onerror = function (err) {
          assert(false, err.message);
        };
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
    },
    {
      description: "resizing",
      editCode: true,
      xml: '',
      runBeforeClick: function (assert) {
        var shouldBeResizable = function () {
          var rootDiv, screen1, resizable, button;

          rootDiv = $('#divApplab');
          assert.equal(rootDiv.children().length, 1);
          screen1 = rootDiv.children().first();
          assert.equal(screen1.attr('id'), 'screen1');
          assert.equal(screen1.children().length, 1);
          resizable = screen1.children().first();
          assert.equal(resizable.hasClass('ui-resizable'), true, 'is resizable');
          assert.equal(resizable.hasClass('ui-draggable'), true, 'is draggable');
          assert.equal(resizable.children().length, 4);
          button = resizable.children().first();
          assert.equal(button.prop('tagName'), 'BUTTON');
          assert.equal(resizable.children().eq(1).hasClass('ui-resizable-handle'),
            true, 'is resizable handle');
          assert.equal(resizable.children().eq(2).hasClass('ui-resizable-handle'),
            true, 'is resizable handle');
          assert.equal(resizable.children().eq(3).hasClass('ui-resizable-handle'),
            true, 'is resizable handle');
        };

        var shouldNotBeResizable = function () {
          var rootDiv, screen1, resizable, button;

          rootDiv = $('#divApplab');
          assert.equal(rootDiv.children().length, 1);
          screen1 = rootDiv.children().first();
          assert.equal(screen1.attr('id'), 'screen1');
          assert.equal(screen1.children().length, 1);
          // button should now be a direct descendant
          button = screen1.children().first();
          assert.equal(button.prop('tagName'), 'BUTTON');
        };

        $("#designModeButton").click();
        testUtils.dragToVisualization('BUTTON', 10, 10);
        validatePropertyRow(1, 'id', 'button1', assert);
        shouldBeResizable();

        $("#codeModeButton").click();
        assert.equal($("#design-properties").is(':visible'), false);
        shouldNotBeResizable();

        $("#designModeButton").click();
        shouldBeResizable();

        $("#runButton").click();
        shouldNotBeResizable();

        $("#resetButton").click();
        shouldBeResizable();

        Applab.onPuzzleComplete();
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
    },

  ]
};
