/* eslint no-unused-vars: "error" */
import codebridgeWorkspace from '@codebridge/redux/workspaceRedux';

import teacherPanel from '@cdo/apps/code-studio/teacherPanelRedux';
import javalabEditor from '@cdo/apps/javalab/redux/editorRedux';
import javalab from '@cdo/apps/javalab/redux/javalabRedux';
import lab from '@cdo/apps/lab2/lab2Redux';
import lab2Project from '@cdo/apps/lab2/redux/lab2ProjectRedux';
import predictLevel from '@cdo/apps/lab2/redux/predictLevelRedux';
import lab2System from '@cdo/apps/lab2/redux/systemRedux';
import {getStore, registerReducers} from '@cdo/apps/redux';
import arrowDisplay from '@cdo/apps/templates/arrowDisplayRedux';
import currentUser from '@cdo/apps/templates/currentUserRedux';
import teacherRubric from '@cdo/apps/templates/rubrics/teacherRubricRedux';
import teacherSections from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';

import microBit from '../maker/microBitRedux';
import frozenProjectInfoDialog from '../templates/projects/frozenProjectInfoDialog/frozenProjectInfoDialogRedux';
import projects from '../templates/projects/projectsRedux';
import publishDialog from '../templates/projects/publishDialog/publishDialogRedux';

import app from './appRedux';
import calendar from './calendarRedux';
import shareDialog from './components/shareDialogRedux';
import header from './headerRedux';
import hiddenLesson from './hiddenLessonRedux';
import isRtl from './isRtlRedux';
import lessonLock from './lessonLockRedux';
import progress from './progressRedux';
import project from './projectRedux';
import responsive from './responsiveRedux';
import verifiedInstructor from './verifiedInstructorRedux';
import viewAs from './viewAsRedux';

registerReducers({
  header,
  project,
  app,
  progress,
  teacherSections,
  teacherPanel,
  lessonLock,
  viewAs,
  shareDialog,
  hiddenLesson,
  isRtl,
  responsive,
  publishDialog,
  frozenProjectInfoDialog,
  projects,
  verifiedInstructor,
  currentUser,
  arrowDisplay,
  microBit,
  lab,
  lab2Project,
  javalabEditor,
  javalab,
  predictLevel,
  lab2System,
  codebridgeWorkspace,
  calendar,
  teacherRubric,
});

export {getStore};
