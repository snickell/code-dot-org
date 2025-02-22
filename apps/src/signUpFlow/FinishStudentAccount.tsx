import classNames from 'classnames';
import cookies from 'js-cookie';
import React, {useState, useEffect, useMemo} from 'react';

import {Button, buttonColors} from '@cdo/apps/componentLibrary/button';
import Checkbox from '@cdo/apps/componentLibrary/checkbox/Checkbox';
import CloseButton from '@cdo/apps/componentLibrary/closeButton/CloseButton';
import SimpleDropdown from '@cdo/apps/componentLibrary/dropdown/simpleDropdown';
import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon/FontAwesomeV6Icon';
import TextField from '@cdo/apps/componentLibrary/textField/TextField';
import {
  Heading2,
  BodyTwoText,
  BodyThreeText,
} from '@cdo/apps/componentLibrary/typography';
import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';
import {isEmail} from '@cdo/apps/util/formatValidation';
import trackEvent from '@cdo/apps/util/trackEvent';
import {UserTypes} from '@cdo/generated-scripts/sharedConstants';

import {navigateToHref} from '../utils';

import locale from './locale';
import {
  ACCOUNT_TYPE_SESSION_KEY,
  EMAIL_SESSION_KEY,
  OAUTH_LOGIN_TYPE_SESSION_KEY,
  USER_RETURN_TO_SESSION_KEY,
  clearSignUpSessionStorage,
  NEW_SIGN_UP_USER_TYPE,
  MAX_DISPLAY_NAME_LENGTH,
} from './signUpFlowConstants';

import style from './signUpFlowStyles.module.scss';

const FinishStudentAccount: React.FunctionComponent<{
  ageOptions: {value: string; text: string}[];
  usIp: boolean;
  countryCode: string;
  usStateOptions: {value: string; text: string}[];
}> = ({ageOptions, usIp, countryCode, usStateOptions}) => {
  // Fields
  const [isParent, setIsParent] = useState(false);
  const [parentEmail, setParentEmail] = useState('');
  const [parentEmailOptInChecked, setParentEmailOptInChecked] = useState(false);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [state, setState] = useState('');
  const [gender, setGender] = useState('');

  // Field errors
  const [nameErrorMessage, setNameErrorMessage] = useState<string | null>(null);
  const [showParentEmailError, setShowParentEmailError] = useState(false);
  const [showAgeError, setShowAgeError] = useState(false);
  const [showStateError, setShowStateError] = useState(false);

  const [gdprChecked, setGdprChecked] = useState(false);
  const [showGDPR, setShowGDPR] = useState(false);
  const [isGdprLoaded, setIsGdprLoaded] = useState(false);
  const [userReturnTo, setUserReturnTo] = useState('/home');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorCreatingAccountMessage, showErrorCreatingAccountMessage] =
    useState(false);

  // Remove oauth user_type cookie if it exists
  cookies.remove(NEW_SIGN_UP_USER_TYPE);

  useEffect(() => {
    // If the user hasn't selected a user type or login type, redirect them back to the incomplete step of signup.
    if (sessionStorage.getItem(ACCOUNT_TYPE_SESSION_KEY) === null) {
      navigateToHref('/users/new_sign_up/account_type');
    } else if (
      sessionStorage.getItem(EMAIL_SESSION_KEY) === null &&
      sessionStorage.getItem(OAUTH_LOGIN_TYPE_SESSION_KEY) === null
    ) {
      navigateToHref('/users/new_sign_up/login_type');
    }

    analyticsReporter.sendEvent(
      EVENTS.FINISH_ACCOUNT_PAGE_LOADED,
      {'user type': 'student'},
      PLATFORMS.BOTH
    );

    const fetchGdprData = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const forceInEu = urlParams.get('force_in_eu');
      try {
        const response = await fetch(
          `/users/gdpr_check?force_in_eu=${forceInEu}`
        );
        const data = await response.json();
        if (data.gdpr || data.force_in_eu === '1') {
          setShowGDPR(true);
        }
      } catch (error) {
        console.error('Error fetching GDPR data:', error);
      } finally {
        setIsGdprLoaded(true);
      }
    };
    fetchGdprData();

    const userReturnToHref = sessionStorage.getItem(USER_RETURN_TO_SESSION_KEY);
    if (userReturnToHref) {
      setUserReturnTo(userReturnToHref);
    }
  }, []);

  // GDPR is valid if
  // 1. The fetch call has completed AND
  //   2. GDPR is showing AND checked OR
  //   3. GDPR is not relevant (not showing)
  const gdprValid = useMemo(() => {
    return isGdprLoaded && ((showGDPR && gdprChecked) || !showGDPR);
  }, [showGDPR, gdprChecked, isGdprLoaded]);

  const onGDPRChange = (): void => {
    const newGdprCheckedChoice = !gdprChecked;
    setGdprChecked(newGdprCheckedChoice);
  };

  const onIsParentChange = (): void => {
    analyticsReporter.sendEvent(
      EVENTS.PARENT_OR_GUARDIAN_SIGN_UP_CLICKED,
      {},
      PLATFORMS.BOTH
    );
    const newIsParentCheckedChoice = !isParent;
    // If the user unchecks the parent checkbox, clear the parent email field
    if (!newIsParentCheckedChoice) {
      setParentEmail('');
      setShowParentEmailError(false);
    }
    setIsParent(newIsParentCheckedChoice);
  };

  const onParentEmailChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const newParentEmail = e.target.value;
    setParentEmail(newParentEmail);

    if (!isEmail(newParentEmail)) {
      setShowParentEmailError(true);
    } else {
      setShowParentEmailError(false);
    }
  };

  const onNameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newName = e.target.value;
    setName(newName);

    if (newName.trim() === '') {
      setNameErrorMessage(locale.display_name_error_message());
    } else if (newName.length > MAX_DISPLAY_NAME_LENGTH) {
      setNameErrorMessage(
        locale.display_name_too_long_error_message({
          maxLength: MAX_DISPLAY_NAME_LENGTH,
        })
      );
    } else {
      setNameErrorMessage(null);
    }
  };

  const onAgeChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const newAge = e.target.value;
    setAge(newAge);

    if (newAge === '') {
      setShowAgeError(true);
    } else {
      setShowAgeError(false);
    }
  };

  const onStateChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const newState = e.target.value;
    setState(newState);

    if (newState === '') {
      setShowStateError(true);
    } else {
      setShowStateError(false);
    }
  };

  const sendFinishEvent = (): void => {
    // Log to Statsig and Amplitude
    analyticsReporter.sendEvent(
      EVENTS.SIGN_UP_FINISHED_EVENT,
      {
        'user type': 'student',
        'has school': false,
        'has marketing value selected': true,
        'has display name': !nameErrorMessage,
      },
      PLATFORMS.BOTH
    );

    // Log to Google Analytics
    trackEvent('sign_up', 'sign_up_success', {
      value: 'student',
    });
  };

  const submitStudentAccount = async () => {
    if (isSubmitting) {
      return;
    }
    setIsSubmitting(true);
    sendFinishEvent();
    showErrorCreatingAccountMessage(false);

    const signUpParams = {
      new_sign_up: true,
      user: {
        user_type: UserTypes.STUDENT,
        email: sessionStorage.getItem(EMAIL_SESSION_KEY),
        name: name,
        age: age,
        gender: gender,
        us_state: state,
        country_code: countryCode,
        parent_email_preference_email: parentEmail,
        parent_email_preference_opt_in: parentEmailOptInChecked,
      },
    };
    const authToken = await getAuthenticityToken();
    const response = await fetch('/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': authToken,
      },
      body: JSON.stringify(signUpParams),
    });

    if (response.ok) {
      clearSignUpSessionStorage(false);
      navigateToHref(userReturnTo);
    } else {
      setIsSubmitting(false);
      showErrorCreatingAccountMessage(true);
    }
  };

  return (
    <div>
      <div className={style.finishAccountContainer}>
        <div className={style.headerTextContainer}>
          <Heading2>{locale.finish_creating_student_account()}</Heading2>
          <BodyTwoText>{locale.tailor_experience()}</BodyTwoText>
        </div>
        {errorCreatingAccountMessage && (
          <div className={style.errorSigningUpMessage}>
            <div className={style.errorMessageWithXMark}>
              <FontAwesomeV6Icon
                iconName={'circle-xmark'}
                className={style.xIcon}
              />
              <BodyThreeText className={style.errorMessageText}>
                <SafeMarkdown markdown={locale.error_signing_up_message()} />
              </BodyThreeText>
            </div>
            <CloseButton
              onClick={() => showErrorCreatingAccountMessage(false)}
              aria-label={locale.error_signing_up_message_aria_label()}
            />
          </div>
        )}
        <fieldset className={style.inputContainer}>
          <div className={style.parentInfoContainer}>
            <Checkbox
              name="isParentCheckbox"
              label={locale.i_am_a_parent_or_guardian()}
              checked={isParent}
              onChange={onIsParentChange}
              size="s"
            />
            {isParent && (
              <>
                <div>
                  <TextField
                    name="parentEmail"
                    label={locale.parent_guardian_email()}
                    value={parentEmail}
                    placeholder={locale.parentEmailPlaceholder()}
                    onChange={onParentEmailChange}
                  />
                  {showParentEmailError && (
                    <BodyThreeText className={style.errorMessage}>
                      {locale.email_error_message()}
                    </BodyThreeText>
                  )}
                </div>
                <div>
                  <BodyThreeText className={style.parentKeepMeUpdated}>
                    <strong>{locale.keep_me_updated()}</strong>
                  </BodyThreeText>
                  <Checkbox
                    name="parentEmailOptIn"
                    label={locale.email_me_with_updates()}
                    checked={parentEmailOptInChecked}
                    onChange={e => setParentEmailOptInChecked(e.target.checked)}
                    size="s"
                  />
                </div>
              </>
            )}
          </div>
          <div>
            <TextField
              name="displayName"
              id="uitest-display-name"
              label={locale.display_name_eg()}
              value={name}
              placeholder={locale.coder()}
              onChange={onNameChange}
            />
            {nameErrorMessage && (
              <BodyThreeText className={style.errorMessage}>
                {nameErrorMessage}
              </BodyThreeText>
            )}
          </div>
          <div>
            <SimpleDropdown
              name="userAge"
              id="uitest-user-age"
              className={style.dropdownContainer}
              labelText={locale.what_is_your_age()}
              size="m"
              items={ageOptions}
              selectedValue={age}
              onChange={onAgeChange}
            />
            {showAgeError && (
              <BodyThreeText className={style.errorMessage}>
                {locale.age_error_message()}
              </BodyThreeText>
            )}
          </div>
          {usIp && (
            <div>
              <SimpleDropdown
                name="userState"
                id="uitest-user-state"
                className={style.dropdownContainer}
                labelText={locale.what_state_are_you_in()}
                size="m"
                items={usStateOptions}
                selectedValue={state}
                onChange={onStateChange}
              />
              {showStateError && (
                <BodyThreeText className={style.errorMessage}>
                  {locale.state_error_message()}
                </BodyThreeText>
              )}
            </div>
          )}
          <TextField
            name="userGender"
            label={locale.what_is_your_gender()}
            value={gender}
            onChange={e => setGender(e.target.value)}
          />
          {showGDPR && (
            <div>
              <BodyThreeText
                className={classNames(
                  style.teacherKeepMeUpdated,
                  style.required
                )}
              >
                <strong>{locale.data_transfer_notice()}</strong>
              </BodyThreeText>
              <Checkbox
                name="gdprAcknowledge"
                label={locale.data_transfer_agreement_student()}
                checked={gdprChecked}
                onChange={onGDPRChange}
                size="s"
              />
              <div className={style.inlineContainer}>
                <strong className={style.inlineItem}>{locale.note()}</strong>{' '}
                <SafeMarkdown
                  className={style.inlineItem}
                  markdown={locale.visit_privacy_policy()}
                />
              </div>
            </div>
          )}
        </fieldset>
        <div className={style.finishSignUpButtonContainer}>
          <Button
            className={style.finishSignUpButton}
            color={buttonColors.purple}
            type="primary"
            onClick={submitStudentAccount}
            text={locale.go_to_my_account()}
            iconRight={{
              iconName: 'arrow-right',
              iconStyle: 'solid',
              title: 'arrow-right',
            }}
            disabled={
              name?.trim() === '' ||
              name?.length > MAX_DISPLAY_NAME_LENGTH ||
              age === '' ||
              (usIp && state === '') ||
              (isParent && (parentEmail === '' || showParentEmailError)) ||
              !gdprValid
            }
            isPending={isSubmitting}
          />
        </div>
      </div>
      <SafeMarkdown
        className={style.tosAndPrivacy}
        markdown={locale.by_signing_up({
          tosLink: 'https://code.org/tos',
          privacyPolicyLink: 'https://code.org/privacy',
        })}
        openExternalLinksInNewTab={true}
      />
    </div>
  );
};

export default FinishStudentAccount;
