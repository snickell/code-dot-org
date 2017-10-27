import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/configuredChai';
import i18n from '@cdo/locale';
import {joinedSections} from './homepagesTestData';
import SectionsTable from '@cdo/apps/templates/studioHomepages/SectionsTable';

describe('SectionsTable', () => {

  it('shows column headers for students', () => {
    const wrapper = shallow(
      <SectionsTable
        sections={joinedSections}
        isRtl={false}
        isTeacher={false}
        canLeave={false}
      />
    );
    [
      i18n.section(),
      i18n.course(),
      i18n.teacher(),
      i18n.sectionCode(),
    ].forEach((headerText) => {
      expect(wrapper).to.containMatchingElement(
        <td>
          <div>
            {headerText}
          </div>
        </td>
      );
    });
  });

  it('shows column headers for teachers', () => {
    const wrapper = shallow(
      <SectionsTable
        sections={joinedSections}
        isRtl={false}
        isTeacher={true}
        canLeave={false}
      />
    );
    [
      i18n.section(),
      i18n.course(),
      i18n.students(),
      i18n.sectionCode(),
    ].forEach((headerText) => {
      expect(wrapper).to.containMatchingElement(
        <td>
          <div>
            {headerText}
          </div>
        </td>
      );
    });
  });

  it('does not show a leave section button for teacher-managed student accounts', () => {
    const wrapper = shallow(
      <SectionsTable
        sections={joinedSections}
        isRtl={false}
        isTeacher={false}
        canLeave={false}
      />
    );
    expect(wrapper.find('Button').exists()).to.be.false;
  });

  it('shows a leave section button for students who do not have teacher-managed accounts', () => {
    const wrapper = shallow(
      <SectionsTable
        sections={joinedSections}
        isRtl={false}
        isTeacher={false}
        canLeave={true}
      />
    );
    expect(wrapper.find('Button').exists()).to.be.true;
  });

  it('does not show a leave section button for teacher accounts', () => {
    const wrapper = shallow(
      <SectionsTable
        sections={joinedSections}
        isRtl={false}
        isTeacher={true}
        canLeave={false}
      />
    );
    expect(wrapper.find('Button').exists()).to.be.false;
  });

  it('renders a row for each joined section', () => {
    const wrapper = shallow(
      <SectionsTable
        sections={joinedSections}
        isRtl={false}
        isTeacher={false}
        canLeave={false}
      />
    );
    expect(wrapper.find('.test-row')).to.have.length(4);
    joinedSections.forEach((section) => {
      expect(wrapper).to.containMatchingElement(
        <td>
          <div>
            {section.name}
          </div>
        </td>
      );
      expect(wrapper).to.containMatchingElement(
        <td>
          <a>
            {section.assignedTitle}
          </a>
        </td>
      );
      expect(wrapper).to.containMatchingElement(
        <td>
          {section.teacherName}
        </td>
      );
    });
  });
});
