import PropTypes from 'prop-types';
import React, {useState} from 'react';

import RailsAuthenticityToken from '@cdo/apps/lib/util/RailsAuthenticityToken';
import HelpTip from '@cdo/apps/sharedComponents/HelpTip';
import BaseDialog from '@cdo/apps/templates/BaseDialog';

export default function NewUnitForm(props) {
  const [isCourse, setIsCourse] = useState('');
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);

  const savingDetailsAndButton = React.useCallback(
    () => (
      <div className="savingDetailsAndButton">
        <input name="is_migrated" value={true} type="hidden" />
        <input name="lesson_groups" value={'[]'} type="hidden" />
        <br />
        <button
          className="btn btn-primary"
          style={styles.buttonStyle}
          onClick={() => setSubmitDialogOpen(true)}
          type="button"
        >
          Save Changes
        </button>
      </div>
    ),
    [setSubmitDialogOpen]
  );

  const submitDialog = React.useCallback(
    () => (
      <BaseDialog
        isOpen={submitDialogOpen}
        handleClose={() => setSubmitDialogOpen(false)}
      >
        <div className="submitDialog">
          <p>
            Are you sure you want to submit this unit? These fields are very
            difficult to change after submission.
            <br />
            It is recommended that you double check each field with another
            person if you are unsure.
          </p>
          <button
            className="btn btn-submit-dialog"
            type="submit"
            style={styles.buttonStyle}
          >
            Submit
          </button>
        </div>
      </BaseDialog>
    ),
    [submitDialogOpen, setSubmitDialogOpen]
  );

  return (
    <form action="/s" method="post">
      <RailsAuthenticityToken />
      <label>
        Is this unit going to be a standalone unit or part of a course with
        multiple units?
        <select
          style={styles.dropdown}
          value={isCourse}
          className="isCourseSelector"
          onChange={e => setIsCourse(e.target.value)}
        >
          <option key={'empty'} value={''}>
            {''}
          </option>
          <option key={'multi-unit'} value={'false'}>
            {'Part of a course'}
          </option>
          <option key={'single-unit'} value={'true'}>
            {'Standalone unit'}
          </option>
        </select>
        <HelpTip>
          <p>
            Standalone units are designed to exist on their own. Use this when
            the unit won't appear inside of a Course with /courses/ in the URL.
          </p>
          <p>
            Units inside a course can be found within a Course that has a
            /courses/ URL and shares resources between other units in that
            course.
          </p>
          <p>
            For example: How AI Works is a standalone unit, but CSD Unit 1 is
            contained within the CSD course.
          </p>
        </HelpTip>
      </label>
      {isCourse === 'true' && (
        <div>
          <p>
            To create a standalone unit, please{' '}
            <a href="/courses/new">create a new course</a> first. Then, come
            back to this page and create a unit that is "Part of a Course" which
            has the same name (url slug) as the course.
          </p>
        </div>
      )}
      {isCourse === 'false' && (
        <div>
          <label>
            Unit Slug
            <HelpTip>
              <p>
                The unit slug is used to create the link to the unit. It is in
                the format of studio.code.org/s/unit-slug-here. A unit slug can
                only contain lowercase letters, numbers and dashes. Once you set
                the slug it can not be updated.
              </p>
            </HelpTip>
            <input name="script[name]" />
          </label>
          {savingDetailsAndButton()}
        </div>
      )}
      {submitDialog()}
    </form>
  );
}

NewUnitForm.propTypes = {
  families: PropTypes.arrayOf(PropTypes.string).isRequired,
  versionYearOptions: PropTypes.arrayOf(PropTypes.string).isRequired,
  familiesCourseTypes: PropTypes.object.isRequired,
};

const styles = {
  dropdown: {
    margin: '0 6px',
  },
  buttonStyle: {
    marginLeft: 0,
    marginTop: 10,
    marginBottom: 20,
  },
};
