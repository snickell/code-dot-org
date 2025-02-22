import _ from 'lodash';
import React, {useState, useEffect} from 'react';
import {
  generatePath,
  matchPath,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';

import {SimpleDropdown} from '@cdo/apps/componentLibrary/dropdown';
import Tags from '@cdo/apps/componentLibrary/tags/Tags';
import Typography from '@cdo/apps/componentLibrary/typography';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import SidebarOption from '@cdo/apps/templates/teacherNavigation/SidebarOption';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import i18n from '@cdo/locale';

import {selectedSectionSelector} from '../teacherDashboard/teacherSectionsReduxSelectors';

import {asyncLoadSelectedSection} from './selectedSectionLoader';
import {
  LABELED_TEACHER_NAVIGATION_PATHS,
  TEACHER_NAVIGATION_PATHS,
} from './TeacherNavigationPaths';

import styles from './teacher-navigation.module.scss';

const TeacherNavigationBar: React.FunctionComponent = () => {
  const sections = useAppSelector(state => state.teacherSections.sections);

  const [sectionArray, setSectionArray] = useState<
    {value: string; text: string}[]
  >([]);

  const selectedSection = useAppSelector(selectedSectionSelector);

  const isLoadingSectionData = useAppSelector(
    state => state.teacherSections.isLoadingSectionData
  );

  useEffect(() => {
    const updatedSectionArray = Object.entries(sections)
      .filter(([id, section]) => !section.hidden)
      .map(([id, section]) => ({
        value: id,
        text: section.name,
      }));

    setSectionArray(updatedSectionArray);
  }, [sections, selectedSection]);

  const getSectionHeader = (label: string) => {
    return (
      <Typography
        semanticTag={'h2'}
        visualAppearance={'overline-two'}
        className={styles.sectionHeader}
      >
        {label}
      </Typography>
    );
  };

  const coursecontentSectionTitle = getSectionHeader(i18n.courseContent());

  let courseContentKeys: (keyof typeof LABELED_TEACHER_NAVIGATION_PATHS)[];
  if (selectedSection?.unitName) {
    courseContentKeys = ['unitOverview', 'lessonMaterials', 'calendar'];
  } else {
    courseContentKeys = ['courseOverview', 'lessonMaterials', 'calendar'];
  }

  const performanceSectionTitle = getSectionHeader(i18n.performance());
  const performanceContentKeys: (keyof typeof LABELED_TEACHER_NAVIGATION_PATHS)[] =
    ['progress', 'assessments', 'projects', 'stats', 'textResponses'];

  const classroomContentSectionTitle = getSectionHeader(i18n.classroom());
  const classroomContentKeys: (keyof typeof LABELED_TEACHER_NAVIGATION_PATHS)[] =
    ['roster', 'settings'];

  const teacherNavigationBarContent = [
    {
      title: coursecontentSectionTitle,
      keys: courseContentKeys,
      sectionTag: (
        <Tags tagsList={[{label: 'New'}]} className={styles.sidebarNewTags} />
      ),
    },
    {
      title: performanceSectionTitle,
      keys: performanceContentKeys,
      sectionTag: null,
    },
    {
      title: classroomContentSectionTitle,
      keys: classroomContentKeys,
      sectionTag: null,
    },
  ];

  const navigate = useNavigate();
  const location = useLocation();
  const urlSectionId = useParams().sectionId;

  const [currentPathName, currentPathObject] = React.useMemo(() => {
    return (
      _.find(
        Object.entries(LABELED_TEACHER_NAVIGATION_PATHS),
        path => !!matchPath(path[1].absoluteUrl, location.pathname)
      ) || [null, null]
    );
  }, [location]);

  React.useEffect(() => {
    if (urlSectionId && parseInt(urlSectionId) !== selectedSection?.id) {
      asyncLoadSelectedSection(urlSectionId);
    }
  }, [urlSectionId, selectedSection?.id]);

  const navigateToDifferentSection = (sectionId: number) => {
    if (currentPathObject?.absoluteUrl) {
      if (
        currentPathObject.url === TEACHER_NAVIGATION_PATHS.courseOverview ||
        currentPathObject.url === TEACHER_NAVIGATION_PATHS.unitOverview
      ) {
        const overviewUrl = sections[sectionId]?.unitName
          ? LABELED_TEACHER_NAVIGATION_PATHS.unitOverview.absoluteUrl
          : LABELED_TEACHER_NAVIGATION_PATHS.courseOverview.absoluteUrl;
        navigate(
          generatePath(overviewUrl, {
            sectionId: sectionId,
            courseVersionName: sections[sectionId]?.courseVersionName,
            unitName: sections[sectionId]?.unitName,
          })
        );
      } else {
        navigate(
          generatePath(currentPathObject.absoluteUrl, {
            sectionId: sectionId,
            courseVersionName: sections[sectionId]?.courseVersionName,
            unitName: sections[sectionId]?.unitName,
          })
        );
        if (currentPathObject.url === TEACHER_NAVIGATION_PATHS.settings) {
          window.location.reload();
        }
      }

      analyticsReporter.sendEvent(EVENTS.NAVIGATE_TO_SECTION, {
        sectionId: sectionId,
        currentPage: currentPathName,
      });
    }
  };

  const getSidebarOptionsForSection = (
    sidebarKeys: (keyof typeof LABELED_TEACHER_NAVIGATION_PATHS)[]
  ) => {
    if (!selectedSection) {
      return [];
    }
    return sidebarKeys.map(key => (
      <SidebarOption
        key={'ui-test-sidebar-' + key}
        isSelected={currentPathName === key}
        sectionId={selectedSection.id}
        courseVersionName={selectedSection.courseVersionName}
        unitName={selectedSection.unitName}
        pathKey={key as keyof typeof LABELED_TEACHER_NAVIGATION_PATHS}
      />
    ));
  };

  const navbarComponents = teacherNavigationBarContent.map(
    ({title, keys, sectionTag}, index) => {
      const sidebarOptions = getSidebarOptionsForSection(keys);

      return (
        <div key={`section-${index}`}>
          <div className={styles.sidebarSectionHeader}>
            {title}
            {sectionTag}
          </div>
          {sidebarOptions}
        </div>
      );
    }
  );

  return (
    <nav className={styles.sidebarContainer} id="ui-test-teacher-sidebar">
      <div className={styles.sidebarContent}>
        <Typography
          semanticTag={'h2'}
          visualAppearance={'overline-two'}
          className={styles.sectionHeader}
        >
          {i18n.classSections()}
        </Typography>
        <SimpleDropdown
          items={sectionArray}
          onChange={event =>
            navigateToDifferentSection(parseInt(event.target.value))
          }
          labelText=""
          size="m"
          selectedValue={String(selectedSection?.id)}
          className={styles.sectionDropdown}
          name="section-dropdown"
          id="uitest-sidebar-section-dropdown"
          color="gray"
          disabled={isLoadingSectionData || !selectedSection}
        />
        {navbarComponents.map(component => component)}
      </div>
    </nav>
  );
};

export default TeacherNavigationBar;
