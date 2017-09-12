import { assert } from '../../../util/configuredChai';
import React from 'react';
import { shallow } from 'enzyme';
import {
  UnconnectedSectionTableButtonCell as SectionTableButtonCell,
} from '@cdo/apps/templates/teacherDashboard/SectionTableButtonCell';
import experiments from '@cdo/apps/util/experiments';

describe('SectionTableButtonCell', () => {
  before(() => {
    experiments.setEnabled('hide-sections', true);
  });
  after(() => {
    experiments.setEnabled('hide-sections', false);
  });

  const section = {
    id: 1,
    name: 'sectionA',
    loginType: 'picture',
    studentCount: 3,
    code: 'ABC',
    grade: '5',
    providerManaged: false,
    hidden: false,
    assignmentNames: ['CS Discoveries', 'Unit 1: Problem Solving'],
    assignmentPaths: ['//localhost-studio.code.org:3000/courses/csd', '//localhost-studio.code.org:3000/s/csd1']
  };

  it('shows edit/hide buttons', () => {
    const wrapper = shallow(
      <SectionTableButtonCell sectionData={section}/>
    );
    assert.equal(wrapper.find('Button').length, 2);
    assert.equal(wrapper.find('Button').at(0).props().text, 'Edit');
    assert.equal(wrapper.find('Button').at(1).props().text, 'Hide');
  });

  it('shows edit/show buttons if hidden', () => {
    const wrapper = shallow(
      <SectionTableButtonCell
        sectionData={{
          ...section,
          hidden: true
        }}
      />
    );
    assert.equal(wrapper.find('Button').length, 2);
    assert.equal(wrapper.find('Button').at(0).props().text, 'Edit');
    assert.equal(wrapper.find('Button').at(1).props().text, 'Show');
  });

  it('shows PrintCertificates button', () => {
    const wrapper = shallow(
      <SectionTableButtonCell sectionData={section}/>
    );
    assert.equal(wrapper.find('PrintCertificates').length, 1);
  });

  it('does not show DeleteAndConfirm when section has students', () => {
    const wrapper = shallow(
      <SectionTableButtonCell sectionData={section}/>
    );
    assert.equal(wrapper.find('DeleteAndConfirm').length, 0);
  });

  it('does show DeleteAndConfirm when section has 0 students', () => {
    const wrapper = shallow(
      <SectionTableButtonCell
        sectionData={{
          ...section,
          studentCount: 0
        }}
      />
    );
    assert.equal(wrapper.find('DeleteAndConfirm').length, 1);
  });
});
