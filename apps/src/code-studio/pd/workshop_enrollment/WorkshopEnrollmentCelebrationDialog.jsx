import PropTypes from 'prop-types';
import React, {useState} from 'react';

import Button from '@cdo/apps/componentLibrary/button/Button';
import LinkButton from '@cdo/apps/componentLibrary/button/LinkButton';
import Typography, {
  Heading2,
  BodyTwoText,
} from '@cdo/apps/componentLibrary/typography';
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

  const onCloseDialog = () => {
    if (onClose) {
      onClose();
    }
    setIsOpen(false);
  };

  const buildGoogleCalendarLink = session => {
    const date = `${session.year}${session.month}${session.day}`;
    const startTime = `${date}T${session.start_hour}${session.start_min}00Z`;
    const endTime = `${date}T${session.end_hour}${session.end_min}00Z`;

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      workshopTitle
    )}&location=${encodeURIComponent(
      workshopLocation
    )}&dates=${startTime}/${endTime}`;
  };

  const buildOutlookCalendarLink = session => {
    const date = `${session.year}-${session.month}-${session.day}`;
    const startTime = `${date}T${session.start_hour}:${session.start_min}:00Z`;
    const endTime = `${date}T${session.end_hour}:${session.end_min}:00Z`;

    return `https://outlook.live.com/calendar/action/compose?rru=addevent&subject=${encodeURIComponent(
      workshopTitle
    )}&location=${encodeURIComponent(
      workshopLocation
    )}&startdt=${startTime}&enddt=${endTime}`;
  };

  return (
    isOpen && (
      <AccessibleDialog
        className={style.celebrationContainer}
        onClose={onCloseDialog}
        closeOnClickBackdrop={true}
      >
        <div className={style.dialogContainer}>
          <div className={style.contentContainer}>
            <img src={CelebrationImage} alt="" />
            <Heading2>{i18n.enrollmentCelebrationTitle()}</Heading2>
            <BodyTwoText>
              {i18n.enrollmentCelebrationBody({workshopName: workshopTitle})}
            </BodyTwoText>
            <div className={style.calendarButtonContainer}>
              <Typography semanticTag={'h3'} visualAppearance={'overline-two'}>
                {i18n.addToYourCalendar()}
              </Typography>
              <div className={style.calendarButtons}>
                <LinkButton
                  text={'Google'}
                  href={buildGoogleCalendarLink(workshopSessionInfo[0])}
                  type={'secondary'}
                  color={'black'}
                  iconLeft={{
                    iconName: 'brands fa-google',
                    iconStyle: 'light',
                  }}
                />
                <LinkButton
                  text={'Outlook'}
                  href={buildOutlookCalendarLink(workshopSessionInfo[0])}
                  type={'secondary'}
                  color={'black'}
                  iconLeft={{
                    iconName: 'brands fa-microsoft',
                    iconStyle: 'light',
                  }}
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
  workshopTitle: PropTypes.string,
  workshopLocation: PropTypes.string,
  workshopSessionInfo: PropTypes.arrayOf(PropTypes.object),
  onClose: PropTypes.func,
};
