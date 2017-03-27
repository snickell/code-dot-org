/**
 * This is a set of helpers that is used to generate test level/lesson content.
 * It lives in src because it's used by both story files and test files, and it
 * better to have test require helpers from src, then story files in src reach
 * into test.
 */

import _ from 'lodash';
import { LevelStatus } from '@cdo/apps/util/sharedConstants';
import { createStore } from 'redux';
import Immutable from 'immutable';

export const fakeLesson = (name, id, lockable=false, stageNumber=undefined) => ({
  name,
  id,
  lockable,
  stageNumber,
  isFocusArea: false
});

export const fakeLevel = overrides => {
  const levelNumber = overrides.levelNumber;
  return {
    status: LevelStatus.not_tried,
    url: `/level${levelNumber}`,
    name: `Level ${levelNumber}`,
    ...overrides
  };
};

export const fakeLevels = (numLevels, startLevel = 1) =>
  _.range(numLevels).map(index => fakeLevel({levelNumber: index + startLevel}));

/**
 * Creates the shell of a redux store with the provided lessonId being hidden
 * @param {ViewType} viewAs
 * @param {number?} lessonId - Lesson to hide (or null if none)
 */
export const createStoreWithHiddenLesson = (viewAs, lessonId) => {
  return createStore(state => state, {
    stageLock: {
      stagesBySectionId: {
        '11': {}
      },
      viewAs
    },
    sections: {
      selectedSectionId: '11'
    },
    hiddenStage: Immutable.fromJS({
      bySection: {
        '11': { [lessonId]: true }
      }
    }),
    progress: {
      showTeacherInfo: false
    }
  });
};
