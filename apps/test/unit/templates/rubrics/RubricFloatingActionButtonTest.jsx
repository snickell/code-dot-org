import {act, render, screen, fireEvent} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';

import teacherPanel, {
  setLevelsWithProgress,
  setLoadedLevelsWithProgressForTest,
} from '@cdo/apps/code-studio/teacherPanelRedux';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux,
} from '@cdo/apps/redux';
import {UnconnectedRubricFloatingActionButton as RubricFloatingActionButton} from '@cdo/apps/templates/rubrics/RubricFloatingActionButton';
import teacherRubric, {
  setLoadedStudentStatusForTest,
} from '@cdo/apps/templates/rubrics/teacherRubricRedux';
import teacherSections, {
  setStudentsForCurrentSection,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {LevelStatus} from '@cdo/generated-scripts/sharedConstants';
import i18n from '@cdo/locale';

async function wait() {
  for (let _ = 0; _ < 10; _++) {
    await act(async () => {
      await Promise.resolve();
    });
  }
}

jest.mock('@cdo/apps/util/HttpClient', () => ({
  post: jest.fn().mockResolvedValue({
    json: jest.fn().mockReturnValue({}),
  }),
}));

fetch.mockIf(/\/rubrics\/.*/, JSON.stringify(''));

const sectionId = 999;
const defaultProps = {
  rubric: {
    id: 1,
    level: {
      name: 'test-level',
    },
    learningGoals: [
      {
        id: 1,
        key: 'abc',
        learningGoal: 'Learning Goal 1',
        aiEnabled: true,
        evidenceLevels: [
          {id: 1, understanding: 1, teacherDescription: 'lg level 1'},
        ],
        tips: 'Tips',
      },
    ],
  },
  currentLevelName: 'test-level',
  studentLevelInfo: null,
};

const studentAlice = {id: 11, name: 'Alice'};
const studentBob = {id: 22, name: 'Bob'};
const levelNotTried = {
  id: '123',
  assessment: null,
  contained: false,
  paired: false,
  partnerNames: null,
  partnerCount: null,
  isConceptLevel: false,
  levelNumber: 4,
  passed: false,
  status: LevelStatus.not_tried,
};
describe('RubricFloatingActionButton', () => {
  let sendEventSpy;
  let store;
  let fetchStub;

  function stubFetch({
    evalStatusForAll = {},
    teacherEvals = [],
    tourStatus = {seen: true},
  }) {
    fetchStub.mockImplementation(url => {
      // Stubs out getting the overall AI status, which is part of RubricSettings but
      // useful to track alongside the user status, here
      if (/rubrics\/\d+\/ai_evaluation_status_for_all.*/.test(url)) {
        return Promise.resolve(new Response(JSON.stringify(evalStatusForAll)));
      }

      if (/rubrics\/\d+\/get_teacher_evaluations_for_all.*/.test(url)) {
        return Promise.resolve(new Response(JSON.stringify(teacherEvals)));
      }

      if (/rubrics\/\w+\/get_ai_rubrics_tour_seen/.test(url)) {
        return Promise.resolve(new Response(JSON.stringify(tourStatus)));
      }
    });
  }

  const levelsWithProgress = [
    {...levelNotTried, userId: studentAlice.id},
    {...levelNotTried, userId: studentBob.id},
  ];

  const notAttemptedStatusAll = {
    attemptedCount: 0,
    attemptedUnevaluatedCount: 0,
    csrfToken: 'abcdef',
    aiEvalStatusMap: {
      11: 'NOT_STARTED',
      22: 'NOT_STARTED',
    },
  };

  const readyStatusAll = {
    attemptedCount: 2,
    attemptedUnevaluatedCount: 0,
    csrfToken: 'abcdef',
    aiEvalStatusMap: {
      11: 'READY_TO_REVIEW',
      22: 'READY_TO_REVIEW',
    },
  };

  const noEvals = [
    {
      user_name: 'Alice',
      user_id: 11,
      eval: [],
    },
    {
      user_name: 'Bob',
      user_id: 22,
      eval: [],
    },
  ];

  beforeEach(() => {
    stubRedux();
    registerReducers({
      teacherRubric,
      teacherSections,
      teacherPanel,
    });
    store = getStore();
    sendEventSpy = jest.spyOn(analyticsReporter, 'sendEvent');
    fetchStub = jest.spyOn(window, 'fetch');
    sessionStorage.clear();
  });

  afterEach(() => {
    restoreRedux();
    jest.restoreAllMocks();
    sessionStorage.clear();
  });

  describe('pulse animation', () => {
    it('renders pulse animation when session storage is empty', () => {
      store.dispatch(setLoadedStudentStatusForTest());
      render(
        <Provider store={store}>
          <RubricFloatingActionButton {...defaultProps} />
        </Provider>
      );
      expect(sendEventSpy).toHaveBeenCalledWith(
        EVENTS.TA_RUBRIC_CLOSED_ON_PAGE_LOAD,
        {
          viewingStudentWork: false,
          viewingEvaluationLevel: true,
        }
      );
      const fab = screen.getByRole('button', {
        name: i18n.openOrCloseTeachingAssistant(),
      });
      expect(fab.classList.contains('unittest-fab-pulse')).toBe(false);

      const fabImage = screen.getByRole('img', {name: 'AI bot'});
      fireEvent.load(fabImage);
      expect(fab.classList.contains('unittest-fab-pulse')).toBe(false);

      const taImage = screen.getByRole('img', {name: 'TA overlay'});
      fireEvent.load(taImage);
      expect(fab.classList.contains('unittest-fab-pulse')).toBe(true);
    });

    it('does not render pulse animation before student status loads', () => {
      render(
        <Provider store={store}>
          <RubricFloatingActionButton {...defaultProps} />
        </Provider>
      );

      const fabImage = screen.getByRole('img', {name: 'AI bot'});
      fireEvent.load(fabImage);

      const taImage = screen.getByRole('img', {name: 'TA overlay'});
      fireEvent.load(taImage);

      const fab = screen.getByRole('button', {
        name: i18n.openOrCloseTeachingAssistant(),
      });
      expect(fab.classList.contains('unittest-fab-pulse')).toBe(false);
    });

    it('does not render pulse animation when open state is present in session storage', () => {
      store.dispatch(setLoadedStudentStatusForTest());
      sessionStorage.setItem('RubricFabOpenStateKey', 'false');
      render(
        <Provider store={store}>
          <RubricFloatingActionButton {...defaultProps} />
        </Provider>
      );
      expect(sendEventSpy).toHaveBeenCalledWith(
        EVENTS.TA_RUBRIC_CLOSED_ON_PAGE_LOAD,
        {
          viewingStudentWork: false,
          viewingEvaluationLevel: true,
        }
      );
      const image = screen.getByRole('img', {name: 'AI bot'});
      fireEvent.load(image);
      const fab = screen.getByRole('button', {
        name: i18n.openOrCloseTeachingAssistant(),
      });
      expect(fab.classList.contains('unittest-fab-pulse')).toBe(false);
    });
  });

  describe('TA icon bubble', () => {
    beforeEach(() => {
      store.dispatch(setLevelsWithProgress(levelsWithProgress));
      store.dispatch(setLoadedLevelsWithProgressForTest());
      store.dispatch(
        setStudentsForCurrentSection(sectionId, [studentAlice, studentBob])
      );
    });

    it('renders TA overlay when there are no students to review', async () => {
      stubFetch({
        evalStatusForAll: notAttemptedStatusAll,
        teacherEvals: noEvals,
      });

      render(
        <Provider store={store}>
          <RubricFloatingActionButton {...defaultProps} sectionId={sectionId} />
        </Provider>
      );

      await wait();

      expect(screen.getByRole('img', {name: 'TA overlay'})).toBeVisible();
      expect(
        screen.queryByLabelText(i18n.aiEvaluationsToReview())
      ).not.toBeInTheDocument();
    });

    it('renders count bubble when there are students to review', async () => {
      stubFetch({
        evalStatusForAll: readyStatusAll,
        teacherEvals: noEvals,
      });

      render(
        <Provider store={store}>
          <RubricFloatingActionButton {...defaultProps} sectionId={sectionId} />
        </Provider>
      );

      await wait();

      expect(
        screen.queryByRole('img', {name: 'TA overlay'})
      ).not.toBeInTheDocument();
      const countBubble = screen.getByLabelText(i18n.aiEvaluationsToReview());
      expect(countBubble).toBeVisible();
      expect(countBubble.textContent).toBe('2');
    });
  });

  it('begins closed when student level info is null', () => {
    render(
      <Provider store={store}>
        <RubricFloatingActionButton {...defaultProps} />
      </Provider>
    );
    expect(screen.queryByText(i18n.rubricAiHeaderText())).not.toBeVisible();
  });

  it('opens RubricContainer when clicked', () => {
    render(
      <Provider store={store}>
        <RubricFloatingActionButton {...defaultProps} />
      </Provider>
    );
    const button = screen.getByRole('button', {
      name: i18n.openOrCloseTeachingAssistant(),
    });
    fireEvent.click(button);
    expect(screen.getByText(i18n.rubricAiHeaderText())).toBeVisible();
  });

  it('sends events when opened and closed', () => {
    const reportingData = {unitName: 'test-2023', levelName: 'test-level'};
    render(
      <Provider store={store}>
        <RubricFloatingActionButton
          {...defaultProps}
          reportingData={reportingData}
        />
      </Provider>
    );
    expect(screen.queryByText(i18n.rubricAiHeaderText())).not.toBeVisible();
    const button = screen.getByRole('button', {
      name: i18n.openOrCloseTeachingAssistant(),
    });
    fireEvent.click(button);
    expect(screen.getByText(i18n.rubricAiHeaderText())).toBeVisible();

    expect(sendEventSpy).toHaveBeenCalledWith(
      EVENTS.TA_RUBRIC_OPENED_FROM_FAB_EVENT,
      {
        ...reportingData,
        viewingStudentWork: false,
        viewingEvaluationLevel: true,
      }
    );

    fireEvent.click(button);
    expect(screen.queryByText(i18n.rubricAiHeaderText())).not.toBeVisible();

    expect(sendEventSpy).toHaveBeenCalledWith(
      EVENTS.TA_RUBRIC_CLOSED_FROM_FAB_EVENT,
      {
        ...reportingData,
        viewingStudentWork: false,
        viewingEvaluationLevel: true,
      }
    );
  });

  it('sends open on page load event when open state is true in session storage', () => {
    sessionStorage.setItem('RubricFabOpenStateKey', 'true');
    render(
      <Provider store={store}>
        <RubricFloatingActionButton {...defaultProps} />
      </Provider>
    );
    expect(sendEventSpy).toHaveBeenCalledWith(
      EVENTS.TA_RUBRIC_OPEN_ON_PAGE_LOAD,
      {
        viewingStudentWork: false,
        viewingEvaluationLevel: true,
      }
    );
    const image = screen.getByRole('img', {name: 'AI bot'});
    fireEvent.load(image);
    const fab = screen.getByRole('button', {
      name: i18n.openOrCloseTeachingAssistant(),
    });
    expect(fab.classList.contains('unittest-fab-pulse')).toBe(false);
  });
});
