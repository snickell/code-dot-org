import PropTypes from 'prop-types';
import React, {useState} from 'react';

import {LinkButton} from '@cdo/apps/componentLibrary/button';
import Button from '@cdo/apps/componentLibrary/button/Button';
import {
  OverlineTwoText,
  Heading2,
  BodyTwoText,
} from '@cdo/apps/componentLibrary/typography';
import AccessibleDialog from '@cdo/apps/sharedComponents/AccessibleDialog';
import i18n from '@cdo/locale';

import style from '@cdo/apps/code-studio/pd/professional_learning_landing/landingPage.module.scss';

const CelebrationImage = require('@cdo/static/pd/EnrollmentCelebration.png');

export default function WorkshopEnrollmentCelebrationDialog({
  workshopCourseName = 'a new workshop',
  onClose,
}) {
  const [isOpen, setIsOpen] = useState(true);
  const onCloseDialog = () => {
    if (onClose) {
      onClose();
    }
    setIsOpen(false);
  };

  const startTime = '20211001T100000';
  const endTime = 'T010000';
  const workshopName = 'Example%20event';
  const workshopDescription =
    'This%20is%20a%20description%20of%20an%20example%20event.%20';
  const workshopLocation = 'Office';

  const addToGoogleCalendarUrl = `http://www.google.com/calendar/event?action=TEMPLATE&dates=${startTime}Z%2F${endTime}Z&text=${workshopName}&location=${workshopLocation}&details=${workshopDescription}`;

  return (
    isOpen && (
      <AccessibleDialog
        className={style.celebrationContainer}
        onClose={onCloseDialog}
        closeOnClickBackdrop={true}
      >
        <div className={style.contentContainer}>
          <div className={style.enrollContent}>
            <img src={CelebrationImage} alt="" />
            <Heading2>{i18n.enrollmentCelebrationTitle()}</Heading2>
            <BodyTwoText>
              {i18n.enrollmentCelebrationBody({workshopCourseName})}
            </BodyTwoText>
            <div className={style.calendarButtonContainer}>
              <OverlineTwoText>
                {i18n.enrollmentCelebrationAddToCalendar()}
              </OverlineTwoText>
              <div className={style.calendarButtons}>
                <LinkButton
                  className={style.calendarButton}
                  useAsLink={true}
                  type="secondary"
                  text="Apple"
                  iconLeft={{iconName: 'brands fa-apple', iconStyle: 'light'}}
                  href={addToGoogleCalendarUrl}
                  target="_blank"
                />
                <LinkButton
                  className={style.calendarButton}
                  useAsLink={true}
                  type="secondary"
                  text="Google"
                  iconLeft={{iconName: 'brands fa-google', iconStyle: 'solid'}}
                  href={addToGoogleCalendarUrl}
                  target="_blank"
                />
                <LinkButton
                  className={style.calendarButton}
                  useAsLink={true}
                  type="secondary"
                  text="Outlook"
                  iconLeft={{
                    iconName: 'brands fa-microsoft',
                    iconStyle: 'light',
                  }}
                  href={addToGoogleCalendarUrl}
                  target="_blank"
                />
              </div>
            </div>
          </div>
          <Button
            onClick={onCloseDialog}
            text={i18n.enrollmentCelebrationCallToAction()}
          />
        </div>
      </AccessibleDialog>
    )
  );
}

WorkshopEnrollmentCelebrationDialog.propTypes = {
  workshopCourseName: PropTypes.string,
  onClose: PropTypes.func,
};
