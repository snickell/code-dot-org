import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import {AccountInformation} from '@cdo/apps/accounts/AccountInformation';
import AddParentEmailController from '@cdo/apps/accounts/AddParentEmailController';
import AddPasswordController from '@cdo/apps/accounts/AddPasswordController';
import ChangeUserTypeController from '@cdo/apps/accounts/ChangeUserTypeController';
import DeleteAccount from '@cdo/apps/accounts/DeleteAccount';
import LtiRosterSyncSettings from '@cdo/apps/accounts/LtiRosterSyncSettings';
import ManageLinkedAccountsController from '@cdo/apps/accounts/ManageLinkedAccountsController';
import MigrateToMultiAuth from '@cdo/apps/accounts/MigrateToMultiAuth';
import RemoveParentEmailController from '@cdo/apps/accounts/RemoveParentEmailController';
import {SchoolInformation} from '@cdo/apps/accounts/SchoolInformation';
import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {getStore} from '@cdo/apps/redux';
import LockoutLinkedAccounts from '@cdo/apps/templates/policy_compliance/LockoutLinkedAccounts';
import color from '@cdo/apps/util/color';
import getScriptData from '@cdo/apps/util/getScriptData';

// Values loaded from scriptData are always initial values, not the latest
// (possibly unsaved) user-edited values on the form.
const scriptData = getScriptData('edit');
const {
  userType,
  userAge,
  userUsState,
  isAdmin,
  isPasswordRequired,
  authenticationOptions,
  isGoogleClassroomStudent,
  isCleverStudent,
  dependedUponForLogin,
  dependentStudentsCount,
  personalAccountLinkingEnabled,
  lmsName,
} = scriptData;

$(document).ready(() => {
  const migrateMultiAuthMountPoint =
    document.getElementById('migrate-multi-auth');
  if (migrateMultiAuthMountPoint) {
    const store = getStore();
    ReactDOM.render(
      <Provider store={store}>
        <MigrateToMultiAuth />
      </Provider>,
      migrateMultiAuthMountPoint
    );
  }

  const accountInformationMountPoint = document.getElementById(
    'account-information'
  );
  if (accountInformationMountPoint) {
    ReactDOM.render(
      <AccountInformation {...scriptData} />,
      accountInformationMountPoint
    );
  }

  const schoolInformationMountPoint =
    document.getElementById('school-information');
  if (schoolInformationMountPoint) {
    ReactDOM.render(
      <SchoolInformation {...scriptData} />,
      schoolInformationMountPoint
    );
  }

  const updateDisplayedParentEmail = parentEmail => {
    const displayedParentEmail = $('#displayed-parent-email');
    displayedParentEmail.text(parentEmail);
    displayedParentEmail.effect('highlight', {
      duration: 1500,
      color: color.orange,
    });
  };
  new AddParentEmailController({
    form: $('#add-parent-email-modal-form'),
    formParentEmailField: $('#add-parent-email-modal_user_parent_email'),
    formParentOptInField: $(
      '#add-parent-email-modal_user_parent_email_preference_opt_in'
    ),
    link: $('#add-parent-email-link'),
    onSuccessCallback: updateDisplayedParentEmail,
  });
  new RemoveParentEmailController({
    form: $('#remove-parent-email-form'),
    link: $('#remove-parent-email-link'),
  });

  new ChangeUserTypeController($('#change-user-type-modal-form'), userType);

  const addPasswordMountPoint = document.getElementById('add-password-fields');
  if (addPasswordMountPoint) {
    new AddPasswordController(
      $('#add-password-form'),
      addPasswordMountPoint,
      !personalAccountLinkingEnabled,
      userAge,
      userUsState
    );
  }

  const ltiSyncSettingsMountPoint =
    document.getElementById('lti-sync-settings');
  if (ltiSyncSettingsMountPoint) {
    ReactDOM.render(
      <LtiRosterSyncSettings
        ltiRosterSyncEnabled={
          ltiSyncSettingsMountPoint.getAttribute(
            'data-lti-roster-sync-enabled'
          ) === 'true'
        }
        formId={'lti-sync-settings-form'}
        lmsName={lmsName}
      />,
      ltiSyncSettingsMountPoint
    );
  }

  const lockoutLinkedAccountsMountPoint = document.getElementById(
    'lockout-linked-accounts'
  );
  if (lockoutLinkedAccountsMountPoint) {
    ReactDOM.render(
      <LockoutLinkedAccounts
        pendingEmail={lockoutLinkedAccountsMountPoint.getAttribute(
          'data-pending-email'
        )}
        requestDate={
          new Date(
            Date.parse(
              lockoutLinkedAccountsMountPoint.getAttribute('data-request-date')
            )
          )
        }
        permissionStatus={lockoutLinkedAccountsMountPoint.getAttribute(
          'data-permission-status'
        )}
        userEmail={lockoutLinkedAccountsMountPoint.getAttribute(
          'data-user-email'
        )}
        inSection={JSON.parse(
          lockoutLinkedAccountsMountPoint.getAttribute('data-in-section')
        )}
        providers={JSON.parse(
          lockoutLinkedAccountsMountPoint.getAttribute('data-providers')
        )}
        usState={lockoutLinkedAccountsMountPoint.getAttribute('data-us-state')}
      />,
      lockoutLinkedAccountsMountPoint
    );
  }

  const manageLinkedAccountsMountPoint = document.getElementById(
    'manage-linked-accounts'
  );
  if (manageLinkedAccountsMountPoint) {
    new ManageLinkedAccountsController(
      manageLinkedAccountsMountPoint,
      authenticationOptions,
      isPasswordRequired,
      isGoogleClassroomStudent,
      isCleverStudent,
      personalAccountLinkingEnabled,
      lmsName
    );
  }

  const deleteAccountMountPoint = document.getElementById('delete-account');
  if (deleteAccountMountPoint) {
    ReactDOM.render(
      <DeleteAccount
        isPasswordRequired={isPasswordRequired}
        isTeacher={userType === 'teacher'}
        dependedUponForLogin={dependedUponForLogin}
        dependentStudentsCount={dependentStudentsCount}
        hasStudents={dependentStudentsCount > 0}
        isAdmin={isAdmin}
      />,
      deleteAccountMountPoint
    );
  }

  analyticsReporter.sendEvent(
    EVENTS.ACCOUNT_SETTINGS_PAGE_VISITED,
    {'user type': userType},
    PLATFORMS.BOTH
  );

  initializeCreatePersonalAccountControls();
});

function initializeCreatePersonalAccountControls() {
  $('#edit_user_create_personal_account').on('submit', function (e) {
    if ($('#create_personal_user_email').length) {
      window.dashboard.hashEmail({
        email_selector: '#create_personal_user_email',
        hashed_email_selector: '#create_personal_user_hashed_email',
        age_selector: '#user_age',
      });
    }
  });
}
