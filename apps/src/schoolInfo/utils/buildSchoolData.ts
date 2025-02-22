import {
  SELECT_COUNTRY,
  US_COUNTRY_CODE,
} from '@cdo/apps/signUpFlow/signUpFlowConstants';
import {NonSchoolOptions} from '@cdo/generated-scripts/sharedConstants';

import {SchoolInfoRequest} from '../types';

export function buildSchoolData({
  schoolId,
  country,
  schoolName,
  schoolZip,
}: {
  schoolId: string;
  country: string;
  schoolName: string;
  schoolZip: string;
}): SchoolInfoRequest | undefined {
  // If we have an NCES id, _only_ send that - everything else will be
  // backfilled by records on the server.
  if (
    country === US_COUNTRY_CODE &&
    schoolId &&
    !Object.values(NonSchoolOptions).some(option => schoolId === option)
  ) {
    return {
      school_id: schoolId,
    };
  }

  if (
    country === US_COUNTRY_CODE &&
    schoolId === NonSchoolOptions.NO_SCHOOL_SETTING
  ) {
    if (!schoolZip) {
      return;
    }
    return {
      country,
      school_type: NonSchoolOptions.NO_SCHOOL_SETTING,
      zip: schoolZip,
    };
  }

  if (country && country !== SELECT_COUNTRY && schoolName) {
    return {
      country,
      school_name: schoolName,
      zip: country === US_COUNTRY_CODE ? schoolZip : undefined,
    };
  }
}
