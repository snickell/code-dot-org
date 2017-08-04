import React from 'react';
import {Provider} from 'react-redux';
import {createStoreWithReducers, registerReducers} from '@cdo/apps/redux';
import teacherSections, {setSections, serverSectionFromSection} from '../teacherDashboard/teacherSectionsRedux';
import oauthClassroom from '../teacherDashboard/oauthClassroomRedux';
import TeacherSections from './TeacherSections';

const sections = [
  {
    name: "Algebra Period 1",
    teacherName: "Ms. Frizzle",
    linkToProgress: "to Progress tab",
    assignedTitle: "CS in Algebra",
    linkToAssigned: "to Course",
    numberOfStudents: 14,
    linkToStudents: "to Manage Students tab",
    code: "ABCDEF"
  },
  {
    name: "Algebra Period 2",
    teacherName: "Ms. Frizzle",
    linkToProgress: "to Progress tab",
    assignedTitle: "CS in Algebra",
    linkToAssigned: "to Course",
    numberOfStudents: 19,
    linkToStudents: "to Manage Students tab",
    code: "EEB206"
  },
  {
    name: "Period 3",
    teacherName: "Ms. Frizzle",
    linkToProgress: "to Progress tab",
    assignedTitle: "Course 4",
    linkToAssigned: "to Course",
    numberOfStudents: 22,
    linkToStudents: "to Manage Students tab",
    code: "HPRWHG"
  },
];
const serverSections = sections.map(serverSectionFromSection);

export default [
  {
    name: 'Sections - teacher at least one section',
    description: 'shows a table of sections on the teacher homepage',
    story: () => {
      registerReducers({teacherSections, oauthClassroom});
      const store = createStoreWithReducers();
      store.dispatch(setSections(serverSections));
      return (
        <Provider store={store}>
          <TeacherSections
            sections={sections}
            isRtl={false}
            isTeacher={true}
            canLeave={false}
          />
        </Provider>
      );
    }
  },
  {
    name: 'Sections - teacher, no sections yet',
    description: 'shows a set up message if the teacher does not have any sections yet',
    story: () => {
      registerReducers({teacherSections, oauthClassroom});
      const store = createStoreWithReducers();
      return (
        <Provider store={store}>
          <TeacherSections
            sections={[]}
            isRtl={false}
            isTeacher={true}
            canLeave={false}
          />
        </Provider>
      );
    }
  },
];
