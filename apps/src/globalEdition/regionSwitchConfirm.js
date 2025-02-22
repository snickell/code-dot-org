import React from 'react';
import ReactDOM from 'react-dom';

import {default as GlobalEditionRegionSwitchConfirm} from '@cdo/apps/templates/globalEdition/RegionSwitchConfirm';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    <GlobalEditionRegionSwitchConfirm
      code={getScriptData('code')}
      name={getScriptData('name')}
    />,
    document.getElementById('global-edition-region-switch-confirm-container')
  );
});
