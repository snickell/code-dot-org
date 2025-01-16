import React from 'react';
import ReactDOM from 'react-dom';

import getScriptData from '@cdo/apps/util/getScriptData';
import AIIterationTools from '@cdo/apps/levelbuilder/ai-iteration-tools/AIIterationTools';

$(document).ready(() => {
  const aiTutorTesterData = getScriptData('aiTutorTester');
  const canRequestBulkAITutorResponses = aiTutorTesterData.allowed;

  ReactDOM.render(
    <AIIterationTools allowed={canRequestBulkAITutorResponses} />,
    document.getElementById('tester')
  );
});
