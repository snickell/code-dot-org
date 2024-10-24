// Action types

const SET_ALL_TEACHER_EVALUATION_DATA =
  'teacherRubric/SET_ALL_TEACHER_EVALUATION_DATA';

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

  return state;
}

// Action creators

export const setAllTeacherEvaluationData = allTeacherEvaluationData => ({
  type: SET_ALL_TEACHER_EVALUATION_DATA,
  allTeacherEvaluationData,
});
