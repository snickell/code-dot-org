import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import Button from './Button';
import i18n from '@cdo/locale';
import {unassignSection} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import UnassignSectionDialog from '@cdo/apps/templates/UnassignSectionDialog';

class UnassignButton extends React.Component {
  static propTypes = {
    sectionId: PropTypes.number.isRequired,
    showUnassignDialog: PropTypes.bool,
    courseName: PropTypes.string,
    sectionName: PropTypes.string,
    // Redux
    unassignSection: PropTypes.func.isRequired,
    isRtl: PropTypes.bool
  };

  constructor() {
    super();
    this.state = {
      text: i18n.assigned(),
      icon: 'check'
    };
  }

  onMouseOver = event => {
    this.setState({text: i18n.unassign(), icon: 'times'});
  };

  onMouseOut = event => {
    this.setState({text: i18n.assigned(), icon: 'check'});
  };

  toggleUnassignDialog = () => {
    this.props.showUnassignDialog = !this.props.showUnassignDialog;
  };

  confirmUnassign = () => {
    unassignSection(this.props.sectionId);
  };

  render() {
    const {text, icon} = this.state;
    const {
      isRtl,
      showUnassignDialog,
      sectionId,
      courseName,
      sectionName
    } = this.props;

    // Adjust styles if locale is RTL
    const buttonMarginStyle = isRtl
      ? styles.buttonMarginRTL
      : styles.buttonMargin;

    return (
      <div
        onMouseOver={this.onMouseOver}
        onMouseLeave={this.onMouseOut}
        style={buttonMarginStyle}
        className={'uitest-unassign-button'}
      >
        <Button
          __useDeprecatedTag
          color={Button.ButtonColor.green}
          text={text}
          icon={icon}
          onClick={this.toggleUnassignDialog}
        />
        {showUnassignDialog && (
          <UnassignSectionDialog
            courseName={courseName}
            sectionName={sectionName}
            isOpen={true}
            sectionId={sectionId}
            onClose={this.toggleUnassignDialog}
            isUnassignPending={false}
            unassignSection={this.confirmUnassign}
          />
        )}
      </div>
    );
  }
}

const styles = {
  buttonMargin: {
    marginLeft: 10,
    display: 'flex',
    alignItems: 'center'
  },
  buttonMarginRTL: {
    marginRight: 10,
    display: 'flex',
    alignItems: 'center'
  }
};

export const UnconnectedUnassignButton = UnassignButton;

export default connect(
  state => ({
    isRtl: state.isRtl
  }),
  unassignSection
)(UnassignButton);
