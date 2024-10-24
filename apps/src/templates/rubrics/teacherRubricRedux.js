// Action types

const SET_ALL_TEACHER_EVALUATION_DATA =
  'teacherRubric/SET_ALL_TEACHER_EVALUATION_DATA';
const SET_HAS_TEACHER_FEEDBACK_MAP =
  'teacherRubric/SET_HAS_TEACHER_FEEDBACK_MAP';

// Reducer

const initialState = {
  allTeacherEvaluationData: [],
};

export default function teacherRubric(state = initialState, action) {
  if (action.type === SET_ALL_TEACHER_EVALUATION_DATA) {
    return {
      ...state,
      allTeacherEvaluationData: action.allTeacherEvaluationData,
    };
  }

  if (action.type === SET_HAS_TEACHER_FEEDBACK_MAP) {
    return {
      ...state,
      hasTeacherFeedbackMap: action.hasTeacherFeedbackMap,
    };
  }

  return state;
}

// Action creators

const setAllTeacherEvaluationData = allTeacherEvaluationData => ({
  type: SET_ALL_TEACHER_EVALUATION_DATA,
  allTeacherEvaluationData,
});

export const setHasTeacherFeedbackMap = hasTeacherFeedbackMap => ({
  type: SET_HAS_TEACHER_FEEDBACK_MAP,
  hasTeacherFeedbackMap,
});

export const loadAllTeacherEvaluationData = (rubricId, sectionId) => {
  return dispatch => {
    const fetchTeacherEvaluationAll = (rubricId, sectionId) => {
      return fetch(
        `/rubrics/${rubricId}/get_teacher_evaluations_for_all?section_id=${sectionId}`
      );
    };

    const initializeHasTeacherFeedbackMap = allTeacherEvaluationData => {
      const hasFeedbackMap = {};
      allTeacherEvaluationData.forEach(userEvalData => {
        if (userEvalData?.user_id) {
          hasFeedbackMap[userEvalData.user_id] = userEvalData.eval.length > 0;
        }
      });
      dispatch(setHasTeacherFeedbackMap(hasFeedbackMap));
    };

    fetchTeacherEvaluationAll(rubricId, sectionId).then(response => {
      if (response.ok) {
        response.json().then(data => {
          initializeHasTeacherFeedbackMap(data);
          dispatch(setAllTeacherEvaluationData(data));
        });
      }
    });
  };
};
