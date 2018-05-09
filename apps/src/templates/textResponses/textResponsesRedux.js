// flesh out proptypes
const initialState = {
  responseData: {}
};

const SET_TEXT_RESPONSES = 'responseData/SET_TEXT_RESPONSES';

// Action creators
export const setTextResponses = (sectionId, responseData) => ({ type: SET_TEXT_RESPONSES, sectionId, responseData});

export const asyncLoadTextResponses = (sectionId, onComplete) => {
  return (dispatch, getState) => {
    // check state to make sure responses for this section/script haven't already been loaded

    loadTextResponsesFromServer(sectionId, (error, data) => {
      if (error) {
        console.error(error);
      } else {
        dispatch(setTextResponses(sectionId, data));
        onComplete();
      }
    });
  };
};

export default function textResponses(state=initialState, action) {
  if (action.type === SET_TEXT_RESPONSES) {
    return {
      ...state,
      responseData: {
        ...state.responseData,
        [action.sectionId]: action.responseData
      }
    };
  }

  return state;
}

// Make a request to the server for text responses
const loadTextResponsesFromServer = (sectionId, onComplete) => {
  $.ajax({
    url: `/dashboardapi/section_text_responses/${sectionId}`,
    method: 'GET',
    contentType: 'application/json;charset=UTF-8'
  }).done(responseData => {
    onComplete(null, responseData);
  }).fail((jqXhr, status) => {
    onComplete(status, jqXhr.responseJSON);
  });
};
