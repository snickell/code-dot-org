import Button from '@code-dot-org/component-library/button';
import {
  Heading2,
  BodyTwoText,
} from '@code-dot-org/component-library/typography';
import PropTypes from 'prop-types';
import React, {useState} from 'react';

import AccessibleDialog from '@cdo/apps/sharedComponents/AccessibleDialog';
import i18n from '@cdo/locale';

import style from '@cdo/apps/code-studio/pd/professional_learning_landing/landingPage.module.scss';

const CelebrationImage = require('@cdo/static/pd/EnrollmentCelebration.png');

export default function WorkshopEnrollmentCelebrationDialog({
  workshopTitle,
  onClose,
}) {
  const [isOpen, setIsOpen] = useState(true);
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
  onClose: PropTypes.func,
};
