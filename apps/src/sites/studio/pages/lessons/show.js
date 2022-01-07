import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import {Provider} from 'react-redux';

import ExpandableImageDialog from '@cdo/apps/templates/lessonOverview/ExpandableImageDialog';
import LessonOverview from '@cdo/apps/templates/lessonOverview/LessonOverview';
import announcementsReducer, {
  addAnnouncement
} from '@cdo/apps/code-studio/announcementsRedux';
import getScriptData from '@cdo/apps/util/getScriptData';
import instructionsDialog from '@cdo/apps/redux/instructionsDialog';
import isRtl from '@cdo/apps/code-studio/isRtlRedux';
import {getStore} from '@cdo/apps/code-studio/redux';
import {registerReducers} from '@cdo/apps/redux';
import {
  setVerified,
  setVerifiedResources
} from '@cdo/apps/code-studio/verifiedInstructorRedux';
import {setViewType, ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import {tooltipifyVocabulary} from '@cdo/apps/utils';
import {customInputTypes} from '@cdo/apps/p5lab/spritelab/blocks';
import animationList, {
  setInitialAnimationList
} from '@cdo/apps/p5lab/redux/animationList';
import {
  valueTypeTabShapeMap,
  exampleSprites
} from '@cdo/apps/p5lab/spritelab/constants';
import assetUrl from '@cdo/apps/code-studio/assetUrl';
import {installCustomBlocks} from '@cdo/apps/block_utils';

$(document).ready(function() {
  prepareBlockly();
  displayLessonOverview();
  prepareExpandableImageDialog();
  tooltipifyVocabulary();
});

function prepareBlockly() {
  const customBlocksConfig = getScriptData('customBlocksConfig');
  if (!customBlocksConfig) {
    return;
  }
  Blockly.assetUrl = assetUrl;
  Blockly.typeHints = true;
  Blockly.Css.inject(document);

  // Spritelab-specific logic but not harmful to other labs.
  registerReducers({
    animationList
  });
  const store = getStore();
  store.dispatch(setInitialAnimationList(exampleSprites));
  Blockly.valueTypeTabShapeMap = valueTypeTabShapeMap(Blockly);

  installCustomBlocks({
    blockly: Blockly,
    blockDefinitions: customBlocksConfig,
    customInputTypes
  });
}

/**
 * Collect and preprocess all data for the lesson and its activities, and
 * render the React component which displays them.
 */
function displayLessonOverview() {
  const lessonData = getScriptData('lesson');
  const activities = lessonData['activities'];
  const isTeacher = lessonData['is_teacher'];

  // Rename any keys that are different on the backend.
  activities.forEach(activity => {
    // React key which must be unique for each object in the list.
    activity.key = activity.id + '';

    activity.displayName = activity.name || '';
    delete activity.name;

    activity.duration = activity.duration || 0;

    activity.activitySections.forEach(activitySection => {
      // React key
      activitySection.key = activitySection.id + '';

      activitySection.displayName = activitySection.name || '';
      delete activitySection.name;

      activitySection.duration = activitySection.duration || 0;

      activitySection.text = activitySection.description || '';
      delete activitySection.description;

      activitySection.tips = activitySection.tips || [];
      activitySection.tips.forEach(tip => {
        // React key
        tip.key = _.uniqueId();
      });

      activitySection.scriptLevels.forEach(scriptLevel => {
        // The position within the lesson
        scriptLevel.levelNumber = scriptLevel.position;
        delete scriptLevel.position;
      });
    });
  });

  const store = getStore();
  registerReducers({isRtl});

  if (lessonData.hasVerifiedResources) {
    store.dispatch(setVerifiedResources());
  }

  if (isTeacher) {
    store.dispatch(setViewType(ViewType.Instructor));

    if (lessonData.isVerifiedInstructor) {
      store.dispatch(setVerified());
    }
  }

  if (lessonData.announcements) {
    registerReducers({announcements: announcementsReducer});
    lessonData.announcements.forEach(announcement =>
      store.dispatch(
        addAnnouncement(
          announcement.notice,
          announcement.details,
          announcement.link,
          announcement.type,
          announcement.visibility
        )
      )
    );
  }

  ReactDOM.render(
    <Provider store={store}>
      <LessonOverview lesson={lessonData} activities={activities} />
    </Provider>,
    document.getElementById('show-container')
  );
}

/**
 * Initialize the DOM Element and React Component which serve as containers to
 * display expandable images.
 *
 * @see @cdo/apps/src/templates/utils/expandableImages
 */
function prepareExpandableImageDialog() {
  registerReducers({instructionsDialog});

  const container = document.createElement('div');
  document.body.appendChild(container);

  ReactDOM.render(
    <Provider store={getStore()}>
      <ExpandableImageDialog />
    </Provider>,
    container
  );
}
