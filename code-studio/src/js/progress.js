/* globals dashboard, appOptions  */

import React from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import _ from 'lodash';
import clientState from './clientState';
import StageProgress from './components/progress/stage_progress.jsx';
import CourseProgress from './components/progress/course_progress.jsx';

var progress = module.exports;

/**
 * See ActivityConstants.
 */
const MINIMUM_PASS_RESULT = 20;
const MINIMUM_OPTIMAL_RESULT = 30;
const SUBMITTED_RESULT = 1000;
const REVIEW_REJECTED_RESULT = 1500;
const REVIEW_ACCEPTED_RESULT = 2000;

/**
 * See ApplicationHelper#activity_css_class.
 * @param result
 * @return {string}
 */
progress.activityCssClass = function (result) {
  if (!result) {
    return 'not_tried';
  }
  if (result === SUBMITTED_RESULT) {
    return 'submitted';
  }
  if (result >= MINIMUM_OPTIMAL_RESULT) {
    return 'perfect';
  }
  if (result >= MINIMUM_PASS_RESULT) {
    return 'passed';
  }
  return 'attempted';
};

/**
 * See ApplicationHelper::PUZZLE_PAGE_NONE.
 */
progress.PUZZLE_PAGE_NONE = -1;

/**
 * Returns the "best" of the two results, as defined in apps/src/constants.js.
 * Note that there are negative results that count as an attempt, so we can't
 * just take the maximum.
 * @param {Number} a
 * @param {Number} b
 * @return {string} The result css class.
 */
progress.mergedActivityCssClass = function (a, b) {
  return progress.activityCssClass(clientState.mergeActivityResult(a, b));
};

progress.populateProgress = function (scriptName, puzzlePage) {
  var status;

  // Render the progress the client knows about (from sessionStorage)
  var clientProgress = clientState.allLevelsProgress()[scriptName] || {};
  Object.keys(clientProgress).forEach(function (levelId) {
    $('.user-stats-block .level-' + levelId).addClass(progress.activityCssClass(clientProgress[levelId]));
  });

  $.ajax('/api/user_progress/' + scriptName).done(function (data) {
    data = data || {};

    // Show lesson plan links if teacher
    if (data.isTeacher) {
      $('.stage-lesson-plan-link').show();
    }

    // Merge progress from server (loaded via AJAX)
    var serverProgress = data.levels || {};
    Object.keys(serverProgress).forEach(function (levelId) {
      // Only the server can speak to whether a level is submitted/accepted/rejected.  If it is,
      // apply this styling but don't cache locally.
      if (serverProgress[levelId].result > clientState.MAXIMUM_CACHABLE_RESULT) {
        var status;
        if (serverProgress[levelId].result === REVIEW_REJECTED_RESULT) {
          status = 'review_rejected';
        }
        if (serverProgress[levelId].result === REVIEW_ACCEPTED_RESULT) {
          status = 'review_accepted';
        }
        // Clear the existing class and replace
        $('.level-' + levelId).attr('class', `level_link ${status}`);
      } else if (serverProgress[levelId].submitted) {
        // Clear the existing class and replace
        $('.level-' + levelId).attr('class', 'level_link submitted');
      } else if (serverProgress[levelId].pages_completed) {
        // This is a multi-page level.  There will be multiple dots for the same level ID,
        // so we need to decorate each of them individually.
        var pagesCompleted = serverProgress[levelId].pages_completed;
        for (var page = 0; page < pagesCompleted.length; page++) {
          // The dot is considered perfect if the page is considered complete.
          var pageCompleted = pagesCompleted[page];
          status = pageCompleted ? "perfect" : "attempted";

          // Clear the existing class and replace.
          $($('.user-stats-block .level-' + levelId)[page]).attr('class', 'level-' + levelId + ' level_link ' + status);

          // If this is the current level, highlight it.
          if (window.appOptions && appOptions.serverLevelId && levelId === appOptions.serverLevelId && puzzlePage-1 === page) {
            $($('.user-stats-block .level-' + appOptions.serverLevelId)[puzzlePage-1]).parent().addClass('puzzle_outer_current');
          }
        }
      } else if (serverProgress[levelId].result !== clientProgress[levelId]) {
        status = progress.mergedActivityCssClass(clientProgress[levelId], serverProgress[levelId].result);

        // Clear the existing class and replace
        $('.level-' + levelId).attr('class', 'level_link ' + status);

        // Write down new progress in sessionStorage
        clientState.trackProgress(null, null, serverProgress[levelId].result, scriptName, levelId);
      }
    });
  });

  // Unless we already highlighted a specific page, highlight the current level.
  if (puzzlePage === progress.PUZZLE_PAGE_NONE && window.appOptions && appOptions.serverLevelId) {
    $('.level-' + appOptions.serverLevelId).parent().addClass('puzzle_outer_current');
  }
};

progress.renderStageProgress = function (stageData, progressData, clientProgress, currentLevelId, puzzlePage) {
  var serverProgress = progressData.levels || {};
  var currentLevelIndex = null;
  var lastLevelId = null;
  var levelRepeat = 0;

  var combinedProgress = stageData.levels.map(function (level, index) {
    // Determine the current level index.
    // However, because long assessments can have the same level appearing
    // multiple times, just set this the first time it's determined.
    if (level.id === currentLevelId && currentLevelIndex === null) {
      currentLevelIndex = index;
    }

    // If we have a multi-page level, then we will encounter the same level ID
    // multiple times in a row.  Keep track of how many times we've seen it
    // repeat, so that we know what page we're up to.
    if (level.id === lastLevelId) {
      levelRepeat++;
    } else {
      lastLevelId = level.id;
      levelRepeat = 0;
    }

    var status;
    var result = (serverProgress[level.id] || {}).result;
    if (serverProgress && result > clientState.MAXIMUM_CACHABLE_RESULT) {
      if (result === REVIEW_REJECTED_RESULT) {
        status = 'review_rejected';
      }
      if (result === REVIEW_ACCEPTED_RESULT) {
        status = 'review_accepted';
      }
    } else if (serverProgress && serverProgress[level.id] && serverProgress[level.id].submitted) {
      status = "submitted";
    } else if (serverProgress && serverProgress[level.id] && serverProgress[level.id].pages_completed) {
      // The dot is considered perfect if the page is considered complete.
      var pageCompleted = serverProgress[level.id].pages_completed[levelRepeat];
      status = pageCompleted ? "perfect" : "attempted";
    } else if (clientState.queryParams('user_id')) {
      // Show server progress only (the student's progress)
      status = progress.activityCssClass(result);
    } else {
      // Merge server progress with local progress
      status = progress.mergedActivityCssClass(result, clientProgress[level.id]);
    }

    var href = level.url + location.search;

    return {
      title: level.title,
      status: status,
      kind: level.kind,
      url: href,
      id: level.id
    };
  });

  if (currentLevelIndex !== null && puzzlePage !== progress.PUZZLE_PAGE_NONE) {
    currentLevelIndex += puzzlePage - 1;
  }

  var mountPoint = document.createElement('div');
  mountPoint.style.display = 'inline-block';
  $('.progress_container').replaceWith(mountPoint);
  ReactDOM.render(React.createElement(StageProgress, {
    levels: combinedProgress,
    currentLevelIndex: currentLevelIndex,
    saveAnswersFirst: puzzlePage !== progress.PUZZLE_PAGE_NONE
  }), mountPoint);
};

progress.renderCourseProgress = function (scriptData) {
  var store = loadProgress(scriptData);
  var mountPoint = document.createElement('div');

  $.ajax('/api/user_progress/' + scriptData.name).done(data => {
    data = data || {};

    // Show lesson plan links if teacher
    if (data.isTeacher) {
      $('.stage-lesson-plan-link').show();
    }

    // Merge progress from server (loaded via AJAX)
    if (data.levels) {
      store.dispatch({
        type: 'MERGE_PROGRESS',
        progress: _.mapValues(data.levels, level => level.submitted ? SUBMITTED_RESULT : level.result)
      });
    }
  });

  $('.user-stats-block').prepend(mountPoint);
  ReactDOM.render(
    <Provider store={store}>
      <CourseProgress />
    </Provider>,
    mountPoint
  );
};

function loadProgress(scriptData) {
  var teacherCourse = $('#landingpage').hasClass('teacher-course');

  let store = createStore((state = [], action) => {
    if (action.type === 'MERGE_PROGRESS') {
      let newProgress = {};
      return {
        display: state.display,
        progress: newProgress,
        stages: state.stages.map(stage => _.assign({}, stage, {levels: stage.levels.map(level => {
          let id = level.uid || level.id;
          newProgress[id] = clientState.mergeActivityResult(state.progress[id], action.progress[id]);

          return _.assign({}, level, {status: progress.activityCssClass(newProgress[id])});
        })}))
      };
    }
    return state;
  }, {
    display: teacherCourse ? 'list' : 'dots',
    progress: {},
    stages: scriptData.stages
  });

  // Merge in progress saved on the client.
  store.dispatch({
    type: 'MERGE_PROGRESS',
    progress: clientState.allLevelsProgress()[scriptData.name] || {}
  });

  // Progress from the server should be written down locally.
  store.subscribe(() => {
    clientState.batchTrackProgress(scriptData.name, store.getState().progress);
  });

  return store;
}
