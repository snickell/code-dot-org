import React from 'react';
import {useNavigate, NavLink} from 'react-router-dom';

import {LinkButton} from '@cdo/apps/componentLibrary/button';
import Button from '@cdo/apps/componentLibrary/button/Button';
import emptyDesk from '@cdo/apps/templates/teacherDashboard/images/empty_desk.svg';
import blankScreen from '@cdo/apps/templates/teacherDashboard/images/no_curriculum_assigned.svg';
import TeacherDashboardEmptyState from '@cdo/apps/templates/teacherNavigation/images/TeacherDashboardEmptyState.svg';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import i18n from '@cdo/locale';

import EmptyState from './EmptyState';
import {TEACHER_NAVIGATION_PATHS} from './TeacherNavigationPaths';

import styles from './teacher-navigation.module.scss';

interface ElementOrEmptyPageProps {
  showNoStudents: boolean;
  showNoCurriculumAssigned: boolean;
  showNoUnitAssigned?: boolean;
  showNoLessonMaterialsForLegacyCourses?: boolean;
  showNoCalendarForLegacyCourses?: boolean;
  showNoLessonMaterialsForLesson?: boolean;
  showNoCalendarForThisUnit?: boolean;
  isOnCalendarPage?: boolean;
  courseName?: string | null;
  element: React.ReactElement;
}

const ElementOrEmptyPage: React.FC<ElementOrEmptyPageProps> = ({
  showNoStudents,
  showNoCurriculumAssigned,
  showNoUnitAssigned,
  showNoLessonMaterialsForLegacyCourses,
  showNoCalendarForLegacyCourses,
  showNoLessonMaterialsForLesson,
  showNoCalendarForThisUnit,
  isOnCalendarPage,
  courseName,
  element,
}) => {
  const isLoadingSectionData = useAppSelector(
    state => state.teacherSections.isLoadingSectionData
  );

  const lessonMaterialsOrCalendarPage = isOnCalendarPage
    ? i18n.theCalendar()
    : i18n.theLessonMaterials();

  const navigate = useNavigate();

  const navigateToCoursePage = () => {
    navigate(`../${TEACHER_NAVIGATION_PATHS.courseOverview}`, {
      relative: 'path',
    });
  };

  // TODO: Add images for empty states
  const EMPTY_STATE = {
    noStudents: {
      headline: i18n.emptySectionHeadline(),
      descriptionText: i18n.emptySectionDescription(),
      imageComponent: <img src={emptyDesk} alt="empty desk" />,
      button: (
        <NavLink
          key={TEACHER_NAVIGATION_PATHS.roster}
          to={TEACHER_NAVIGATION_PATHS.roster}
          className={styles.navLink}
        >
          {i18n.addStudents()}
        </NavLink>
      ),
    },
    noCurriculumAssigned: {
      headline: i18n.emptySectionHeadline(),
      descriptionText: i18n.noCurriculumAssigned(),
      imageComponent: <img src={blankScreen} alt="blank screen" />,
      button: <LinkButton href="/catalog" text={i18n.browseCurriculum()} />,
    },
    noUnitAssigned: {
      headline: i18n.almostThere(),
      descriptionText: i18n.noUnitAssigned({
        courseName: courseName ? courseName : '',
      }),
      imageComponent: (
        <img src={TeacherDashboardEmptyState} alt={i18n.almostThere()} />
      ),
      button: (
        <Button onClick={navigateToCoursePage} text={i18n.assignAUnit()} />
      ),
    },
    noLessonMaterialsForLegacyCourses: {
      headline: i18n.lessonMaterialsAreNotAvailable(),
      descriptionText: i18n.lessonMaterialsLegacyMessage({
        courseName: courseName,
      }),
      imageComponent: (
        <img src={TeacherDashboardEmptyState} alt={i18n.almostThere()} />
      ),
      button: (
        <Button onClick={navigateToCoursePage} text={i18n.goToCourse()} />
      ),
    },
    noCalendarForLegacyCourses: {
      headline: i18n.calendarNotAvailable(),
      descriptionText: i18n.calendarLegacyMessage({courseName: courseName}),
      imageComponent: (
        <img src={TeacherDashboardEmptyState} alt={i18n.almostThere()} />
      ),
      button: null,
    },
    noLessonMaterialsForThisLesson: {
      headline: i18n.lessonMaterialsNone(),
      descriptionText: null,
      imageComponent: (
        <img src={TeacherDashboardEmptyState} alt={i18n.almostThere()} />
      ),
      button: null,
    },
    noCalendarForThisUnit: {
      headline: i18n.calendarNotAvailable(),
      descriptionText: null,
      imageComponent: (
        <img src={TeacherDashboardEmptyState} alt={i18n.almostThere()} />
      ),
      button: null,
    },
    noUnitAssignedForCalendarOrLessonMaterials: {
      headline: i18n.almostThere(),
      descriptionText: i18n.noUnitAssigned({
        page: lessonMaterialsOrCalendarPage,
        courseName: courseName ? courseName : i18n.thisCourse(),
      }),
      imageComponent: (
        <img src={TeacherDashboardEmptyState} alt={i18n.almostThere()} />
      ),
      button: (
        <Button onClick={navigateToCoursePage} text={i18n.assignAUnit()} />
      ),
    },
  };

  // This will be updated to show the correct empty state based on the props passed in
  let currentEmptyState;

  if (showNoStudents) {
    currentEmptyState = EMPTY_STATE.noStudents;
  } else if (isOnCalendarPage && showNoCurriculumAssigned) {
    currentEmptyState = EMPTY_STATE.noUnitAssignedForCalendarOrLessonMaterials;
  } else if (showNoCalendarForLegacyCourses) {
    currentEmptyState = EMPTY_STATE.noCalendarForLegacyCourses;
  } else if (showNoCalendarForThisUnit) {
    currentEmptyState = EMPTY_STATE.noCalendarForThisUnit;
  } else if (showNoCurriculumAssigned) {
    currentEmptyState = EMPTY_STATE.noCurriculumAssigned;
  } else {
    currentEmptyState = EMPTY_STATE.noUnitAssigned;
  }
  const {imageComponent, headline, descriptionText, button} = currentEmptyState;

  // Don't show the empty state if we're still loading data
  if (
    isLoadingSectionData ||
    (!showNoStudents &&
      !showNoCurriculumAssigned &&
      !showNoUnitAssigned &&
      !showNoCalendarForLegacyCourses &&
      !showNoCalendarForThisUnit)
  ) {
    return element;
  } else {
    return (
      <EmptyState
        headline={headline}
        descriptionText={descriptionText}
        imageComponent={imageComponent}
        button={button}
      />
    );
  }
};

export default ElementOrEmptyPage;
