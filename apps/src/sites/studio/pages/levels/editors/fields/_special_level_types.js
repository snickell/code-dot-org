import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';

import Button from '@cdo/apps/componentLibrary/button/Button';

$(document).ready(function () {
  $('#plusAnswerContainedLevel').on('click', () => {
    $('#plusAnswerContainedLevel')
      .prev()
      .clone()
      .insertBefore('#plusAnswerContainedLevel');
  });

  ReactDOM.render(
    <Button
      onClick={() => {
        console.log('clicked');
      }}
    />,
    document.getElementById('find-a-level-dialog')
  );
});
