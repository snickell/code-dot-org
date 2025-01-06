import React from 'react';
import ReactDOM from 'react-dom';

import StudentUserTypeChangePrompt from '@cdo/apps/accounts/StudentUserTypeChangePrompt';
import getScriptData from '@cdo/apps/util/getScriptData';

const {workshopId} = getScriptData('studentCannotEnroll');

const userReturnTo = workshopId
  ? `/pd/workshops/${workshopId}/enroll`
  : undefined;

document.addEventListener('DOMContentLoaded', function () {
  ReactDOM.render(
    <StudentUserTypeChangePrompt userReturnTo={userReturnTo} />,
    document.getElementById('workshop-enroll-students-cannot-enroll')
  );
});
