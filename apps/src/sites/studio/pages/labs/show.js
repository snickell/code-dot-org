import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {getStore} from '../../../../code-studio/redux';
import LabView from '../../../../labs/LabView';
import * as $ from 'jquery';

$(document).ready(function() {
  ReactDOM.render(
    <Provider store={getStore()}>
      <LabView />
    </Provider>,
    document.getElementById('labs-container')
  );
});
