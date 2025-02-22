import React, {useCallback} from 'react';

import {STATE_CODES} from '@cdo/apps/geographyConstants';
import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {editStudent} from '@cdo/apps/templates/manageStudents/manageStudentsRedux';
import {selectedSectionSelector} from '@cdo/apps/templates/teacherDashboard/teacherSectionsReduxSelectors';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {CellProps} from './interface';

const Cell: React.FC<CellProps> = ({
  studentId,
  value,
  editedValue = '',
  isEditing = false,
}) => {
  const currentUser = useAppSelector(state => state.currentUser);
  const section = useAppSelector(state => selectedSectionSelector(state));
  const dispatch = useAppDispatch();
  const handleChange = useCallback(
    (event: {target: {value: string}}) => {
      const selectedUsState = event.target.value || null;

      dispatch(editStudent(studentId, {usState: selectedUsState}));

      analyticsReporter.sendEvent(
        EVENTS.SECTION_STUDENTS_TABLE_US_STATE_SET,
        {
          studentId: studentId || null,
          sectionId: section.id,
          sectionLoginType: section.loginType,
          teacherUsState: currentUser?.usStateCode,
          originalUsState: value,
          selectedUsState,
        },
        PLATFORMS.STATSIG
      );
    },
    [
      currentUser?.usStateCode,
      dispatch,
      section.id,
      section.loginType,
      studentId,
      value,
    ]
  );

  return (
    <>
      {isEditing ? (
        <select
          style={{width: 60, margin: 0}}
          name="usState"
          value={editedValue}
          onChange={handleChange}
        >
          <option value="" />
          {STATE_CODES.map(code => (
            <option key={code} value={code}>
              {code}
            </option>
          ))}
        </select>
      ) : (
        value
      )}
    </>
  );
};

export default Cell;
