import {action} from '@storybook/addon-actions';
import React from 'react';

import CensusTeacherBanner from './CensusTeacherBanner';

export default {
  component: CensusTeacherBanner,
};

const Template = args => (
  <CensusTeacherBanner
    onDismiss={action('dismiss')}
    onPostpone={action('postpone')}
    onTeachesChange={action('teachesChange')}
    onInClassChange={action('inClassChange')}
    existingSchoolInfo={{
      id: 'ABCD',
      name: 'NCES School',
      country: 'US',
      zip: '12345',
    }}
    onSubmitSuccess={action('submitSuccess')}
    {...args}
  />
);
export const BasicCensus = Template.bind({});
BasicCensus.args = {
  question: 'how_many_10_hours',
  teacherName: 'BlakeSmith',
  teacherEmail: 'BlakeSmith@gmail.com',
  teaches: false,
  inClass: true,
  schoolYear: 2024,
};

export const BasicTeacherCensus = Template.bind({});
BasicTeacherCensus.args = {
  question: 'how_many_10_hours',
  teaches: true,
  inClass: true,
  teacherName: 'BlakeSmith',
  teacherEmail: 'BlakeSmith@gmail.com',
  schoolYear: 2024,
};
