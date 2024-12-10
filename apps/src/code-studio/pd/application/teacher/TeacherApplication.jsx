import PropTypes from 'prop-types';
import React, {useMemo} from 'react';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {useSchoolInfo} from '@cdo/apps/schoolInfo/hooks/useSchoolInfo';
import {reload} from '@cdo/apps/utils';

import FormController from '../../form_components_func/FormController';

import AboutYou from './AboutYou';
import AdditionalDemographicInformation from './AdditionalDemographicInformation';
import AdministratorInformation from './AdministratorInformation';
import ChooseYourProgram from './ChooseYourProgram';
import FindYourRegion from './FindYourRegion';
import ImplementationPlan from './ImplementationPlan';
import ProfessionalLearningProgramRequirements from './ProfessionalLearningProgramRequirements';

const submitButtonText = 'Complete and Send';
const sessionStorageKey = 'TeacherApplication';
const hasLoggedTeacherAppStart = 'hasLoggedTeacherAppStart';
const pageComponents = [
  ChooseYourProgram,
  FindYourRegion,
  AboutYou,
  AdditionalDemographicInformation,
  AdministratorInformation,
  ImplementationPlan,
  ProfessionalLearningProgramRequirements,
];
const autoComputedFields = [
  'regionalPartnerGroup',
  'regionalPartnerId',
  'regionalPartnerWorkshopIds',
];

const TeacherApplication = props => {
  console.log('🚀 ~ TeacherApplication ~ props:', props);
  const {savedFormData, accountEmail, existingSchoolInfo} = props;

  const dataOnPageLoad = useMemo(() => {
    if (savedFormData) {
      return JSON.parse(savedFormData);
    }
  }, [savedFormData]);

  const schoolInfo = useSchoolInfo({
    schoolId: existingSchoolInfo.school_id,
    schoolName: existingSchoolInfo.schoolName,
    country: existingSchoolInfo.country,
    schoolZip: existingSchoolInfo.school_zip,
    schoolType: existingSchoolInfo.school_type,
  });
  console.log('🚀 ~ TeacherApplication ~ schoolInfo:', schoolInfo);

  // const builtSchoolInfo = useMemo(
  //   () =>
  //     buildSchoolData({
  //       country: schoolInfo.country,
  //       schoolId: schoolInfo.schoolId,
  //       schoolZip: schoolInfo.schoolZip,
  //       schoolName: schoolInfo.schoolName,
  //     }),
  //   [
  //     schoolInfo.country,
  //     schoolInfo.schoolId,
  //     schoolInfo.schoolZip,
  //     schoolInfo.schoolName,
  //   ]
  // );

  // const [regionalPartner] = useRegionalPartner({
  //   ...dataOnPageLoad,
  //   school: builtSchoolInfo?.user.school_info_attributes.school_id,
  //   schoolZipCode: builtSchoolInfo?.user.school_info_attributes.zip,
  // });

  const getInitialData = () => {
    // const dataOnPageLoad = savedFormData && JSON.parse(savedFormData);
    return dataOnPageLoad;
    // Extract school info saved in sessionStorage, if any
    // const reloadedSchoolId = JSON.parse(
    //   sessionStorage.getItem(sessionStorageKey)
    // )?.data?.school;

    // // Populate additional data from server only if it doesn't override data in sessionStorage
    // // (even if value in sessionStorage is null)
    // // the FormController will handle loading reloadedSchoolId as an initial value, so return empty otherwise
    // if (reloadedSchoolId === undefined && existingSchoolInfo?.school_id) {
    //   return {school: existingSchoolInfo?.school_id, ...dataOnPageLoad};
    // } else {
    //   return {...dataOnPageLoad};
    // }
  };

  const onInitialize = () => {
    if (!sessionStorage.getItem(hasLoggedTeacherAppStart)) {
      sessionStorage.setItem(hasLoggedTeacherAppStart, true);
      analyticsReporter.sendEvent(EVENTS.TEACHER_APP_VISITED_EVENT);
    }
  };

  const getPageProps = () => ({
    accountEmail: accountEmail,
    schoolInfo: schoolInfo,
    // regionalPartner,
  });

  const onSuccessfulSubmit = () => {
    // Let the server display a confirmation page as appropriate
    reload();

    analyticsReporter.sendEvent(EVENTS.APPLICATION_SUBMITTED_EVENT);
  };

  const onSuccessfulSave = () => {
    analyticsReporter.sendEvent(EVENTS.APPLICATION_SAVED_EVENT);
  };

  return (
    <FormController
      {...props}
      allowPartialSaving={true}
      pageComponents={pageComponents}
      autoComputedFields={autoComputedFields}
      getPageProps={getPageProps}
      getInitialData={getInitialData}
      onInitialize={onInitialize}
      onSuccessfulSubmit={onSuccessfulSubmit}
      onSuccessfulSave={onSuccessfulSave}
      sessionStorageKey={sessionStorageKey}
      submitButtonText={submitButtonText}
      validateOnSubmitOnly={true}
      warnOnExit={true}
    />
  );
};
TeacherApplication.propTypes = {
  ...FormController.propTypes,
  accountEmail: PropTypes.string.isRequired,
  schoolId: PropTypes.string,
};

export default TeacherApplication;
