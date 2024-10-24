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

export const setAllTeacherEvaluationData = allTeacherEvaluationData => ({
  type: SET_ALL_TEACHER_EVALUATION_DATA,
  allTeacherEvaluationData,
});

export const setHasTeacherFeedbackMap = hasTeacherFeedbackMap => ({
  type: SET_HAS_TEACHER_FEEDBACK_MAP,
  hasTeacherFeedbackMap,
});
