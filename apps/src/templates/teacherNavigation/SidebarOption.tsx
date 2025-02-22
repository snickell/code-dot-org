import classNames from 'classnames';
import React from 'react';
import {NavLink, generatePath} from 'react-router-dom';

import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon/FontAwesomeV6Icon';
import {BodyTwoText} from '@cdo/apps/componentLibrary/typography';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';

import {LABELED_TEACHER_NAVIGATION_PATHS} from './TeacherNavigationPaths';

import styles from './teacher-navigation.module.scss';

interface SidebarOptionProps {
  isSelected: boolean;
  sectionId?: number;
  courseVersionName?: string;
  unitName: string | null;
  pathKey: keyof typeof LABELED_TEACHER_NAVIGATION_PATHS;
}

const SidebarOption: React.FC<SidebarOptionProps> = ({
  isSelected,
  sectionId,
  courseVersionName,
  unitName,
  pathKey,
}) => {
  const reportMetric = (path: string) => () => {
    analyticsReporter.sendEvent(EVENTS.NAVIGATE_TO_PAGE, {
      nextPage: path,
    });
  };

  return (
    <NavLink
      key={LABELED_TEACHER_NAVIGATION_PATHS[pathKey].label}
      to={generatePath(LABELED_TEACHER_NAVIGATION_PATHS[pathKey].absoluteUrl, {
        sectionId: sectionId,
        courseVersionName: courseVersionName,
        unitName: unitName,
      })}
      className={classNames(styles.sidebarOption, {
        [styles.selected]: isSelected,
      })}
      onClick={reportMetric(pathKey)}
    >
      <div className={styles.iconContainer}>
        <FontAwesomeV6Icon
          className={styles.optionIcon}
          iconName={LABELED_TEACHER_NAVIGATION_PATHS[pathKey].icon || ''}
        />
      </div>
      <BodyTwoText
        className={classNames(styles.linkText, {
          [styles.selected]: isSelected,
        })}
      >
        {LABELED_TEACHER_NAVIGATION_PATHS[pathKey].label}
      </BodyTwoText>
    </NavLink>
  );
};

export default SidebarOption;
