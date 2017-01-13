/* global appOptions */

import $ from 'jquery';
import _ from 'lodash';
var clientState = require('./clientState');

var lastAjaxRequest;
var lastServerResponse = {};

/**
 * Notify the progression system of level attempt or completion.
 * Provides a response to a callback, which can provide a video to play
 * and next/previous level URLs.
 *
 * The client posts the progress JSON to the URL specified by
 * report.callback (e.g. /milestone). In the event of a failure or timeout,
 * the client relies on report.fallbackResponse (if specified) to allow
 * the user to progress.
 *
 * @param {Object} report
 * @param {string} report.callback - The url where the report should be sent.
 *        For studioApp-based levels, this is provided on initialization as
 *        appOptions.report.callback.
 * @param {Object} report.fallbackResponse - ??? I'm not sure ???
 *        For studioApp-based levels, this is provided on initialization as
 *        appOptions.report.fallback_response
 * @param {string} report.app - The app name, as defined by its model.
 * @param {string} report.level - The level name or number.  Maybe deprecated?
 * @param {number|boolean} report.result - Whether the attempt succeeded or failed.
 * @param {number} report.testResult - Additional detail on the outcome of the
 *        attempt. Standard responses seem to be zero for failures or one
 *        hundred for success.
 * @param {function} report.onComplete - Callback invoked when reporting is
 *        completed.  Is passed a single 'response' argument which contains
 *        information about what to do / where to go next.
 */
var reporting = module.exports;

reporting.getLastServerResponse = function () {
  return lastServerResponse;
};

/**
 * Validate that the provided field on our report object is one of the given
 * types
 * @param {string} key
 * @param {*} value
 * @param {string[]} types
 */
function validateType(key, value, types) {
  let typeIsValid = false;
  if (!_.isArray(types)) {
    types = [types];
  }
  types.forEach(type => {
    if (type === 'array') {
      typeIsValid = typeIsValid || _.isArray(value);
    } else {
      typeIsValid = typeIsValid || (typeof value === type);
    }
  });

  if (!typeIsValid) {
    console.error(`Expected ${key} to be of type '${types}'. Got '${typeof value}'`);
  }
}

/**
 * Do some validation of our report object. Log console errors if we have any unexpected
 * fields, or fields with different data than we expect.
 */
function validateReport(report) {
  for (var key in report) {
    if (!report.hasOwnProperty(key)) {
      continue;
    }

    const value = report[key];
    switch (key) {
      case 'program':
        if (report.app === 'match') {
          validateType('program', value, 'array');
        } else {
          validateType('program', value, 'string');
        }
        break;
      case 'fallbackResponse':
        // TODO - sometimes it's json. figure out when.
        validateType('fallbackResponse', value, 'object');
        break;
      case 'callback':
        validateType('callback', value, 'string');
        break;
      case 'app':
        validateType('app', value, 'string');
        break;
      case 'allowMultipleSends':
        validateType('allowMultipleSends', value, 'boolean');
        break;
      case 'level':
        // TODO: level is sometimes null. (http://localhost-studio.code.org:3000/s/allthethings/stage/21/puzzle/1)
        // can we make this validation stronger?
        // TODO: level is a number here http://localhost-studio.code.org:3000/s/allthethings/stage/28/puzzle/1/page/1
        validateType('level', value, ['string', 'object', 'number']);
        break;
      case 'result':
        // TODO: this is an object in assessments?
        // http://localhost-studio.code.org:3000/s/allthethings/stage/28/puzzle/1/page/1
        validateType('result', value, ['boolean', 'object']); // maybe also string??
        break;
      case 'pass':
        // TODO: this is an object in assessments?
        // http://localhost-studio.code.org:3000/s/allthethings/stage/28/puzzle/1/page/1
        validateType('pass', value, ['boolean', 'object']); // string??
        break;
      case 'testResult':
        validateType('testResult', value, 'number');
        break;
      case 'submitted':
        // TODO: in sendResultsCompletion this becomes either "true" the string  or false the boolean
        // got "true" on http://localhost-studio.code.org:3000/s/allthethings/stage/27/puzzle/1
        validateType('submitted', value, ['string', 'boolean']);
        break;
      case 'onComplete':
        if (value !== undefined) {
          validateType('onComplete', value, 'function');
        }
        break;
      case 'time':
        validateType('time', value, 'number');
        break;
      case 'lines':
        validateType('lines', value, 'number');
        break;
      case 'save_to_gallery':
        validateType('save_to_gallery', value, 'boolean');
        break;
      case 'attempt':
        validateType('attempt', value, 'number');
        break;
      case 'image':
        validateType('image', value, 'string');
        break;
      case 'containedLevelResultsInfo':
        validateType('containedLevelResultsInfo', value, 'object');
        break;
      default:
        // TODO - eventually throw
        console.error(`Unexpected report key '${key}' of type '${typeof report[key]}'`);
        break;
    }
  }
}

reporting.sendReport = function (report) {
  // The list of report fields we want to send to the server
  const serverFields = [
    'program',
    'app',
    'allowMultipleSends',
    'level',
    'result',
    'testResult',
    'submitted',
    'time',
    'lines',
    'save_to_gallery',
    'attempt',
    'image'
  ];

  validateReport(report);

  // jQuery can do this implicitly, but when url-encoding it, jQuery calls a method that
  // shows the result dialog immediately
  var queryItems = [];
  for (var key in report) {
    if (report.hasOwnProperty(key)) {
      if (serverFields.includes(key)) {
        queryItems.push(key + '=' + report[key]);
      } else {
        // TODO - get rid of before merging ?
        // console.log(`not sending key '${key}' to server`);
      }
    }
  }
  var queryString = queryItems.join('&');

  clientState.trackProgress(report.result, report.lines, report.testResult, appOptions.scriptName, report.serverLevelId || appOptions.serverLevelId);

  // Post milestone iff the server tells us.
  // Check a second switch if we passed the last level of the script.
  // Keep this logic in sync with ActivitiesController#milestone on the server.
  if (appOptions.postMilestone ||
    (appOptions.postFinalMilestone && report.pass && appOptions.level.final_level)) {

    var thisAjax = $.ajax({
      type: 'POST',
      url: report.callback,
      contentType: 'application/x-www-form-urlencoded',
      // Set a timeout of fifteen seconds so the user will get the fallback
      // response even if the server is hung and unresponsive.
      timeout: 15000,
      data: queryString,
      dataType: 'json',
      jsonp: false,
      beforeSend: function (xhr) {
        xhr.setRequestHeader('X-CSRF-Token', $('meta[name="csrf-token"]').attr('content'));
      },
      success: function (response) {
        if (!report.allowMultipleSends && thisAjax !== lastAjaxRequest) {
          return;
        }
        if (appOptions.hasContainedLevels && !response.redirect) {
          // for contained levels, we want to allow the user to Continue even
          // if the answer was incorrect and nextRedirect was not supplied, so
          // populate nextRedirect from the fallback if necessary
          report.pass = true;
          var fallback = getFallbackResponse(report) || {};
          response.redirect = fallback.redirect;
        }
        reportComplete(report, response);
      },
      error: function (xhr, textStatus, thrownError) {
        if (!report.allowMultipleSends && thisAjax !== lastAjaxRequest) {
          return;
        }
        report.error = xhr.responseText;
        reportComplete(report, getFallbackResponse(report));
      }
    });

    lastAjaxRequest = thisAjax;
  } else {
    //There's a potential race condition here - we show the dialog after animation completion, but also after the report
    //is done posting. There is logic that says "don't show the dialog if we are animating" but if milestone posting
    //is disabled then we might show the dialog before the animation starts. Putting a 1-sec delay works around this
    setTimeout(function () {
      reportComplete(report, getFallbackResponse(report));
    }, 1000);
  }

};

reporting.cancelReport = function () {
  if (lastAjaxRequest) {
    lastAjaxRequest.abort();
  }
  lastAjaxRequest = null;
};

function getFallbackResponse(report) {
  var fallbackResponse = maybeParse(report.fallbackResponse);
  if (!fallbackResponse) {
    return null;
  }
  return report.pass ? fallbackResponse.success : fallbackResponse.failure;
}

// TODO: sometimes fallback response is a string, not a parsed object
function maybeParse(data) {
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch (e) {}
  }
  return data;
}

function reportComplete(report, response) {
  lastAjaxRequest = null;
  if (response) {
    lastServerResponse.report_error = report.error;
    lastServerResponse.nextRedirect = response.redirect;
    lastServerResponse.previousLevelRedirect = response.previous_level;
    lastServerResponse.videoInfo = response.video_info;
    lastServerResponse.endOfStageExperience = response.end_of_stage_experience;
    lastServerResponse.previousStageInfo = response.stage_changing && response.stage_changing.previous;
  }
  if (report.onComplete) {
    report.onComplete(response);
  }
}
