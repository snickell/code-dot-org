// session storage keys
export const ACCOUNT_TYPE_SESSION_KEY = 'accountType';
export const SCHOOL_ID_SESSION_KEY = 'schoolId';
export const SCHOOL_ZIP_SESSION_KEY = 'schoolZip';
export const SCHOOL_NAME_SESSION_KEY = 'schoolName';
export const SCHOOL_COUNTRY_SESSION_KEY = 'schoolCountry';
export const EMAIL_SESSION_KEY = 'email';
export const OAUTH_LOGIN_TYPE_SESSION_KEY = 'oauthType';
export const USER_RETURN_TO_SESSION_KEY = 'userReturnTo';

export const clearSignUpSessionStorage = (isTeacher: boolean) => {
  const fieldsToClear = [
    ACCOUNT_TYPE_SESSION_KEY,
    EMAIL_SESSION_KEY,
    OAUTH_LOGIN_TYPE_SESSION_KEY,
    USER_RETURN_TO_SESSION_KEY,
  ];
  if (isTeacher) {
    const schoolFields = [
      SCHOOL_ID_SESSION_KEY,
      SCHOOL_ZIP_SESSION_KEY,
      SCHOOL_NAME_SESSION_KEY,
      SCHOOL_COUNTRY_SESSION_KEY,
    ];
    fieldsToClear.push(...schoolFields);
  }

  fieldsToClear.forEach(field => {
    sessionStorage.removeItem(field);
  });
};

// user type cookie
export const NEW_SIGN_UP_USER_TYPE = 'new_sign_up_user_type';

// school association
export const US_COUNTRY_CODE = 'US';
export const ZIP_REGEX = new RegExp(/(^(?!00000)\d{5}$)/);
export const SELECT_COUNTRY = 'selectCountry';
export const SCHOOL_ZIP_SEARCH_URL = '/dashboardapi/v1/schoolzipsearch/';

export const MAX_DISPLAY_NAME_LENGTH = 70;
