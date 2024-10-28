import {PayloadAction, createSlice, createAsyncThunk} from '@reduxjs/toolkit';

interface TeacherEvaluation {
  feedback: string;
  id: number;
  learning_goal_id: number;
  understanding: number;
}

interface UserEvalData {
  eval: TeacherEvaluation[];
  user_family_name?: string;
  user_id: number;
  user_name: string;
}

type AllTeacherEvaluationData = UserEvalData[];

interface HasTeacherFeedbackMap {
  [key: number]: boolean;
}

// map from counter name to count
interface AiEvalStatusCounters {
  [key: string]: number;
}

// map from user id to status
interface AiEvalStatusMap {
  [key: number]: string;
}

interface TeacherRubricState {
  allTeacherEvaluationData: AllTeacherEvaluationData;
  hasTeacherFeedbackMap: HasTeacherFeedbackMap;
  aiEvalStatusCounters: AiEvalStatusCounters;
  aiEvalStatusMap: AiEvalStatusMap;
}

const initialState: TeacherRubricState = {
  allTeacherEvaluationData: [],
  hasTeacherFeedbackMap: {},
  aiEvalStatusCounters: {},
  aiEvalStatusMap: {},
};

const teacherRubricReduxSlice = createSlice({
  name: 'teacherRubric',
  initialState,
  reducers: {
    setAllTeacherEvaluationData(
      state,
      action: PayloadAction<AllTeacherEvaluationData>
    ) {
      state.allTeacherEvaluationData = action.payload;
    },
    setHasTeacherFeedbackMap(
      state,
      action: PayloadAction<HasTeacherFeedbackMap>
    ) {
      state.hasTeacherFeedbackMap = action.payload;
    },
    setUserHasTeacherFeedback(state, action: PayloadAction<number>) {
      state.hasTeacherFeedbackMap[action.payload] = true;
    },
    setAiEvalStatusCounters(
      state,
      action: PayloadAction<AiEvalStatusCounters>
    ) {
      state.aiEvalStatusCounters = action.payload;
    },
    setAiEvalStatusMap(state, action: PayloadAction<AiEvalStatusMap>) {
      state.aiEvalStatusMap = action.payload;
    },
    updateAiEvalStatusForUser: (
      state,
      action: PayloadAction<{userId: number; status: string}>
    ) => {
      state.aiEvalStatusMap[action.payload.userId] = action.payload.status;
    },
  },
});

export const loadAllTeacherEvaluationData = createAsyncThunk(
  'teacherRubric/loadAllTeacherEvaluationData',
  async (params: {rubricId: number; sectionId: number}, thunkAPI) => {
    const {rubricId, sectionId} = params;

    const fetchTeacherEvaluationAll = (rubricId: number, sectionId: number) => {
      return fetch(
        `/rubrics/${rubricId}/get_teacher_evaluations_for_all?section_id=${sectionId}`
      );
    };

    const initializeHasTeacherFeedbackMap = (
      allTeacherEvaluationData: AllTeacherEvaluationData
    ) => {
      const hasFeedbackMap: HasTeacherFeedbackMap = {};
      allTeacherEvaluationData.forEach(userEvalData => {
        hasFeedbackMap[userEvalData.user_id] = userEvalData.eval.length > 0;
      });
      thunkAPI.dispatch(setHasTeacherFeedbackMap(hasFeedbackMap));
    };

    fetchTeacherEvaluationAll(rubricId, sectionId).then(response => {
      if (response.ok) {
        response.json().then(data => {
          initializeHasTeacherFeedbackMap(data);
          thunkAPI.dispatch(setAllTeacherEvaluationData(data));
        });
      }
    });
  }
);

export const loadAiEvalStatusForAll = createAsyncThunk(
  'teacherRubric/loadAiEvalStatusForAll',
  async (params: {rubricId: number; sectionId: number}, thunkAPI) => {
    const {rubricId, sectionId} = params;

    const fetchAiEvaluationStatusAll = (
      rubricId: number,
      sectionId: number
    ) => {
      return fetch(
        `/rubrics/${rubricId}/ai_evaluation_status_for_all?section_id=${sectionId}`
      );
    };

    fetchAiEvaluationStatusAll(rubricId, sectionId).then(response => {
      if (response.ok) {
        response.json().then(data => {
          thunkAPI.dispatch(setAiEvalStatusMap(data.aiEvalStatusMap));
          delete data.aiEvalStatusMap;
          thunkAPI.dispatch(setAiEvalStatusCounters(data));
        });
      }
    });
  }
);

// For internal use only
const {setHasTeacherFeedbackMap} = teacherRubricReduxSlice.actions;

// Exported for testing only
export const {setAllTeacherEvaluationData, setAiEvalStatusCounters} =
  teacherRubricReduxSlice.actions;

// Standard exports
export const {
  setUserHasTeacherFeedback,
  setAiEvalStatusMap,
  updateAiEvalStatusForUser,
} = teacherRubricReduxSlice.actions;
export default teacherRubricReduxSlice.reducer;
