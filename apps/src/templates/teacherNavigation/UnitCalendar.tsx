import React, {useState, useEffect} from 'react';

import UnitCalendarGrid from '@cdo/apps//code-studio/components/progress/UnitCalendarGrid';
import {setCalendarData} from '@cdo/apps/code-studio/calendarRedux';
import {
  setUnitSummaryReduxData,
  UnitSummaryResponse,
} from '@cdo/apps/code-studio/components/progress/UnitSummaryUtils';
import {SimpleDropdown} from '@cdo/apps/componentLibrary/dropdown';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import Spinner from '@cdo/apps/sharedComponents/Spinner';
import {selectedSectionSelector} from '@cdo/apps/templates/teacherDashboard/teacherSectionsReduxSelectors';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import i18n from '@cdo/locale';

import {CalendarEmptyState} from './CalendarEmptyState';

import styles from './teacher-navigation.module.scss';

const WEEKLY_INSTRUCTIONAL_MINUTES_OPTIONS = [
  45, 90, 135, 180, 225, 270, 315, 360, 405, 450,
];
export const WEEK_WIDTH = 585;

const UnitCalendar: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false); // it is only loading when you do the fetch

  const [weeklyInstructionalMinutes, setWeeklyInstructionalMinutes] =
    useState<string>(WEEKLY_INSTRUCTIONAL_MINUTES_OPTIONS[4].toString());

  const selectedSection = useAppSelector(selectedSectionSelector);

  const unitName = selectedSection.unitName;

  const hasCalendar = useAppSelector(state => state.calendar?.showCalendar);

  const calendarLessons = useAppSelector(
    state => state.calendar?.calendarLessons
  );

  const calendarUnitName = useAppSelector(state => state.calendar?.unitName);

  const {userId, userType} = useAppSelector(state => state.currentUser);

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!selectedSection.courseOfferingId || !unitName) {
      dispatch(
        setCalendarData({
          unitName: null,
          showCalendar: false,
          calendarLessons: null,
          versionYear: null,
        })
      );
      return;
    }
    if (
      !isLoading &&
      unitName &&
      userType &&
      userId &&
      (hasCalendar === undefined ||
        calendarLessons === null ||
        unitName !== calendarUnitName)
    ) {
      setIsLoading(true);
      HttpClient.fetchJson<UnitSummaryResponse>(
        `/dashboardapi/unit_summary/${unitName}`
      )
        .then(response => response?.value)
        .then(responseJson => {
          // Initialize Redux state with the new data
          setUnitSummaryReduxData(responseJson, dispatch, userType, userId);
          setIsLoading(false);

          analyticsReporter.sendEvent(EVENTS.VIEW_UNIT_CALENDAR, {
            unitName,
          });
        })
        .catch(error => {
          console.error('Error loading unit calendar', error);

          analyticsReporter.sendEvent(EVENTS.UNIT_CALENDAR_FAILURE, {
            unitName,
          });
          return null;
        });
    }
  }, [
    unitName,
    userId,
    userType,
    hasCalendar,
    calendarLessons,
    dispatch,
    isLoading,
    selectedSection.courseOfferingId,
    calendarUnitName,
  ]);

  const weeklyMinutesOptions = WEEKLY_INSTRUCTIONAL_MINUTES_OPTIONS.map(
    value => ({
      value: value.toString(),
      text: i18n.minutesLabel({number: value}),
    })
  );

  const handleDropdownChange = (value: string) => {
    setWeeklyInstructionalMinutes(value);

    analyticsReporter.sendEvent(EVENTS.CHANGED_CALENDAR_MINUTES, {
      unitName,
      minutes: value,
    });
  };

  const needsReload = useAppSelector(
    state => state.teacherSections.needsReload
  );

  if (isLoading || needsReload) {
    return <Spinner size={'large'} />;
  }

  return (
    <div>
      {!isLoading && <CalendarEmptyState />}
      <div className={styles.calendarContentContainer}>
        {!isLoading && hasCalendar && (
          <div>
            <div className={styles.minutesPerWeekWrapper}>
              <div className={styles.minutesPerWeekDescription}>
                {i18n.instructionalMinutesPerWeek()}
              </div>
              <SimpleDropdown
                name="minutesPerWeek"
                onChange={event => handleDropdownChange(event.target.value)}
                items={weeklyMinutesOptions}
                selectedValue={weeklyInstructionalMinutes}
                size="s"
                dropdownTextThickness="thin"
                labelText="minutes per week dropdown"
                isLabelVisible={false}
              />
            </div>
            <UnitCalendarGrid
              lessons={calendarLessons}
              weeklyInstructionalMinutes={parseInt(weeklyInstructionalMinutes)}
              weekWidth={WEEK_WIDTH}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default UnitCalendar;
