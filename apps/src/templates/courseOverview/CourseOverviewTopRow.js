import PropTypes from 'prop-types';
import React, {Component} from 'react';

import {resourceShape} from '@cdo/apps/levelbuilder/shapes';
import SectionAssigner from '@cdo/apps/templates/teacherDashboard/SectionAssigner';
import {sectionForDropdownShape} from '@cdo/apps/templates/teacherDashboard/shapes';

import {showV2TeacherDashboard} from '../teacherNavigation/TeacherNavFlagUtils';

export default class CourseOverviewTopRow extends Component {
  static propTypes = {
    sectionsForDropdown: PropTypes.arrayOf(sectionForDropdownShape).isRequired,
    id: PropTypes.number.isRequired,
    courseOfferingId: PropTypes.number,
    courseVersionId: PropTypes.number,
    teacherResources: PropTypes.arrayOf(resourceShape),
    studentResources: PropTypes.arrayOf(resourceShape),
    showAssignButton: PropTypes.bool,
    isInstructor: PropTypes.bool,
    courseName: PropTypes.string,
    participantAudience: PropTypes.string,
  };

  render() {
    const {
      id,
      courseOfferingId,
      courseVersionId,
      showAssignButton,
      sectionsForDropdown,
      isInstructor,
      courseName,
      participantAudience,
    } = this.props;

    return (
      <div style={styles.main} className="course-overview-top-row">
        {isInstructor && !showV2TeacherDashboard() && (
          <SectionAssigner
            sections={sectionsForDropdown}
            showAssignButton={showAssignButton}
            courseId={id}
            isAssigningCourse={true}
            courseOfferingId={courseOfferingId}
            courseVersionId={courseVersionId}
            assignmentName={courseName}
            participantAudience={participantAudience}
          />
        )}
      </div>
    );
  }
}

const styles = {
  main: {
    marginBottom: 10,
    position: 'relative',
  },
  dropdown: {
    display: 'inline-block',
  },
};
