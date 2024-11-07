import {render, screen} from '@testing-library/react';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {Provider} from 'react-redux';
import {Store} from 'redux';

import calendar from '@cdo/apps/code-studio/calendarRedux';
import {
  getStore,
  registerReducers,
  restoreRedux,
  stubRedux,
} from '@cdo/apps/redux';
import locales, {setLocaleCode} from '@cdo/apps/redux/localesRedux';
import unitSelection, {setUnitName} from '@cdo/apps/redux/unitSelectionRedux';
import currentUser, {
  setInitialData,
} from '@cdo/apps/templates/currentUserRedux';
import teacherSectionsRedux, {
  selectSection,
  setSections,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import UnitCalendar from '@cdo/apps/templates/teacherNavigation/UnitCalendar';
import HttpClient from '@cdo/apps/util/HttpClient';
import i18n from '@cdo/locale';

const SECTIONS = [
  {
    id: 1,
    name: 'Period 2',
    course_offering_id: 123,
    courseVersionId: 2023,
    unitName: 'csd1-2024',
    unitSelection: {
      unitName: 'csd1-2024',
    },
  },
];

const UNIT_SUMMARY = {
  id: 1,
  name: 'csd1-2024',
  lessons: [],
  title: "Unit 1 - Problem Solving and Computing ('23-'24)",
  description: 'CSD description',
  studentDescription: 'CSD student description',
  course_versions: {},
  courseVersionId: 2,
  lessonGroups: [],
  isPlCourse: false,
  plc: false,
  calendarLessons: [
    {
      id: 1,
      lessonNumber: 1,
      title: 'First Lesson',
      duration: 45,
      assessment: false,
      unplugged: false,
      url: '/lesson/1',
    },
  ],
  showCalendar: true,
};

const NO_SHOW_UNIT_SUMMARY = {
  ...UNIT_SUMMARY,
  showCalendar: false,
};

describe('UnitCalendar', () => {
  let store: Store;

  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    stubRedux();

    registerReducers({
      locales,
      currentUser,
      teacherSectionsRedux,
      unitSelection,
      calendar,
    });

    store = getStore();

    store.dispatch(setLocaleCode('en-US'));
    store.dispatch(setInitialData({id: 1, user_type: 'teacher'}));
    store.dispatch(setSections(SECTIONS));
    store.dispatch(selectSection(1));
    store.dispatch(setUnitName('csd1-2024'));

    // fetchSpy = jest.spyOn(HttpClient, 'fetchJson').mockResolvedValue({
    //   value: {
    //     unitData: NO_SHOW_UNIT_SUMMARY,
    //     plcBreadcrumb: {
    //       unit_name: 'csd1-2024',
    //       course_view_path: 'http://example.com/course',
    //     },
    //   },
    //   response: new Response(),
    // });
    fetchSpy = jest.spyOn(HttpClient, 'fetchJson');
  });

  afterEach(() => {
    restoreRedux();
  });

  function renderComponent() {
    return render(
      <Provider store={store}>
        <UnitCalendar />
      </Provider>
    );
  }

  // ALL WORKS WITH UNIT_SUMMARY
  it('renders loading spinner initially', async () => {
    fetchSpy.mockResolvedValue(new Promise(() => {}));
    renderComponent();

    screen.getByTitle('Loading...');
    jest.restoreAllMocks();
  });

  it('renders calendar with instructional minutes dropdown, week, and calendar when loaded', async () => {
    fetchSpy.mockResolvedValue({
      value: {
        unitData: UNIT_SUMMARY,
        plcBreadcrumb: {
          unit_name: 'csd1-2024',
          course_view_path: 'http://example.com/course',
        },
      },
      response: new Response(),
    });
    await act(async () => {
      renderComponent();
    });

    screen.getByText(i18n.instructionalMinutesPerWeek());
    screen.getByText('First Lesson');
    screen.getByText('Week 1');
    jest.restoreAllMocks();
  });

  // Works for SHOW_NO_UNIT_SUMMARY
  it('shows no calendar, when showCalendar is false', async () => {
    console.log('running no calendar test');
    fetchSpy.mockResolvedValue({
      value: {
        unitData: NO_SHOW_UNIT_SUMMARY,
        plcBreadcrumb: {
          unit_name: 'csd1-2024',
          course_view_path: 'http://example.com/course',
        },
      },
      response: new Response(),
    });
    await act(async () => {
      renderComponent();
    });

    screen.getByAltText(i18n.calendarNotAvailable());
    screen.getByText(i18n.calendarNotAvailable());
    jest.restoreAllMocks();
  });
});
