import React from 'react';

import {Heading3, BodyTwoText} from '@cdo/apps/componentLibrary/typography';

import styles from './teacher-navigation.module.scss';
import dashboardStyles from '@cdo/apps/templates/teacherDashboard/teacher-dashboard.module.scss';

interface EmptyStateProps {
  headline: string | null;
  descriptionText: string | null;
  imageComponent: React.ReactElement;
  button: React.ReactElement | null;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  headline,
  descriptionText,
  imageComponent,
  button,
}) => {
  return (
    <div className={dashboardStyles.emptyClassroomDiv}>
      <div className={dashboardStyles.emptyClassroomDiv}>
        {imageComponent}
        <Heading3 className={styles.topPadding}>{headline}</Heading3>
        <BodyTwoText>{descriptionText}</BodyTwoText>
        {button}
      </div>
    </div>
  );
};
export default EmptyState;
