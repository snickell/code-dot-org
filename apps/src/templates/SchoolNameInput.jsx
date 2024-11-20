import PropTypes from 'prop-types';
import React from 'react';

import TextField from '@code-dot-org/dsco/textField';
import i18n from '@cdo/locale';

export default function SchoolNameInput({
  fieldNames,
  schoolName,
  setSchoolName,
}) {
  const handleSchoolNameChange = name => {
    setSchoolName(name);
  };

  return (
    <TextField
      name={fieldNames.schoolName}
      label={i18n.schoolOrganizationQuestion()}
      onChange={e => handleSchoolNameChange(e.target.value)}
      value={schoolName}
    />
  );
}

SchoolNameInput.propTypes = {
  fieldNames: PropTypes.object,
  schoolName: PropTypes.string,
  setSchoolName: PropTypes.func,
};
