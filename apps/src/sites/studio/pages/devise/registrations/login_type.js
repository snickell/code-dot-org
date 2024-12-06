import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';

import LoginTypeSelection from '@cdo/apps/signUpFlow/LoginTypeSelection';
import GlobalEditionWrapper from '@cdo/apps/templates/GlobalEditionWrapper';

$(document).ready(() => {
  ReactDOM.render(
    <GlobalEditionWrapper
      component={LoginTypeSelection}
      componentId="LoginTypeSelection"
      props={{}}
    />,
    document.getElementById('login-type-selection')
  );
});
