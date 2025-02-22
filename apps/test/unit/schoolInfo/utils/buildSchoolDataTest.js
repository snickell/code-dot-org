import {buildSchoolData} from '@cdo/apps/schoolInfo/utils/buildSchoolData';
import {US_COUNTRY_CODE} from '@cdo/apps/signUpFlow/signUpFlowConstants';
import {NonSchoolOptions} from '@cdo/generated-scripts/sharedConstants';

describe('buildSchoolData', () => {
  describe('country is US', () => {
    it('should return school info with school_id when schoolId is provided and not in NON_SCHOOL_OPTIONS_ARRAY', () => {
      const result = buildSchoolData({
        schoolId: '12345',
        country: US_COUNTRY_CODE,
        schoolName: 'Test School',
        schoolZip: '54321',
      });

      expect(result).toEqual({
        school_id: '12345',
      });
    });

    it('should return school info with country, zip, and school_name when schoolId is empty', () => {
      const result = buildSchoolData({
        schoolId: '',
        country: US_COUNTRY_CODE,
        schoolName: 'Test School',
        schoolZip: '54321',
      });

      expect(result).toEqual({
        country: US_COUNTRY_CODE,
        school_name: 'Test School',
        zip: '54321',
      });
    });

    it('should return school info with country, zip, and school_name when schoolId is CLICK_TO_ADD', () => {
      const result = buildSchoolData({
        schoolId: NonSchoolOptions.CLICK_TO_ADD,
        country: US_COUNTRY_CODE,
        schoolName: 'Test School',
        schoolZip: '54321',
      });

      expect(result).toEqual({
        country: US_COUNTRY_CODE,
        school_name: 'Test School',
        zip: '54321',
      });
    });

    it('should return school info with country, zip, and school_name when schoolId is SELECT_A_SCHOOL', () => {
      const result = buildSchoolData({
        schoolId: NonSchoolOptions.SELECT_A_SCHOOL,
        country: US_COUNTRY_CODE,
        schoolName: 'Test School',
        schoolZip: '54321',
      });

      expect(result).toEqual({
        country: US_COUNTRY_CODE,
        school_name: 'Test School',
        zip: '54321',
      });
    });

    it('should return school info with country, zip, and school_type when schoolId is NO_SCHOOL_SETTING', () => {
      const result = buildSchoolData({
        schoolId: NonSchoolOptions.NO_SCHOOL_SETTING,
        country: 'US',
        schoolName: 'Test School',
        schoolZip: '54321',
      });

      expect(result).toEqual({
        country: 'US',
        school_type: NonSchoolOptions.NO_SCHOOL_SETTING,
        zip: '54321',
      });
    });

    it('should return undefined when schoolId is NO_SCHOOL_SETTING but no school zip', () => {
      const result = buildSchoolData({
        schoolId: NonSchoolOptions.NO_SCHOOL_SETTING,
        country: 'US',
        schoolName: 'Test School',
        schoolZip: '',
      });

      expect(result).toBeUndefined();
    });

    it('should return undefined when country and zip is provided but no school name', () => {
      const result = buildSchoolData({
        schoolId: '',
        country: 'US',
        schoolName: '',
        schoolZip: '12345',
      });

      expect(result).toBeUndefined();
    });
  });

  describe('country is not US', () => {
    it('should return school info with country and school_name', () => {
      const result = buildSchoolData({
        schoolId: '12345',
        country: 'CA',
        schoolName: 'Test School',
        schoolZip: '54321',
      });

      expect(result).toEqual({
        country: 'CA',
        school_name: 'Test School',
      });
    });

    it('should handle cases where a user updates from a non-school setting to a non-US school', () => {
      // non school setting could be initial state
      // changing country would not clear schoolId due to persisting form state
      // non-us country should override existence of schoolId = NO_SCHOOL_SETTING
      const result = buildSchoolData({
        schoolId: NonSchoolOptions.NO_SCHOOL_SETTING,
        country: 'CA',
        schoolName: 'Cool School',
        schoolZip: '54321',
      });

      expect(result).toEqual({
        country: 'CA',
        school_name: 'Cool School',
      });
    });
  });

  it('should return undefined when neither schoolId nor country is provided', () => {
    const result = buildSchoolData({
      schoolId: '',
      country: '',
      schoolName: '',
      schoolZip: '',
    });

    expect(result).toBeUndefined();
  });

  it('should return undefined when country is provided but no school name', () => {
    const result = buildSchoolData({
      schoolId: '',
      country: 'UK',
      schoolName: '',
      schoolZip: '',
    });

    expect(result).toBeUndefined();
  });
});
