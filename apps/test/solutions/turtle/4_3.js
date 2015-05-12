var testUtils = require('../../util/testUtils');
var TestResults = require('@cdo/apps/constants.js').TestResults;


module.exports = {
  app: "turtle",
  levelFile: "levels",
  levelId: "4_3",
  tests: [
    {
      description: "Top Solve: Add Repeat 4x, right 90",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      missingBlocks: [],
      xml: '<xml><block type="controls_repeat"><title name="TIMES">4</title><statement name="DO"><block type="draw_colour" inline="true" deletable="false" editable="false"><value name="COLOUR"><block type="colour_random" deletable="false" editable="false"></block></value><next><block type="controls_repeat" deletable="false" editable="false"><title name="TIMES">3</title><statement name="DO"><block type="draw_move_by_constant" deletable="false" editable="false"><title name="DIR">moveForward</title><title name="VALUE">100</title><next><block type="draw_turn_by_constant" deletable="false" editable="false"><title name="DIR">turnRight</title><title name="VALUE">120</title></block></next></block></statement><next><block type="draw_turn_by_constant"><title name="DIR">turnRight</title><title name="VALUE">90</title></block></next></block></next></block></statement></block></xml>'
    }
  ]
};
