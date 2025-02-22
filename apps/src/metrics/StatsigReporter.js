import {StatsigClient} from '@statsig/js-client';
import {runStatsigAutoCapture} from '@statsig/web-analytics';
import cookies from 'js-cookie';

import logToCloud from '@cdo/apps/logToCloud';
import experiments from '@cdo/apps/util/experiments';
import {getGlobalEditionRegion} from '@cdo/apps/util/globalEdition';

import {
  getEnvironment,
  isProductionEnvironment,
  isDevelopmentEnvironment,
  createUuid,
} from '../utils';

// A flag that can be toggled to send events regardless of environment
const ALWAYS_SEND = false;
const NO_EVENT_NAME = 'NO_VALID_EVENT_NAME_LOG_ERROR';
const STABLE_ID_KEY = 'statsig_stable_id';

class StatsigReporter {
  constructor() {
    // stable_id is set as a cookie in application_controller.rb. However in a
    // the rare case we are running outside of the application layout,
    // set stable_id as a cookie here if it doesn't exist.
    this.stable_id = this.findOrCreateStableId();
    this.log(`Statsig Stable ID: ${this.stable_id}`);
    let user = {
      custom: {
        enabledExperiments: experiments.getEnabledExperiments(),
        geRegion: getGlobalEditionRegion(),
      },
      customIDs: {stableID: this.stable_id},
    };
    const user_id_element = document.querySelector('script[data-user-id]');
    const user_id = user_id_element ? user_id_element.dataset.userId : null;
    const user_type_element = document.querySelector('script[data-user-type');
    const user_type = user_type_element
      ? user_type_element.dataset.userType
      : null;
    if (user_id) {
      user.userID = this.formatUserId(user_id);
      user.custom.userType = user_type;
    }
    this.user = user;

    const api_element = document.querySelector(
      'script[data-statsig-api-client-key]'
    );
    this.api_key = api_element ? api_element.dataset.statsigApiClientKey : '';

    const managed_test_environment_element = document.querySelector(
      'script[data-managed-test-server]'
    );
    const managed_test_environment = managed_test_environment_element
      ? managed_test_environment_element.dataset.managedTestServer === 'true'
      : false;
    this.local_mode = !(
      isProductionEnvironment() ||
      managed_test_environment ||
      process.env.STATSIG_LOCAL_MODE_OFF
    );
    this.options = {
      environment: {tier: getEnvironment()},
      localMode: this.local_mode,
      disableErrorLogging: true,
    };

    this.initialize(this.api_key, this.user, this.options);
  }

  // This user object will potentially update via a setUserProperties call
  // (below) from current user redux
  async initialize(api_key, user, options) {
    if (this.shouldPutRecord(ALWAYS_SEND)) {
      this.statsigClient = new StatsigClient(api_key, user, options);
      await this.statsigClient.initializeAsync();
    }
  }

  // Utilizes Statsig's function for updating a user once we've recognized a sign in
  async setUserProperties(
    userId,
    userType,
    isVerifiedInstructor,
    enabledExperiments
  ) {
    const formattedUserId = this.formatUserId(userId);
    const user = {
      userID: formattedUserId,
      custom: {userType, isVerifiedInstructor, enabledExperiments},
    };
    if (!this.shouldPutRecord(ALWAYS_SEND)) {
      this.log(
        `User properties: userId: ${formattedUserId}, userType: ${userType}, isVerifiedInstructor: ${isVerifiedInstructor}, signInState: ${!!userId}`
      );
    } else {
      await this.statsigClient.updateUserAsync(user);
    }
  }

  sendEvent(eventName, payload) {
    if (this.shouldPutRecord(ALWAYS_SEND)) {
      if (!eventName) {
        logToCloud.addPageAction(
          logToCloud.PageAction.NoValidStatsigEventNameError,
          {
            payload: payload,
          }
        );
        this.statsigClient.logEvent(NO_EVENT_NAME, NO_EVENT_NAME, payload);
      } else {
        // Statsig expects a name, value and data. Because we are unifying this
        // with our Amplitude logging, we are bypassing the 'value' and sending
        // event name twice. If we want to use this field moving forward, we
        // will need to refactor all AnalyticsReporting event calls accordingly.
        this.statsigClient.logEvent(eventName, eventName, payload);
      }
    } else {
      this.log(
        `${eventName}. Payload: ${JSON.stringify({
          payload,
        })}`
      );
    }
  }

  log(message) {
    if (isDevelopmentEnvironment() && !IN_UNIT_TEST) {
      console.log(`[STATSIG ANALYTICS EVENT]: ${message}`);
    }
  }

  getIsInExperiment(name, parameter, defaultValue) {
    if (this.local_mode) {
      return false;
    }
    return (
      this.statsigClient.getExperiment(name).value[parameter] ?? defaultValue
    );
  }

  formatUserId(userId) {
    const userIdString = userId.toString() || 'none';
    if (!userId) {
      return userIdString;
    }
    if (isProductionEnvironment()) {
      return userIdString.padStart(5, '0');
    } else {
      const environment = getEnvironment();
      return `${environment}-${userIdString}`;
    }
  }

  findOrCreateStableId() {
    let stableId = cookies.get(STABLE_ID_KEY);
    if (!stableId) {
      stableId = createUuid();
      cookies.set(STABLE_ID_KEY, stableId, {
        path: '/',
      });
    }
    return stableId;
  }

  /**
   * Returns whether the request should be sent through to AWS Firehose.
   * @param {boolean} alwaysPut An override to default environment behavior.
   * @return {boolean} Whether the request should be sent through to AWS
   *   Firehose.
   */
  shouldPutRecord(alwaysPut) {
    if (alwaysPut) {
      return true;
    }
    if (!this.local_mode) {
      return true;
    }
    return false;
  }

  /**
   * Runs Web Analytics auto-capturing.
   * @see https://docs.statsig.com/webanalytics/overview
   */
  async runAutoCapture() {
    if (this.shouldPutRecord(ALWAYS_SEND)) {
      const client = new StatsigClient(this.api_key, this.user, this.options);
      runStatsigAutoCapture(client);
      await client.initializeAsync();
    }
  }
}

const statsigReporter = new StatsigReporter();

export default statsigReporter;
