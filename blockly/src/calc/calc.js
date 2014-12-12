/**
 * Blockly Demo: Calc Graphics
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

var Calc = module.exports;

/**
 * Create a namespace for the application.
 */
var BlocklyApps = require('../base');
var Calc = module.exports;
var commonMsg = require('../../locale/current/common');
var calcMsg = require('../../locale/current/calc');
var skins = require('../skins');
var levels = require('./levels');
var codegen = require('../codegen');
var api = require('./api');
var page = require('../templates/page.html');
var feedback = require('../feedback.js');
var dom = require('../dom');
var blockUtils = require('../block_utils');

var ExpressionNode = require('./expressionNode');
var TestResults = require('../constants').TestResults;

var level;
var skin;

BlocklyApps.CHECK_FOR_EMPTY_BLOCKS = false;
BlocklyApps.NUM_REQUIRED_BLOCKS_TO_FLAG = 1;

var CANVAS_HEIGHT = 400;
var CANVAS_WIDTH = 400;

var appState = {
  animating: false,
  response: null,
  message: null,
  result: null,
  testResults: null,
  currentAnimationDepth: 0
};

var STEP_TIME = 2000;

/**
 * Initialize Blockly and the Calc.  Called on page load.
 */
Calc.init = function(config) {

  skin = config.skin;
  level = config.level;

  Calc.expressions = {
    target: null, // the complete target expression
    user: null, // the current state of the user expression
  };

  config.grayOutUndeletableBlocks = true;
  config.forceInsertTopBlock = 'functional_compute';
  config.enableShowCode = false;

  config.html = page({
    assetUrl: BlocklyApps.assetUrl,
    data: {
      localeDirection: BlocklyApps.localeDirection(),
      visualization: require('./visualization.html')(),
      controls: require('./controls.html')({
        assetUrl: BlocklyApps.assetUrl
      }),
      blockUsed : undefined,
      idealBlockNumber : undefined,
      editCode: level.editCode,
      blockCounterClass : 'block-counter-default'
    }
  });

  config.loadAudio = function() {
    BlocklyApps.loadAudio(skin.winSound, 'win');
    BlocklyApps.loadAudio(skin.startSound, 'start');
    BlocklyApps.loadAudio(skin.failureSound, 'failure');
  };

  config.afterInject = function() {
    var svg = document.getElementById('svgCalc');
    svg.setAttribute('width', CANVAS_WIDTH);
    svg.setAttribute('height', CANVAS_HEIGHT);

    if (level.freePlay) {
      document.getElementById('goalHeader').setAttribute('visibility', 'hidden');
    }

    // This is hack that I haven't been able to fully understand. Furthermore,
    // it seems to break the functional blocks in some browsers. As such, I'm
    // just going to disable the hack for this app.
    Blockly.BROKEN_CONTROL_POINTS = false;

    // Add to reserved word list: API, local variables in execution evironment
    // (execute) and the infinite loop detection function.
    Blockly.JavaScript.addReservedWords('Calc,code');

    var solutionBlocks = level.solutionBlocks;
    if (level.solutionBlocks && level.solutionBlocks !== '') {
      solutionBlocks = blockUtils.forceInsertTopBlock(level.solutionBlocks,
        config.forceInsertTopBlock);
    }
    var target = getExpressionFromBlocks(solutionBlocks);
    if (target) {
      Calc.expressions.target = target;
      var tokenList = target.getTokenListDiff(target);
      addTokenList('answerExpression', tokenList, 0);
    }

    // Adjust visualizationColumn width.
    var visualizationColumn = document.getElementById('visualizationColumn');
    visualizationColumn.style.width = '400px';

    // base's BlocklyApps.resetButtonClick will be called first
    var resetButton = document.getElementById('resetButton');
    dom.addClickTouchEvent(resetButton, Calc.resetButtonClick);
  };

  BlocklyApps.init(config);
};

/**
 * Click the run button.  Start the program.
 */
BlocklyApps.runButtonClick = function() {
  BlocklyApps.toggleRunReset('reset');
  Blockly.mainBlockSpace.traceOn(true);
  BlocklyApps.attempts++;
  Calc.execute();
};

/**
 * App specific reset button click logic.  BlocklyApps.resetButtonClick will be
 * called first.
 */
Calc.resetButtonClick = function () {
  Calc.expressions.user = null;
  appState.message = null;
  appState.currentAnimationDepth = 0;

  appState.animating = false;

  clearSvgExpression('userExpression');
};


function evalCode (code) {
  try {
    codegen.evalWith(code, {
      BlocklyApps: BlocklyApps,
      Calc: api
    });
  } catch (e) {
    // Infinity is thrown if we detect an infinite loop. In that case we'll
    // stop further execution, animate what occured before the infinite loop,
    // and analyze success/failure based on what was drawn.
    // Otherwise, abnormal termination is a user error.
    if (e !== Infinity) {
      // call window.onerror so that we get new relic collection.  prepend with
      // UserCode so that it's clear this is in eval'ed code.
      if (window.onerror) {
        window.onerror("UserCode:" + e.message, document.URL, 0);
      }
      if (console && console.log) {
        console.log(e);
      }
    }
  }
}

/**
 * Generates an ExpressionNode from the blocks in the workspace. If blockXml
 * is provided, temporarily sticks those blocks into the workspace to generate
 * the ExpressionNode, then deletes blocks.
 */

function getExpressionFromBlocks(blockXml) {
  if (blockXml) {
    if (Blockly.mainBlockSpace.getTopBlocks().length !== 0) {
      throw new Error("getExpressionFromBlocks shouldn't be called with blocks if " +
        "we already have blocks in the workspace");
    }
    // Temporarily put the blocks into the workspace so that we can generate code
    BlocklyApps.loadBlocks(blockXml);
  }

  // todo - multiple top blocks (like functions)
  var object = getExpressionFromBlock(Blockly.mainBlockSpace.getTopBlocks()[0]);

  if (blockXml) {
    // Remove the blocks
    Blockly.mainBlockSpace.getTopBlocks().forEach(function (b) { b.dispose(); });
  }

  return object;
}

// todo - think about naming
// todo - missing blockIds
function getExpressionFromBlock(block) {
  if (!block) {
    return null;
  }
  // todo - does this logic belong on blocks instead?
  switch (block.type) {
    case 'functional_compute':
      return getExpressionFromBlock(block.getChildren()[0]);
    case 'functional_plus':
    case 'functional_minus':
    case 'functional_times':
    case 'functional_dividedby':
      // todo - a little hacky
      var operation = block.getTitles()[0].getValue();
      var left = getExpressionFromBlock(block.getInputTargetBlock('ARG1')) || 0;
      var right = getExpressionFromBlock(block.getInputTargetBlock('ARG2')) || 0;
      return new ExpressionNode(operation, [left, right]);
    case 'functional_math_number':
    case 'functional_math_number_dropdown':
      var val = block.getTitleValue('NUM') || 0;
      if (val === '???') {
        val = 0;
      }
      return new ExpressionNode(parseInt(val, 10));
    case 'functional_call':
      var name = block.getProcedureCall();
      var args = [];
      var input, i = 0;
      while ((input = block.getInputTargetBlock('ARG' + i)) !== null) {
        args.push(getExpressionFromBlock(input));
        i++;
      }
      return new ExpressionNode(name, args);
    case 'functional_parameters_get':
      return new ExpressionNode(block.getTitleValue('VAR'));
    default:
      throw "Unknown block type: " + block.type;
  }
}

/**
 * Execute the user's code.  Heaven help us...
 */
Calc.execute = function() {
  appState.result = BlocklyApps.ResultType.UNSET;
  appState.testResults = BlocklyApps.TestResults.NO_TESTS_RUN;
  appState.message = undefined;

  // todo - handle functions
  var topBlocks = Blockly.mainBlockSpace.getTopBlocks();
  var userExpression = getExpressionFromBlock(topBlocks[0]);

  if (userExpression) {
    Calc.expressions.user = userExpression.clone();
  } else {
    Calc.expressions.user = new ExpressionNode(0);
  }

  if (Calc.expressions.target) {
    Calc.expressions.user.applyExpectation(Calc.expressions.target);
  }

  // todo - should this be using ResultType.* instead?
  appState.result = Calc.expressions.target === null ||
    Calc.expressions.user.equals(Calc.expressions.target);
  appState.testResults = BlocklyApps.getTestResults(appState.result);

  // equivalence means the expressions are the same if we ignore the ordering
  // of inputs
  if (!appState.result && Calc.expressions.user.isEquivalent(Calc.expressions.target)) {
    appState.testResults = TestResults.APP_SPECIFIC_FAIL;
    appState.message = calcMsg.equivalentExpression();
  }

  if (level.freePlay) {
    appState.testResults = BlocklyApps.TestResults.FREE_PLAY;
  }

  // todo - show valid/invalid
  animateUserExpression(0);

  var xml = Blockly.Xml.blockSpaceToDom(Blockly.mainBlockSpace);
  var textBlocks = Blockly.Xml.domToText(xml);

  var reportData = {
    app: 'calc',
    level: level.id,
    builder: level.builder,
    result: appState.result,
    testResult: appState.testResults,
    program: encodeURIComponent(textBlocks),
    onComplete: onReportComplete
  };

  BlocklyApps.report(reportData);

  appState.animating = true;
  if (appState.result) {
    Calc.step();
  } else {
    window.setTimeout(function () {
      stopAnimatingAndDisplayFeedback();
    }, STEP_TIME);
  }
};

function stopAnimatingAndDisplayFeedback() {
  appState.animating = false;
  displayFeedback();
}

/**
 * Perform a step in our expression evaluation animation. This consists of
 * collapsing the next node in our tree. If that node failed expectations, we
 * will stop further evaluation.
 */
Calc.step = function () {
  if (!Calc.expressions.user) {
    return;
  }

  if (animateUserExpression(appState.currentAnimationDepth)) {
    stopAnimatingAndDisplayFeedback();
    return;
  }
  appState.currentAnimationDepth++;


  // // If we've fully collapsed our expression, display feedback
  // if (!Calc.expressions.user.canCollapse()) {
  //   stopAnimatingAndDisplayFeedback();
  //   return;
  // }
  //
  // Calc.expressions.user.collapse(ignoreFailures);
  //
  // Calc.drawUserExpression();

  window.setTimeout(function () {
    Calc.step();
  }, STEP_TIME);
};

/**
 * Draw the current state of our two expressions.
 */
Calc.drawUserExpression = function () {
  var expected = Calc.expressions.target;
  var user = Calc.expressions.user;

  if (!user) {
    return;
  }

  drawSvgExpression('userExpression', user, expected);
  var deepest = user.getDeepestOperation();
  BlocklyApps.highlight(deepest ? deepest.blockId : null);
};

function clearSvgExpression(elementId) {
  var g = document.getElementById(elementId);
  // remove all existing children, in reverse order so that we don't have to
  // worry about indexes changing
  for (var i = g.childNodes.length - 1; i >= 0; i--) {
    g.removeChild(g.childNodes[i]);
  }
}

/**
 * Draws a user expression and each step collapsing it, up to given depth.
 * Returns true if it couldn't collapse any further at this depth.
 */
function animateUserExpression (depth) {
  var finished = false;

  var expected = Calc.expressions.target;
  var user = Calc.expressions.user;

  if (!user) {
    return;
  }

  clearSvgExpression('userExpression');

  var current = user.clone();
  var previous = current;
  var currentDepth = 0;
  for (var i = 0; i <= depth && !finished; i++) {
    var isFinal = (i === depth);
    // todo - for penultimate highlight deepest operation
    var tokenList = current.getTokenListDiff(isFinal ? previous : current);
    ('userExpression', tokenList, currentDepth);
    previous = current.clone();
    if (current.collapse()) {
      currentDepth++;
    } else {
      // we want to go one more step after the last collapse so that we show
      // our last line without highlighting it
      finished = !isFinal;
    }
  }
  return finished;
}

function addTokenList(parentId, tokenList, depth) {
  var str, text, textLength;
  var parent = document.getElementById(parentId);

  var g = document.createElementNS(Blockly.SVG_NS, 'g');
  parent.appendChild(g);
  var xPos = 0;
  for (i = 0; i < tokenList.length; i++) {
    text = document.createElementNS(Blockly.SVG_NS, 'text');

    // getComputedTextLength doesn't respect trailing spaces, so we replace them
    // with _, calculate our size, then return to the version with spaces.
    str = tokenList[i].str;
    text.textContent = str.replace(/ /g, '_');
    g.appendChild(text);
    // getComputedTextLength isn't available to us in our mochaTests
    textLength = text.getComputedTextLength ? text.getComputedTextLength() : 0;
    text.textContent = str;

    text.setAttribute('x', xPos + textLength / 2);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('class', tokenList[i].different ? 'highlightedParen' : '');
    xPos += textLength;
  }

  // todo (brent): handle case where expression is longer than width
  var xPadding = (CANVAS_WIDTH - g.getBoundingClientRect().width) / 2;
  var yPos = (depth * 20);
  g.setAttribute('transform', 'translate(' + xPadding + ', ' + yPos + ')');
}


function drawSvgExpression(elementId, expr, expected) {
  var i, text, textLength, char, g;
  var parent = document.getElementById(elementId);
  // clearSvgExpression(elementId);

  var tokenList = expr.getTokenListDiff(expected);
  var xPos = 0;
  g = document.createElementNS(Blockly.SVG_NS, 'g');
  parent.appendChild(g);
  for (i = 0; i < tokenList.length; i++) {
    text = document.createElementNS(Blockly.SVG_NS, 'text');

    // getComputedTextLength doesn't respect trailing spaces, so we replace them
    // with _, calculate our size, then return to the version with spaces.
    char = tokenList[i].str;
    text.textContent = char.replace(/ /g, '_');
    g.appendChild(text);
    // getComputedTextLength isn't available to us in our mochaTests
    textLength = text.getComputedTextLength ? text.getComputedTextLength() : 0;
    text.textContent = char;

    text.setAttribute('x', xPos + textLength / 2);
    text.setAttribute('text-anchor', 'middle');
    xPos += textLength;

    // todo - figure out
    // if (tokenList[i].valid) {
    //   if (char === '(' || char === ')') {
    //     text.setAttribute('class', 'highlightedParen');
    //   } else {
    //     text.setAttribute('class', 'exprMistake');
    //   }
    // }
  }

  // center entire expression
  // todo (brent): handle case where expression is longer than width
  var width = g.getBoundingClientRect().width;
  var xPadding = (CANVAS_WIDTH - width) / 2;
  var yPos = (numCollapses * 20);
  numCollapses++;
  g.setAttribute('transform', 'translate(' + xPadding + ', ' + yPos + ')');
}

/**
 * Deep clone a node, then removing any ids from the clone so that we don't have
 * duplicated ids.
 */
function cloneNodeWithoutIds(elementId) {
  var clone = document.getElementById(elementId).cloneNode(true);
  var descendants = clone.getElementsByTagName("*");
  for (var i = 0; i < descendants.length; i++) {
    var element = descendants[i];
    element.removeAttribute("id");
  }

  return clone;
}

/**
 * App specific displayFeedback function that calls into
 * BlocklyApps.displayFeedback when appropriate
 */
var displayFeedback = function() {
  if (!appState.response || appState.animating) {
    return;
  }

  // override extra top blocks message
  level.extraTopBlocks = calcMsg.extraTopBlocks();
  var appDiv = null;
  // Show svg in feedback dialog
  appDiv = cloneNodeWithoutIds('svgCalc');
  var options = {
    app: 'Calc',
    skin: skin.id,
    response: appState.response,
    level: level,
    feedbackType: appState.testResults,
    appStrings: {
      reinfFeedbackMsg: calcMsg.reinfFeedbackMsg()
    },
    appDiv: appDiv
  };
  if (appState.message) {
    options.message = appState.message;
  }

  BlocklyApps.displayFeedback(options);
};

/**
 * Function to be called when the service report call is complete
 * @param {object} JSON response (if available)
 */
function onReportComplete(response) {
  // Disable the run button until onReportComplete is called.
  var runButton = document.getElementById('runButton');
  runButton.disabled = false;
  appState.response = response;
  displayFeedback();
}
