import React, {useEffect, useMemo, useState} from 'react';

import Alert, {alertTypes} from '@cdo/apps/componentLibrary/alert/Alert';
import {Button} from '@cdo/apps/componentLibrary/button';
import {Heading2} from '@cdo/apps/componentLibrary/typography';
import {useSchoolInfo} from '@cdo/apps/schoolInfo/hooks/useSchoolInfo';
import {schoolInfoInvalid} from '@cdo/apps/schoolInfo/utils/schoolInfoInvalid';
import {updateSchoolInfo} from '@cdo/apps/schoolInfo/utils/updateSchoolInfo';
import SchoolDataInputs from '@cdo/apps/templates/SchoolDataInputs';
import i18n from '@cdo/locale';

import commonStyles from '../common/common.styles.module.scss';

interface SchoolInfo {
  country: string;
  school_name: string;
  school_zip: string;
  school_id: string;
  school_type: string;
}

interface SchoolInformationProps {
  schoolInfo?: SchoolInfo;
  isStudent: boolean;
}

export const SchoolInformation: React.FC<SchoolInformationProps> = ({
  schoolInfo,
  isStudent,
}) => {
  const [success, setSuccess] = useState(false);
  const [failure, setFailure] = useState(false);

  const schoolDataInfoProps = useSchoolInfo({
    schoolId: schoolInfo?.school_id,
    schoolName: schoolInfo?.school_name,
    country: schoolInfo?.country,
    schoolZip: schoolInfo?.school_zip,
    schoolType: schoolInfo?.school_type,
  });

  useEffect(() => {
    resetAlerts();
  }, [
    schoolDataInfoProps.schoolId,
    schoolDataInfoProps.schoolName,
    schoolDataInfoProps.country,
    schoolDataInfoProps.schoolZip,
  ]);

  const handleSchoolInformationUpdate = async () => {
    try {
      await updateSchoolInfo({
        schoolId: schoolDataInfoProps.schoolId,
        schoolName: schoolDataInfoProps.schoolName,
        schoolZip: schoolDataInfoProps.schoolZip,
        country: schoolDataInfoProps.country,
      });
      setSuccess(true);
    } catch (error) {
      setFailure(true);
    }
  };

  const saveDisabled = useMemo(
    () =>
      schoolInfoInvalid({
        schoolId: schoolDataInfoProps.schoolId,
        country: schoolDataInfoProps.country,
        schoolName: schoolDataInfoProps.schoolName,
        schoolZip: schoolDataInfoProps.schoolZip,
        schoolsList: schoolDataInfoProps.schoolsList,
      }),
    [
      schoolDataInfoProps.country,
      schoolDataInfoProps.schoolId,
      schoolDataInfoProps.schoolZip,
      schoolDataInfoProps.schoolName,
      schoolDataInfoProps.schoolsList,
    ]
  );

  const resetAlerts = () => {
    setFailure(false);
    setSuccess(false);
  };

  if (isStudent) {
    return null;
  }

  return (
    <>
      <hr />
      <Heading2
        visualAppearance="heading-sm"
        className={commonStyles.sectionHeader}
      >
        {i18n.schoolInformation_schoolInformation()}
      </Heading2>
      <form name="school-information-form">
        <div className={commonStyles.inputContainer}>
          <SchoolDataInputs {...schoolDataInfoProps} includeHeaders={false} />
          {success && (
            <Alert
              text={i18n.schoolInformation_updateSuccess()}
              type={alertTypes.success}
              className={commonStyles.alert}
              onClose={() => setSuccess(false)}
            />
          )}
          {failure && (
            <Alert
              text={i18n.schoolInformation_updateFailure()}
              type={alertTypes.danger}
              className={commonStyles.alert}
              onClose={() => setFailure(false)}
            />
          )}
        </div>
        <div>
          <Button
            className={commonStyles.submit}
            text={i18n.schoolInformation_updateSchoolInformation()}
            onClick={handleSchoolInformationUpdate}
            disabled={saveDisabled}
          />
        </div>
      </form>
    </>
  );
};
