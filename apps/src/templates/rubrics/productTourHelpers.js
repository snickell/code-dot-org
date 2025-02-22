import React from 'react';

import i18n from '@cdo/locale';
import evidenceDemo from '@cdo/static/ai-evidence-demo.gif';

// intro.js-react allows a string or a react component for the intro prop.
// Providing a string that was written by a translator is risky, because it
// could contain malicious HTML. This helper method wraps the string in a react
// fragment, which will take care of sanitizing the string.
const sanitize = unsafe => <>{unsafe}</>;

export const INITIAL_STEP = 0;
export const STEPS = [
  {
    element: '#ui-floatingActionButton',
    title: i18n.rubricTourGettingStartedTitle(),
    intro: sanitize(i18n.rubricTourGettingStartedText()),
  },
  {
    element: '#class-data-button',
    title: i18n.rubricTabClassManagement(),
    intro: sanitize(i18n.rubricTourClassDataText()),
  },
  {
    element: '#tour-ai-assessment',
    title: i18n.rubricTourUnderstandingTitle(),
    intro: sanitize(i18n.rubricTourUnderstandingText()),
  },
  {
    element: '#tour-ai-evidence',
    title: i18n.rubricTourEvidenceTitle(),
    position: 'top',
    intro: (
      <>
        <p>{i18n.rubricTourEvidenceText()}</p>
        <img src={evidenceDemo} alt={i18n.rubricTourEvidenceAltText()} />
      </>
    ),
  },
  {
    element: '#tour-ai-confidence',
    title: i18n.rubricTourConfidenceTitle(),
    intro: sanitize(i18n.rubricTourConfidenceText()),
  },
  {
    element: '#tour-evidence-levels',
    title: i18n.rubricTourAssigningTitle(),
    intro: sanitize(i18n.rubricTourAssigningText()),
  },
  {
    element: '#tour-ai-assessment-feedback',
    title: i18n.rubricTourFeedbackTitle(),
    intro: sanitize(i18n.rubricTourFeedbackText()),
  },
];

// Dummy props for product tour
export const DUMMY_PROPS = {
  rubricDummy: {
    id: 1,
    learningGoals: [
      {
        id: 1,
        key: '1',
        learningGoal: i18n.catVariables(),
        aiEnabled: true,
        evidenceLevels: [
          {
            id: 141,
            understanding: 0,
            teacherDescription:
              'Errors in program sequencing are significant enoug… or the Draw loop is not used to create animation',
          },
          {
            id: 142,
            understanding: 1,
            teacherDescription:
              'You have several sequencing errors, resulting in m…e code is improperly placed in or out of the loop',
          },
          {
            id: 143,
            understanding: 2,
            teacherDescription:
              'You properly separated code in and out of the draw…ew elements hidden behind others unintentionally.',
          },
          {
            id: 144,
            understanding: 3,
            teacherDescription:
              'You sequenced the program well (1)  and properly separated code in and out of the draw loop (2).',
          },
        ],
      },
    ],
    lesson: {
      position: 3,
      name: 'Data Structures',
    },
    level: {
      name: 'test_level',
      position: 7,
    },
  },
  studentLevelInfoDummy: {
    name: 'Grace Hopper',
    timeSpent: 305,
    lastAttempt: '1980-07-31T00:00:00.000Z',
    attempts: 6,
  },
  aiEvaluationsDummy: [
    {
      id: 1,
      learning_goal_id: 1,
      understanding: 2,
      aiConfidencePassFail: 2,
      evidence: '',
    },
  ],
};
