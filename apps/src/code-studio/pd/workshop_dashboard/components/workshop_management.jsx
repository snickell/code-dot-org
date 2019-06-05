/**
 * Workshop management buttons (view, edit, delete).
 */
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {Button} from 'react-bootstrap';
import {WorkshopTypes} from '@cdo/apps/generated/pd/sharedWorkshopConstants';
import ConfirmationDialog from '../../components/confirmation_dialog';
import {PermissionPropType} from '../permission';

export class WorkshopManagement extends React.Component {
  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  static propTypes = {
    permission: PermissionPropType.isRequired,
    workshopId: PropTypes.number.isRequired,
    course: PropTypes.string,
    subject: PropTypes.string,
    viewUrl: PropTypes.string.isRequired,
    editUrl: PropTypes.string,
    onDelete: PropTypes.func,
    showSurveyUrl: PropTypes.bool,
    date: PropTypes.string
  };

  static defaultProps = {
    editUrl: null,
    onDelete: null
  };

  constructor(props) {
    super(props);

    if (props.showSurveyUrl) {
      let surveyBaseUrl = null;
      if (this.use_daily_survey_route()) {
        surveyBaseUrl = 'daily_survey_results';
      } else if (props.subject === WorkshopTypes.local_summer) {
        surveyBaseUrl = 'local_summer_workshop_survey_results';
      }

      if (surveyBaseUrl) {
        this.surveyUrl = `/${surveyBaseUrl}/${this.props.workshopId}`;
      } else {
        this.surveyUrl = null;
      }
    }
  }

  use_daily_survey_route = () => {
    let workshop_date = new Date(this.props.date);

    let new_local_summer_and_teachercon =
      workshop_date.getFullYear() >= 2018 &&
      [WorkshopTypes.local_summer, WorkshopTypes.teachercon].includes(
        this.props.subject
      );

    // 2018-08-01 is when we started using JotForm.  Don't change this date here.
    let new_facilitator_weekend =
      workshop_date >= new Date('2018-08-01') &&
      ['CS Discoveries', 'CS Principles'].includes(this.props.course) &&
      this.props.subject !== 'Code.org Facilitator Weekend';

    // 2019-05-20 is when we started using a JotForm survey for Deep Dive workshops.
    // Don't change this date here.
    let new_csf_201 =
      workshop_date >= new Date('2019-05-20') &&
      this.props.subject === 'Deep Dive';

    return (
      new_local_summer_and_teachercon || new_facilitator_weekend || new_csf_201
    );
  };

  state = {
    showDeleteConfirmation: false
  };

  handleViewClick = event => {
    event.preventDefault();
    this.context.router.push(this.props.viewUrl);
  };

  handleEditClick = event => {
    event.preventDefault();
    this.context.router.push(this.props.editUrl);
  };

  handleDeleteClick = () => {
    this.setState({showDeleteConfirmation: true});
  };

  handleDeleteCanceled = () => {
    this.setState({showDeleteConfirmation: false});
  };

  handleDeleteConfirmed = () => {
    this.setState({showDeleteConfirmation: false});
    this.props.onDelete(this.props.workshopId);
  };

  handleSurveyClick = event => {
    event.preventDefault();
    this.context.router.push(this.surveyUrl);
  };

  renderViewButton() {
    return (
      <Button
        bsSize="xsmall"
        href={this.context.router.createHref(this.props.viewUrl)}
        onClick={this.handleViewClick}
      >
        View Workshop
      </Button>
    );
  }

  renderEditButton() {
    if (!this.props.editUrl) {
      return null;
    }

    return (
      <Button
        bsSize="xsmall"
        href={this.context.router.createHref(this.props.editUrl)}
        onClick={this.handleEditClick}
      >
        Edit
      </Button>
    );
  }

  renderSurveyButton() {
    if (!this.props.showSurveyUrl || !this.surveyUrl) {
      return null;
    }

    return (
      <Button
        bsSize="xsmall"
        href={this.context.router.createHref(this.surveyUrl)}
        onClick={this.handleSurveyClick}
      >
        View Survey Results
      </Button>
    );
  }

  renderDeleteButton() {
    if (!this.props.onDelete) {
      return null;
    }

    return (
      <Button bsSize="xsmall" onClick={this.handleDeleteClick}>
        Delete
      </Button>
    );
  }

  render() {
    return (
      <div>
        {this.renderViewButton()}
        {this.renderEditButton()}
        {this.renderDeleteButton()}
        {this.renderSurveyButton()}
        <ConfirmationDialog
          show={this.state.showDeleteConfirmation}
          onOk={this.handleDeleteConfirmed}
          onCancel={this.handleDeleteCanceled}
          headerText="Delete Workshop"
          bodyText="Are you sure you want to delete this workshop? Once deleted it can't be recovered."
        />
      </div>
    );
  }
}

export default connect(state => ({
  permission: state.workshopDashboard.permission
}))(WorkshopManagement);
