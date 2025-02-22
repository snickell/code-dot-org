import moment from 'moment';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider, useSelector} from 'react-redux';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {getStore} from '@cdo/apps/redux';
import ParentalPermissionModal from '@cdo/apps/templates/policy_compliance/ParentalPermissionModal';
import getScriptData from '@cdo/apps/util/getScriptData';
import {tryGetLocalStorage, trySetLocalStorage} from '@cdo/apps/utils';

const SHOW_DELAY = 86400; // 1 day

document.addEventListener('DOMContentLoaded', () => {
  const renderModal = () => {
    // eslint-disable-next-line react/prop-types
    const Modal = ({lockoutDate, inSection}) => {
      const currentUser = useSelector(state => state.currentUser);
      if (!currentUser?.userId) return null;

      const defaultEventParams = (parentalPermissionRequest = {}) => ({
        consentStatus: parentalPermissionRequest?.consent_status,
        us_state: currentUser?.usStateCode,
      });

      const reportEvent = (eventName, payload = {}) => {
        payload.inSection = inSection;
        analyticsReporter.sendEvent(eventName, payload);
      };

      const handleClose = parentalPermissionRequest => {
        reportEvent(
          EVENTS.CAP_PARENT_EMAIL_MODAL_CLOSED,
          defaultEventParams(parentalPermissionRequest)
        );
      };

      const handleSubmit = parentalPermissionRequest => {
        reportEvent(
          EVENTS.CAP_PARENT_EMAIL_SUBMITTED,
          defaultEventParams(parentalPermissionRequest)
        );
      };

      const handleResend = parentalPermissionRequest => {
        reportEvent(
          EVENTS.CAP_PARENT_EMAIL_RESEND,
          defaultEventParams(parentalPermissionRequest)
        );
      };

      const handleUpdate = parentalPermissionRequest => {
        reportEvent(
          EVENTS.CAP_PARENT_EMAIL_UPDATED,
          defaultEventParams(parentalPermissionRequest)
        );
      };

      reportEvent(EVENTS.CAP_PARENT_EMAIL_MODAL_SHOWN, {
        consentStatus: currentUser?.childAccountComplianceState,
        us_state: currentUser?.usStateCode,
      });

      return (
        <ParentalPermissionModal
          lockoutDate={lockoutDate}
          onClose={handleClose}
          onSubmit={handleSubmit}
          onResend={handleResend}
          onUpdate={handleUpdate}
        />
      );
    };

    ReactDOM.render(
      <Provider store={getStore()}>
        <Modal
          lockoutDate={getScriptData('lockoutDate')}
          inSection={getScriptData('inSection')}
        />
      </Provider>,
      document.getElementById('parental-permission-modal-container')
    );
  };

  if (getScriptData('forceDisplay')) {
    renderModal();
  } else {
    const studentUuid = getScriptData('studentUuid');
    const modalKey = `cap-ppm-last-shown-at-${studentUuid}`;
    const lastShownAt = moment(tryGetLocalStorage(modalKey, ''));

    // If the modal has been shown in the last 24 hours, don't show it again.
    if (moment().diff(lastShownAt, 'seconds') < SHOW_DELAY) return;

    renderModal();

    // Records the time the modal was last shown.
    trySetLocalStorage(modalKey, moment().toISOString());
  }
});
