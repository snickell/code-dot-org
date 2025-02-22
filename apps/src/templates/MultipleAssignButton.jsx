import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import Button from '@cdo/apps/legacySharedComponents/Button';
import MultipleSectionsAssigner from '@cdo/apps/templates/MultipleSectionsAssigner';
import {sectionForDropdownShape} from '@cdo/apps/templates/teacherDashboard/shapes';
import {
  assignToSection,
  unassignSection,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {sectionsForDropdown} from '@cdo/apps/templates/teacherDashboard/teacherSectionsReduxSelectors';
import i18n from '@cdo/locale';

class MultipleAssignButton extends React.Component {
  static propTypes = {
    courseId: PropTypes.number,
    courseOfferingId: PropTypes.number,
    courseVersionId: PropTypes.number,
    scriptId: PropTypes.number,
    assignmentName: PropTypes.string,
    reassignConfirm: PropTypes.func,
    isAssigningCourse: PropTypes.bool,
    isStandAloneUnit: PropTypes.bool,
    participantAudience: PropTypes.string,
    // Redux
    assignToSection: PropTypes.func.isRequired,
    isRtl: PropTypes.bool,
    sectionsForDropdown: PropTypes.arrayOf(sectionForDropdownShape).isRequired,
  };

  state = {
    assignmentChoiceDialogOpen: false,
  };

  onCloseDialog = () => {
    this.setState({
      assignmentChoiceDialogOpen: false,
    });
  };

  handleClick = () => {
    this.setState({
      assignmentChoiceDialogOpen: true,
    });
  };

  render() {
    const {assignmentChoiceDialogOpen} = this.state;
    const {
      courseId,
      courseOfferingId,
      courseVersionId,
      scriptId,
      assignmentName,
      isStandAloneUnit,
      sectionsForDropdown,
      participantAudience,
      isAssigningCourse,
      reassignConfirm,
    } = this.props;

    return (
      <div>
        <Button
          color={Button.ButtonColor.brandSecondaryDefault}
          text={i18n.assignToMultipleSections()}
          icon="plus"
          onClick={this.handleClick}
          className={'uitest-assign-button'}
        />
        {assignmentChoiceDialogOpen && (
          <MultipleSectionsAssigner
            assignmentName={assignmentName}
            onClose={this.onCloseDialog}
            sections={sectionsForDropdown}
            courseId={courseId}
            courseOfferingId={courseOfferingId}
            scriptId={scriptId}
            courseVersionId={courseVersionId}
            reassignConfirm={reassignConfirm}
            isAssigningCourse={isAssigningCourse}
            isStandAloneUnit={isStandAloneUnit}
            participantAudience={participantAudience}
          />
        )}
      </div>
    );
  }
}

export const UnconnectedMultipleAssignButton = MultipleAssignButton;

export default connect(
  (state, ownProps) => ({
    isRtl: state.isRtl,
    sectionsForDropdown: sectionsForDropdown(
      state.teacherSections,
      ownProps.courseOfferingId,
      ownProps.courseVersionId,
      state.progress.scriptId
    ),
  }),
  {
    assignToSection,
    unassignSection,
  }
)(MultipleAssignButton);
