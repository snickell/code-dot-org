import React, {useState} from 'react';
import RailsAuthenticityToken from '@cdo/apps/lib/util/RailsAuthenticityToken';
import HelpTip from '@cdo/apps/lib/ui/HelpTip';
import PropTypes from 'prop-types';
import NewCourseFields from '../NewCourseFields';

export default function NewUnitForm(props) {
  const [isCourse, setIsCourse] = useState(null);
  const [familyName, setFamilyName] = useState('');
  const [versionYear, setVersionYear] = useState('');

  const getScriptName = () => {
    const name =
      versionYear !== 'unversioned'
        ? familyName + '-' + versionYear
        : familyName;
    return name;
  };

  return (
    <form action="/s" method="post">
      <RailsAuthenticityToken />
      <label>
        Is this unit going to be in a course with one unit or multiple units?
        <select
          style={styles.dropdown}
          value={isCourse}
          name="is_course"
          onChange={e => setIsCourse(e.target.value)}
        >
          <option key={'empty'} value={null}>
            {''}
          </option>
          <option key={'multi-unit'} value={true}>
            {'Multiple Units'}
          </option>
          <option key={'single-unit'} value={false}>
            {'Single Unit'}
          </option>
          ))}
        </select>
        <HelpTip>
          <p>
            There are two different types of courses we support. A course with
            multiple units and a course that is a single unit.
          </p>
        </HelpTip>
      </label>
      {isCourse && (
        <div>
          <NewCourseFields
            families={props.families}
            versionYearOptions={props.versionYearOptions}
            familyName={familyName}
            setFamilyName={setFamilyName}
            versionYear={versionYear}
            setVersionYear={setVersionYear}
          />
          {familyName !== '' && versionYear !== '' && (
            <div>
              <label>
                The Unit Slug for this course will be:
                <HelpTip>
                  <p>
                    The unit slug is used to create the link to the unit. It is
                    in the format of studio.code.org/s/unit-slug-here. A unit
                    slug can only contain lowercase letters, numbers and dashes.
                    Once you set the slug it can not be updated.
                  </p>
                </HelpTip>
                <input name="name" value={getScriptName()} disabled={true} />
              </label>
              <input name="family_name" value={familyName} type="hidden" />
              <SavingDetailsAndButton />
            </div>
          )}
        </div>
      )}
      {!isCourse && isCourse !== null && (
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
            <input name="name" />
          </label>
          <SavingDetailsAndButton />
        </div>
      )}
    </form>
  );
}

NewUnitForm.propTypes = {
  families: PropTypes.arrayOf(PropTypes.string).isRequired,
  versionYearOptions: PropTypes.arrayOf(PropTypes.string).isRequired
};

const styles = {
  dropdown: {
    margin: '0 6px'
  },
  buttonStyle: {
    marginLeft: 0,
    marginTop: 10,
    marginBottom: 20
  }
};

function SavingDetailsAndButton() {
  return (
    <div>
      <input name="is_migrated" value={true} type="hidden" />
      <input name="lesson_groups" value={'[]'} type="hidden" />
      <br />
      <button
        className="btn btn-primary"
        type="submit"
        style={styles.buttonStyle}
      >
        Save Changes
      </button>
    </div>
  );
}
