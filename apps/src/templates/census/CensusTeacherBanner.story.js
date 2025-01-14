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
    question="how_many_10_hours"
    inClass={true}
    teacherName="BlakeSmith"
    teacherEmail="BlakeSmith@gmail.com"
    onSubmitSuccess={action('submitSuccess')}
    schoolYear={2024}
    {...args}
  />
);
export const BasicCensusBanner = Template.bind({});
BasicCensusBanner.args = {
  teaches: false,
};

export const BasicTeacherCensusBanner = Template.bind({});
BasicTeacherCensusBanner.args = {
  teaches: true,
};
