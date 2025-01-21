import React from 'react';
import ReactDOM from 'react-dom';

import AIIterationTools from '@cdo/apps/levelbuilder/ai-iteration-tools/AIIterationTools';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  const aiIterationToolsData = getScriptData('aiIterationToolsData');
  ReactDOM.render(
    <AIIterationTools
      canUseAITutor={aiIterationToolsData.canUseAITutor}
      canMakeDatasets={aiIterationToolsData.canMakeDatasets}
    />,
    document.getElementById('ai-iteration-tools')
  );
});
