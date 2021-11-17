/**
 * Reducer for tracking whether we're currently viewing the page as a student
 * or as a teacher
 */

import {makeEnum, reload} from '@cdo/apps/utils';
import {queryParams, updateQueryParam} from '@cdo/apps/code-studio/utils';

export const ViewType = makeEnum('Student', 'Teacher');

// Action types
export const SET_VIEW_TYPE = 'viewAs/SET_VIEW_TYPE';

export default function reducer(state = ViewType.Student, action) {
  if (action.type === SET_VIEW_TYPE) {
    let viewType = action.viewType;
    /* These redirects are temporary. They will allow us to move over to
     * Participant and Instructor as the main ViewTypes without a risk
     * of breaking something for users if we have to revert. We should have
     * moved over to Instructor and Participant as the main ViewTypes by
     * Jan 2022
     */
    if (viewType === 'Instructor') {
      viewType = 'Teacher';
      updateQueryParam('viewAs', 'Teacher');
    } else if (viewType === 'Participant') {
      viewType = 'Student';
      updateQueryParam('viewAs', 'Student');
    } else if (!ViewType[viewType]) {
      throw new Error('unknown ViewType: ' + viewType);
    }

    return viewType;
  }

  return state;
}

// Action creators

export const setViewType = viewType => ({
  type: SET_VIEW_TYPE,
  viewType
});

export const changeViewType = viewType => {
  return dispatch => {
    // If changing to viewAs student while we are a particular student, remove
    // the user_id and do a reload so that we're instead viewing as a generic
    // student
    if (viewType === ViewType.Student && queryParams('user_id')) {
      updateQueryParam('user_id', undefined);
      // Make a stubbable call to window.location.reload
      reload();
      return;
    }

    dispatch(setViewType(viewType));
  };
};
