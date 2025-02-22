import PropTypes from 'prop-types';
import Radium from 'radium'; // eslint-disable-line no-restricted-imports
import React from 'react';
import {connect} from 'react-redux';

import RedirectDialog from '@cdo/apps/code-studio/components/RedirectDialog';
import {isScriptHiddenForSection} from '@cdo/apps/code-studio/hiddenLessonRedux';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import {PublishedState} from '@cdo/apps/generated/curriculum/sharedCourseConstants';
import {resourceShape} from '@cdo/apps/levelbuilder/shapes';
import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import EndOfLessonDialog from '@cdo/apps/templates/EndOfLessonDialog';
import GoogleClassroomAttributionLabel from '@cdo/apps/templates/progress/GoogleClassroomAttributionLabel';
import ProgressLegend from '@cdo/apps/templates/progress/ProgressLegend';
import ProgressTable from '@cdo/apps/templates/progress/ProgressTable';
import {unitCalendarLesson} from '@cdo/apps/templates/progress/unitCalendarLessonShapes';
import AssessmentsAnnouncementDialog from '@cdo/apps/templates/rubrics/AssessmentsAnnouncementDialog';
import {assignmentCourseVersionShape} from '@cdo/apps/templates/teacherDashboard/shapes';
import color from '@cdo/apps/util/color';
import {
  onDismissRedirectDialog,
  dismissedRedirectDialog,
} from '@cdo/apps/util/dismissVersionRedirect';
import i18n from '@cdo/locale';

import UnitCalendarGrid from './UnitCalendarGrid';
import UnitOverviewActionRow from './UnitOverviewActionRow';
import UnitOverviewHeader from './UnitOverviewHeader';
import UnitOverviewTopRow from './UnitOverviewTopRow';

/**
 * Lesson progress component used in level header and script overview.
 */
class UnitOverview extends React.Component {
  static propTypes = {
    id: PropTypes.number,
    courseOfferingId: PropTypes.number,
    courseVersionId: PropTypes.number,
    courseId: PropTypes.number,
    courseTitle: PropTypes.string,
    courseLink: PropTypes.string,
    excludeCsfColumnInLegend: PropTypes.bool.isRequired,
    teacherResources: PropTypes.arrayOf(resourceShape),
    studentResources: PropTypes.arrayOf(resourceShape),
    showCourseUnitVersionWarning: PropTypes.bool,
    showScriptVersionWarning: PropTypes.bool,
    redirectScriptUrl: PropTypes.string,
    showRedirectWarning: PropTypes.bool,
    versions: PropTypes.objectOf(assignmentCourseVersionShape).isRequired,
    courseName: PropTypes.string,
    showAssignButton: PropTypes.bool,
    assignedSectionId: PropTypes.number,
    unitCalendarLessons: PropTypes.arrayOf(unitCalendarLesson),
    unitHasLevels: PropTypes.bool,
    weeklyInstructionalMinutes: PropTypes.number,
    showCalendar: PropTypes.bool,
    isMigrated: PropTypes.bool,
    scriptOverviewPdfUrl: PropTypes.string,
    scriptResourcesPdfUrl: PropTypes.string,
    isCsdOrCsp: PropTypes.bool,
    completedLessonNumber: PropTypes.string,
    isProfessionalLearningCourse: PropTypes.bool,
    publishedState: PropTypes.oneOf(Object.values(PublishedState)),
    participantAudience: PropTypes.string,
    showAiAssessmentsAnnouncement: PropTypes.bool,

    // redux provided
    scriptId: PropTypes.number.isRequired,
    scriptName: PropTypes.string.isRequired,
    viewAs: PropTypes.oneOf(Object.values(ViewType)).isRequired,
    hiddenLessonState: PropTypes.object,
    selectedSectionId: PropTypes.number,
    userId: PropTypes.number,
    userType: PropTypes.string,
  };

  constructor(props) {
    super(props);
    const showRedirectDialog =
      props.redirectScriptUrl && props.redirectScriptUrl.length > 0;
    this.state = {showRedirectDialog};

    if (props.userType === 'teacher') {
      analyticsReporter.sendEvent(
        EVENTS.UNIT_OVERVIEW_PAGE_VISITED_BY_TEACHER_EVENT,
        {
          'unit name': props.scriptName,
        },
        PLATFORMS.BOTH
      );
    } else if (props.userType === 'student') {
      analyticsReporter.sendEvent(
        EVENTS.UNIT_OVERVIEW_PAGE_VISITED_BY_STUDENT_EVENT,
        {
          'unit name': props.scriptName,
        },
        PLATFORMS.BOTH
      );
    } else {
      analyticsReporter.sendEvent(
        EVENTS.UNIT_OVERVIEW_PAGE_VISITED_BY_SIGNED_OUT_USER_EVENT,
        {
          'unit name': props.scriptName,
        },
        PLATFORMS.BOTH
      );
    }
  }

  onCloseRedirectDialog = () => {
    const {courseName, scriptName} = this.props;
    // Use course name if available, and script name if not.
    onDismissRedirectDialog(courseName || scriptName);
    this.setState({
      showRedirectDialog: false,
    });
  };

  render() {
    const {
      excludeCsfColumnInLegend,
      teacherResources,
      studentResources,
      scriptId,
      scriptName,
      viewAs,
      showCourseUnitVersionWarning,
      showScriptVersionWarning,
      showRedirectWarning,
      redirectScriptUrl,
      versions,
      hiddenLessonState,
      selectedSectionId,
      courseName,
      showAssignButton,
      userId,
      assignedSectionId,
      showCalendar,
      weeklyInstructionalMinutes,
      unitCalendarLessons,
      unitHasLevels,
      isMigrated,
      scriptOverviewPdfUrl,
      scriptResourcesPdfUrl,
      isCsdOrCsp,
      completedLessonNumber,
      courseOfferingId,
      courseVersionId,
      isProfessionalLearningCourse,
      publishedState,
      participantAudience,
      showAiAssessmentsAnnouncement,
    } = this.props;

    const displayRedirectDialog =
      redirectScriptUrl && !dismissedRedirectDialog(courseName || scriptName);

    const isHiddenUnit =
      !!selectedSectionId &&
      !!scriptId &&
      isScriptHiddenForSection(hiddenLessonState, selectedSectionId, scriptId);

    return (
      <div>
        {completedLessonNumber && (
          <EndOfLessonDialog lessonNumber={completedLessonNumber} />
        )}
        <div>
          {this.props.courseLink && (
            <div className="unit-breadcrumb" style={styles.navArea}>
              <a
                href={this.props.courseLink}
                style={styles.navLink}
              >{`< ${this.props.courseTitle}`}</a>
            </div>
          )}
          {displayRedirectDialog && (
            <RedirectDialog
              isOpen={this.state.showRedirectDialog}
              details={i18n.assignedToNewerVersion()}
              handleClose={this.onCloseRedirectDialog}
              redirectUrl={redirectScriptUrl}
              redirectButtonText={i18n.goToAssignedVersion()}
            />
          )}
          <UnitOverviewHeader
            showCourseUnitVersionWarning={showCourseUnitVersionWarning}
            showScriptVersionWarning={showScriptVersionWarning}
            showRedirectWarning={showRedirectWarning}
            showHiddenUnitWarning={isHiddenUnit}
            versions={versions}
            courseName={courseName}
            userId={userId}
          >
            <UnitOverviewActionRow
              courseVersionId={courseVersionId}
              versions={versions}
              viewAs={viewAs}
              showAssignButton={showAssignButton}
              courseOfferingId={courseOfferingId}
              scriptId={scriptId}
              participantAudience={participantAudience}
              scriptOverviewPdfUrl={scriptOverviewPdfUrl}
              scriptResourcesPdfUrl={scriptResourcesPdfUrl}
              teacherResources={teacherResources}
              isMigrated={isMigrated}
            />
          </UnitOverviewHeader>
          {/* unit-calendar-for-printing has style `display: none` from `style/curriculum/scripts.scss` which is added from the BE */}
          {showCalendar && viewAs === ViewType.Instructor && (
            <div className="unit-calendar-for-printing print-only">
              <UnitCalendarGrid
                lessons={unitCalendarLessons}
                weeklyInstructionalMinutes={weeklyInstructionalMinutes || 225}
                weekWidth={550}
              />
            </div>
          )}
          <UnitOverviewTopRow
            teacherResources={teacherResources}
            studentResources={studentResources}
            showAssignButton={showAssignButton}
            assignedSectionId={assignedSectionId}
            showCalendar={showCalendar}
            weeklyInstructionalMinutes={weeklyInstructionalMinutes}
            unitCalendarLessons={unitCalendarLessons}
            isMigrated={isMigrated}
            scriptOverviewPdfUrl={scriptOverviewPdfUrl}
            scriptResourcesPdfUrl={scriptResourcesPdfUrl}
            courseOfferingId={courseOfferingId}
            courseVersionId={courseVersionId}
            isProfessionalLearningCourse={isProfessionalLearningCourse}
            courseLink={this.props.courseLink}
            publishedState={publishedState}
            participantAudience={participantAudience}
            isUnitWithLevels={unitHasLevels}
          />
        </div>
        <ProgressTable minimal={false} />
        <ProgressLegend
          includeCsfColumn={!excludeCsfColumnInLegend}
          includeReviewStates={isCsdOrCsp}
        />
        <GoogleClassroomAttributionLabel />
        {showAiAssessmentsAnnouncement ? (
          <AssessmentsAnnouncementDialog />
        ) : (
          <div id="uitest-no-ai-assessments-announcement" />
        )}
      </div>
    );
  }
}

const styles = {
  navLink: {
    fontSize: 14,
    lineHeight: '22px',
    color: color.purple,
  },
  navArea: {
    padding: '10px 0px',
  },
};

export const UnconnectedUnitOverview = Radium(UnitOverview);
export default connect((state, ownProps) => ({
  scriptId: state.progress.scriptId,
  scriptName: state.progress.scriptName,
  viewAs: state.viewAs,
  hiddenLessonState: state.hiddenLesson,
  selectedSectionId: state.teacherSections.selectedSectionId,
}))(UnconnectedUnitOverview);
