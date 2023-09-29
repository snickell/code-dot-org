/**
 * Reducer for tracking whether we're currently viewing the page as a participant
 * or as a instructor
 */

import utils, {makeEnum} from '@cdo/apps/utils';
import codeStudioUtils from '@cdo/apps/code-studio/utils';

export const ViewType = makeEnum('Participant', 'Instructor');

// Action types
export const SET_VIEW_TYPE = 'viewAs/SET_VIEW_TYPE';

export default function reducer(state = ViewType.Participant, action) {
  if (action.type === SET_VIEW_TYPE) {
    let viewType = action.viewType;
    /* The ViewTypes used to be Teacher and Student. We redirect them to the new
     * ViewTypes here in order to make sure be continue to support old links.
     */
    if (viewType === 'Teacher') {
      viewType = 'Instructor';
      codeStudioUtils.updateQueryParam('viewAs', 'Instructor');
    } else if (viewType === 'Student') {
      viewType = 'Participant';
      codeStudioUtils.updateQueryParam('viewAs', 'Participant');
    } else if (!ViewType[viewType]) {
      throw new Error('unknown ViewType: ' + viewType);
    }

    return viewType;
  }

  return state;
}

// Action creators

// TODO: When this is converted to redux-toolkit, update progressRedux accordingly, as it has
// a dependency on this action.
export const setViewType = viewType => ({
  type: SET_VIEW_TYPE,
  viewType,
});

export const changeViewType = viewType => {
  return dispatch => {
    // If changing to viewAs participant while we are a particular participant, remove
    // the user_id and do a reload so that we're instead viewing as a generic
    // participant
    if (
      viewType === ViewType.Participant &&
      codeStudioUtils.queryParams('user_id')
    ) {
      codeStudioUtils.updateQueryParam('user_id', undefined);
      // Make a stubbable call to window.location.reload
      utils.reload();
      return;
    }

    dispatch(setViewType(viewType));
  };
};

// default export for sinon.stub()
reducer.setViewType = setViewType;
