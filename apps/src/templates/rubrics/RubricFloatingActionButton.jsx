import classnames from 'classnames';
import PropTypes from 'prop-types';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {connect} from 'react-redux';

import {BodyFourText, StrongText} from '@cdo/apps/componentLibrary/typography';
import ErrorBoundary from '@cdo/apps/lab2/ErrorBoundary';
import FontAwesome from '@cdo/apps/legacySharedComponents/FontAwesome';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {
  selectHasLoadedStudentStatus,
  selectReadyStudentCount,
} from '@cdo/apps/templates/rubrics/teacherRubricRedux';
import {selectedSectionSelector} from '@cdo/apps/templates/teacherDashboard/teacherSectionsReduxSelectors';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import {tryGetSessionStorage, trySetSessionStorage} from '@cdo/apps/utils';
import i18n from '@cdo/locale';
import aiFabIcon from '@cdo/static/ai-bot-centered-teal.png';
import aiBotOutlineIcon from '@cdo/static/ai-bot-outline.png';
import taIcon from '@cdo/static/ai-bot-tag-TA.png';
import rubricFabIcon from '@cdo/static/rubric-fab-background.png';

import RubricContainer from './RubricContainer';
import {
  rubricShape,
  reportingDataShape,
  studentLevelInfoShape,
} from './rubricShapes';
import StudentScoresAlert from './StudentScoresAlert';

import style from './rubrics.module.scss';

export const RubricErrorContainer = ({isOpen, setIsOpen}) => (
  <div
    className={style.rubricContainer}
    style={isOpen ? null : {display: 'none'}}
  >
    <div className={style.rubricHeaderRedesign}>
      <div className={style.rubricHeaderLeftSide}>
        <img
          src={aiBotOutlineIcon}
          className={style.aiBotOutlineIcon}
          alt={i18n.rubricAiHeaderText()}
        />
        <span>{i18n.rubricAiHeaderText()}</span>
      </div>
      <div className={style.rubricHeaderRightSide}>
        <button
          type="button"
          onClick={_ => setIsOpen(!isOpen)}
          className={classnames(style.buttonStyle, style.closeButton)}
        >
          <FontAwesome icon="xmark" />
        </button>
      </div>
    </div>
    <div className={classnames(style.fabBackground, style.fabErrorBackground)}>
      <div className={style.visibleRubricContent}>
        <p>{i18n.rubricAiInternalError()}</p>
      </div>
    </div>
  </div>
);

RubricErrorContainer.propTypes = {
  isOpen: PropTypes.bool,
  setIsOpen: PropTypes.func,
};

function RubricFloatingActionButton({
  rubric,
  studentLevelInfo,
  currentLevelName,
  reportingData,
  aiEnabled,
  sectionId,
  canShowTaScoresAlert,
}) {
  const sessionStorageKey = 'RubricFabOpenStateKey';

  const initialIsOpen = useMemo(() => {
    return JSON.parse(tryGetSessionStorage(sessionStorageKey, false)) || false;
  }, []);
  const [isOpen, setIsOpen] = useState(initialIsOpen);

  // Show the pulse if this is the first time the user has seen the FAB in this
  // session. Depends on other logic which sets the open state in session storage.
  const [isFirstSession] = useState(
    tryGetSessionStorage(sessionStorageKey, null) === null
  );
  const [isFabImageLoaded, setIsFabImageLoaded] = useState(false);
  const [isTaImageLoaded, setIsTaImageLoaded] = useState(false);

  const [internalError, setInternalError] = useState(null);

  const onLevelForEvaluation = currentLevelName === rubric.level.name;

  const readyStudentCount = useAppSelector(selectReadyStudentCount);
  const hasLoadedStudentStatus = useAppSelector(selectHasLoadedStudentStatus);
  const showCountBubble =
    onLevelForEvaluation && hasLoadedStudentStatus && readyStudentCount > 0;

  const eventData = useMemo(() => {
    return {
      ...reportingData,
      viewingStudentWork: !!studentLevelInfo,
      viewingEvaluationLevel: rubric.level.name === currentLevelName,
    };
  }, [reportingData, studentLevelInfo, rubric.level.name, currentLevelName]);

  const handleClick = () => {
    const eventName = isOpen
      ? EVENTS.TA_RUBRIC_CLOSED_FROM_FAB_EVENT
      : EVENTS.TA_RUBRIC_OPENED_FROM_FAB_EVENT;
    analyticsReporter.sendEvent(eventName, eventData);
    if (!isOpen && showCountBubble) {
      setSeenTaScores();
    }
    setIsOpen(!isOpen);
  };

  const [hasSeenAlert, setHasSeenAlert] = useState(!canShowTaScoresAlert);
  const showScoresAlert =
    canShowTaScoresAlert && !hasSeenAlert && showCountBubble;

  const [dismissConfirmed, setDismissConfirmed] = useState(false);

  const setSeenTaScores = useCallback(() => {
    setHasSeenAlert(true);

    fetch(`/api/v1/users/set_seen_ta_scores`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({lesson_id: rubric.lesson.id}),
    })
      .then(response => {
        setDismissConfirmed(true);
      })
      .catch(error => {
        console.error('Error setting seen TA scores:', error);
      });
  }, [rubric.lesson.id]);

  const viewScores = () => {
    setSeenTaScores();
    setIsOpen(true);
  };

  // Dismiss the alert if the TA window is open initially.
  useEffect(() => {
    if (canShowTaScoresAlert && !hasSeenAlert && initialIsOpen) {
      setSeenTaScores();
    }
  }, [canShowTaScoresAlert, hasSeenAlert, initialIsOpen, setSeenTaScores]);

  const logInternalError = (error, componentStack) => {
    console.error(
      'Internal error in the RubricFloatingActionButton component:',
      error,
      componentStack
    );
  };

  const onInternalError = (error, componentStack) => {
    logInternalError(error, componentStack);
    setInternalError(error);
  };

  useEffect(() => {
    if (!!studentLevelInfo) {
      analyticsReporter.sendEvent(
        EVENTS.TA_RUBRIC_ON_STUDENT_WORK_LOADED,
        eventData
      );

      const fireUnloadEvent = () =>
        analyticsReporter.sendEvent(
          EVENTS.TA_RUBRIC_ON_STUDENT_WORK_UNLOADED,
          eventData
        );
      window.addEventListener('beforeunload', fireUnloadEvent);

      return () => {
        window.removeEventListener('beforeunload', fireUnloadEvent);
      };
    }
  }, [eventData, studentLevelInfo]); // Neither of these should change, so this should run once

  useEffect(() => {
    analyticsReporter.sendEvent(
      isOpen
        ? EVENTS.TA_RUBRIC_OPEN_ON_PAGE_LOAD
        : EVENTS.TA_RUBRIC_CLOSED_ON_PAGE_LOAD,
      eventData
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // disabling isOpen dependency because we only want this to report the initial open state once

  useEffect(() => {
    trySetSessionStorage(sessionStorageKey, isOpen);
  }, [isOpen]);

  const fabIcon = aiEnabled ? aiFabIcon : rubricFabIcon;
  const allImagesLoaded =
    isFabImageLoaded && (showCountBubble || isTaImageLoaded);

  const showPulse = isFirstSession && allImagesLoaded && hasLoadedStudentStatus;
  const classes = showPulse
    ? classnames(style.floatingActionButton, style.pulse, 'unittest-fab-pulse')
    : style.floatingActionButton;

  return (
    <div id="fab-contained">
      <button
        id="ui-floatingActionButton"
        aria-label={i18n.openOrCloseTeachingAssistant()}
        className={classes}
        onClick={handleClick}
        type="button"
      >
        <img
          alt="AI bot"
          src={fabIcon}
          onLoad={() => !isFabImageLoaded && setIsFabImageLoaded(true)}
        />
      </button>
      {showCountBubble ? (
        <>
          <div
            className={classnames(
              style.countOverlay,
              'uitest-count-bubble',
              dismissConfirmed && 'uitest-dismiss-confirmed'
            )}
          >
            <BodyFourText className={style.countText}>
              <StrongText>
                <span aria-label={i18n.aiEvaluationsToReview()}>
                  {readyStudentCount}
                </span>
              </StrongText>
            </BodyFourText>
          </div>
          {showScoresAlert && (
            <StudentScoresAlert
              closeAlert={setSeenTaScores}
              viewScores={viewScores}
            />
          )}
        </>
      ) : (
        <div
          className={style.taOverlay}
          style={{backgroundImage: `url(${taIcon})`}}
        >
          <img
            src={taIcon}
            alt="TA overlay"
            onLoad={() => !isTaImageLoaded && setIsTaImageLoaded(true)}
          />
        </div>
      )}
      {/* TODO: do not hardcode in AI setting */}
      <ErrorBoundary
        fallback={
          <RubricErrorContainer
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            error={internalError}
          />
        }
        onError={onInternalError}
      >
        <RubricContainer
          rubric={rubric}
          studentLevelInfo={studentLevelInfo}
          reportingData={reportingData}
          onLevelForEvaluation={onLevelForEvaluation}
          teacherHasEnabledAi={aiEnabled}
          open={isOpen}
          closeRubric={handleClick}
          sectionId={sectionId}
        />
      </ErrorBoundary>
    </div>
  );
}

RubricFloatingActionButton.propTypes = {
  rubric: rubricShape,
  studentLevelInfo: studentLevelInfoShape,
  currentLevelName: PropTypes.string,
  reportingData: reportingDataShape,
  aiEnabled: PropTypes.bool,
  sectionId: PropTypes.number,
  canShowTaScoresAlert: PropTypes.bool,
};

export const UnconnectedRubricFloatingActionButton = RubricFloatingActionButton;

export default connect(state => ({
  sectionId: selectedSectionSelector(state)?.id,
}))(RubricFloatingActionButton);
