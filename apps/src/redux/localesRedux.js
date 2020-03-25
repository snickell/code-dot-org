const SET_LOCALE_CODE = 'locale/SET_LOCALE_CODE';

export const setLocaleCode = localeCode => ({
  type: SET_LOCALE_CODE,
  localeCode
});

const initialState = {
  // locale code like 'en-us', 'es-mx', or null if none is specified.
  localeCode: null
};

export default function reducer(state = initialState, action) {
  if (action.type === SET_LOCALE_CODE) {
    return {
      ...state,
      localeCode: action.localeCode
    };
  }
  return state;
}
