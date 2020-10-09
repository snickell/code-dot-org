import GoogleBlockly from 'blockly/core';
import locale from 'blockly/msg/en';
import 'blockly/blocks';
import 'blockly/javascript';

/**
 * Provides the basic frame for running Blockly.  In particular, this will
 * create a basic dom, load blockly.js  and put the contents into the global
 * space as global.Blockly.
 */

function setGlobals() {
  // Initialize browser environment.
  document.body.innerHTML = '<div id="codeApp"><div id="app"></div></div>';
  // locale file requires Blockly as a global
  var blockly = require('@code-dot-org/blockly');
  var initializeCdoBlocklyWrapper = require('../../src/sites/studio/pages/cdoBlocklyWrapper');
  window.Blockly = initializeCdoBlocklyWrapper(blockly);

  GoogleBlockly.setLocale(locale);
  var initializeGoogleBlocklyWrapper = require('../../src/sites/studio/pages/googleBlocklyWrapper');
  window.GoogleBlockly = initializeGoogleBlocklyWrapper(GoogleBlockly);

  try {
    require('../../lib/blockly/en_us');
  } catch (err) {
    console.log(err);
  }
}
module.exports = setGlobals;
