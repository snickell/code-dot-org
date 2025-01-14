import PropTypes from 'prop-types';
import React, {useState} from 'react';

import {Button, LinkButton} from '@cdo/apps/componentLibrary/button/Button';
import {Heading2, BodyTwoText} from '@cdo/apps/componentLibrary/typography';
import AccessibleDialog from '@cdo/apps/sharedComponents/AccessibleDialog';
import i18n from '@cdo/locale';

import style from '@cdo/apps/code-studio/pd/professional_learning_landing/landingPage.module.scss';

const CelebrationImage = require('@cdo/static/pd/EnrollmentCelebration.png');

export default function WorkshopEnrollmentCelebrationDialog({
  workshopTitle,
  workshopLocation,
  workshopSessionInfo,
  onClose,
}) {
  const [isOpen, setIsOpen] = useState(true);

  const addToGoogleCalendarLink = () => {
    const firstSession = workshopSessionInfo[0];
    const date = `${firstSession.year}${firstSession.month}${firstSession.day}`;
    const startTime = `${date}T${firstSession.start_hour}${firstSession.start_min}00Z`;
    const endTime = `${date}T${firstSession.end_hour}${firstSession.end_min}00Z`;

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      workshopTitle
    )}&location=${encodeURIComponent(
      workshopLocation
    )}&dates=${startTime}/${endTime}`;
  };

  const addToOutlookCalendarLink = () => {
    const firstSession = workshopSessionInfo[0];
    const date = `${firstSession.year}-${firstSession.month}-${firstSession.day}`;
    const startTime = `${date}T${firstSession.start_hour}:${firstSession.start_min}:00Z`;
    const endTime = `${date}T${firstSession.end_hour}:${firstSession.end_min}:00Z`;

    return `https://outlook.live.com/calendar/action/compose?rru=addevent&subject=${encodeURIComponent(
      workshopTitle
    )}&location=${encodeURIComponent(
      workshopLocation
    )}&startdt=${startTime}&enddt=${endTime}`;
  };

  const onCloseDialog = () => {
    if (onClose) {
      onClose();
    }
    setIsOpen(false);
  };

  return (
    isOpen && (
      <AccessibleDialog
        className={style.celebrationContainer}
        onClose={onCloseDialog}
        closeOnClickBackdrop={true}
      >
        <div className={style.containerMargin}>
          <img src={CelebrationImage} alt="" />
          <div className={style.containerMargin}>
            <Heading2>{i18n.enrollmentCelebrationTitle()}</Heading2>
            <BodyTwoText>
              {i18n.enrollmentCelebrationBody({workshopName: workshopTitle})}
            </BodyTwoText>
          </div>
          <Heading2>{i18n.addToYourCalendar()}</Heading2>
          <div className={style.calendarButtons}>
            <LinkButton
              text={'Google'}
              iconLeft={'google'}
              href={addToGoogleCalendarLink}
            />
            <LinkButton
              text={'Outlook'}
              iconLeft={'microsoft'}
              href={addToOutlookCalendarLink}
            />
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
  workshopTitle: PropTypes.string,
  workshopLocation: PropTypes.string,
  workshopSessionInfo: PropTypes.arrayOf(PropTypes.object),
  onClose: PropTypes.func,
};
