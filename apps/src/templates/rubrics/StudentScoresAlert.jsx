import React from 'react';

import {selectedSectionSelector} from '@cdo/apps/templates/teacherDashboard/teacherSectionsReduxSelectors';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import i18n from '@cdo/locale';

import {selectReadyStudentCount} from './teacherRubricRedux';

import style from './rubrics.module.scss';

export default function StudentScoresAlert() {
  const studentCount = useAppSelector(selectReadyStudentCount);
  const section = useAppSelector(selectedSectionSelector);
  const sectionName = section?.name;

  if (!studentCount || !sectionName) {
    return null;
  }

  return (
    <div className={style.dismissableAlert}>
      {i18n.rubricStudentScoresAlert({studentCount, sectionName})}
    </div>
  );
}
