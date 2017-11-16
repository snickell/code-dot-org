import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {isRtlFromDOM} from '@cdo/apps/code-studio/isRtlRedux';
import Congrats from '@cdo/apps/templates/Congrats';
import {Provider} from 'react-redux';
import {getStore} from '@cdo/apps/redux';
import queryString from 'query-string';

$(document).ready(function () {
  const store = getStore();
  const isRtl = isRtlFromDOM();
  const script = document.querySelector('script[data-congrats]');
  const congratsData = JSON.parse(script.dataset.congrats);
  const userType = congratsData.current_user ? congratsData.current_user.user_type : "signedOut";
  const isEnglish = congratsData.english;

  let certificateId = '';
  let tutorial = '';
  try {
    const params = queryString.parse(window.location.search);
    certificateId = params['i'].replace(/[^a-z0-9_]/g, '');
    tutorial = atob(params['s']).replace(/[^A-Za-z0-9_\- ]/g, '');
  } catch (e) {}

  const tutorialType = {
    'applab-intro': 'applab',
    hero: '2017Minecraft',
    minecraft: 'pre2017Minecraft',
    mc: 'pre2017Minecraft',
  }[tutorial] || 'other';

  ReactDOM.render(
    <Provider store={store}>
      <Congrats
        certificateId={certificateId}
        completedTutorialType={tutorialType}
        isRtl={isRtl}
        userType={userType}
        isEnglish={isEnglish}
        MCShareLink="minecraft/sharelink"
      />
    </Provider>,
    document.getElementById('congrats-container')
  );
});
