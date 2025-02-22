import PropTypes from 'prop-types';
import React, {Component} from 'react';

import Button, {buttonColors} from '@cdo/apps/componentLibrary/button/Button';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import i18n from '@cdo/locale';

import BaseDialog from './BaseDialog';
import DialogFooter from './teacherDashboard/DialogFooter';

export default class GDPRDialog extends Component {
  static propTypes = {
    isDialogOpen: PropTypes.bool.isRequired,
    currentUserId: PropTypes.number.isRequired,
    // If we're coming from pegasus, studioUrlPrefix is passed in as a prop and used to construct the logout url.
    studioUrlPrefix: PropTypes.string,
  };

  state = {
    isDialogOpen: this.props.isDialogOpen,
  };

  handleYesClick = () => {
    this.setState({isDialogOpen: false});
    $.post('/dashboardapi/v1/users/accept_data_transfer_agreement', {
      user_id: this.props.currentUserId,
    }).then(() => {
      const gdprDataScript = document.querySelector('script[data-gdpr]');
      const gdprData = JSON.parse(gdprDataScript.dataset['gdpr']);
      gdprData.show_gdpr_dialog = false;
      gdprDataScript.dataset['gdpr'] = JSON.stringify(gdprData);
    });
  };

  render() {
    const {studioUrlPrefix} = this.props;
    const logOutUrl = studioUrlPrefix
      ? `${studioUrlPrefix}/users/sign_out`
      : '/users/sign_out';

    return (
      <BaseDialog
        useUpdatedStyles
        isOpen={this.state.isDialogOpen}
        style={styles.dialog}
        uncloseable
      >
        <h2 className="ui-test-gdpr-dialog">
          {i18n.gdprDialogHeaderUpdated()}
        </h2>
        <div>{i18n.gdprDialogDetailsUpdated()}</div>
        <div style={styles.instructions}>
          <a
            href={pegasus('/privacy')}
            className="ui-test-gdpr-dialog-privacy-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            {i18n.gdprDialogVisitPrivacyPolicy()}
          </a>
        </div>
        <DialogFooter>
          <Button
            className="ui-test-gdpr-dialog-logout"
            text={i18n.gdprDialogLogout()}
            useAsLink={true}
            href={logOutUrl}
            color={buttonColors.gray}
            type="secondary"
            size="m"
          />
          <Button
            className="ui-test-gdpr-dialog-accept"
            text={i18n.gdprDialogYes()}
            onClick={this.handleYesClick}
          />
        </DialogFooter>
      </BaseDialog>
    );
  }
}

const styles = {
  dialog: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20,
  },
  instructions: {
    marginTop: 20,
  },
};
