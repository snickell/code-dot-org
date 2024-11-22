import {sendCodebridgeAnalyticsEvent} from '@codebridge/utils/analyticsReporterHelper';
import {DAPLink, WebUSB} from 'dapjs';
import React, {useCallback} from 'react';

import {Button, buttonColors} from '@cdo/apps/componentLibrary/button';
import {TooltipProps, WithTooltip} from '@cdo/apps/componentLibrary/tooltip';
import {MAIN_PYTHON_FILE} from '@cdo/apps/lab2/constants';
import {MultiFileSource} from '@cdo/apps/lab2/types';
import VersionHistoryButton from '@cdo/apps/lab2/views/components/versionHistory/VersionHistoryButton';
import {useDialogControl, DialogType} from '@cdo/apps/lab2/views/dialogs';
import {
  MICROBIT_VENDOR_ID,
  MICROBIT_PRODUCT_ID,
  MICROBIT_IDS_V1,
  MICROBIT_IDS_V2,
  MICROBIT_V1,
  MICROBIT_V2,
  MICROBIT_FIRMATA_V1_URL,
  MICROBIT_FIRMATA_V2_URL,
} from '@cdo/apps/maker/boards/microBit/MicroBitConstants';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import commonI18n from '@cdo/locale';

import {useCodebridgeContext} from '../codebridgeContext';

import moduleStyles from './workspace.module.scss';
import darkModeStyles from '@cdo/apps/lab2/styles/dark-mode.module.scss';

const WorkspaceHeaderButtons: React.FunctionComponent = () => {
  const {startSource} = useCodebridgeContext();

  const appName = useAppSelector(state => state.lab.levelProperties?.appName);
  const skipUrl = useAppSelector(state => state.lab.levelProperties?.skipUrl);
  const dialogControl = useDialogControl();
  const source = useAppSelector(
    state => state.lab2Project.projectSource?.source
  ) as MultiFileSource | undefined;
  const files = source?.files || {};
  let pythonCode = '';
  for (const file of Object.values(files as object)) {
    if (file.name === MAIN_PYTHON_FILE) {
      pythonCode = file.contents;
    }
  }
  console.log('pythonCode', pythonCode);
  const feedbackTooltipProps: TooltipProps = {
    text: commonI18n.feedback(),
    direction: 'onLeft',
    tooltipId: 'feedback-tooltip',
    size: 'xs',
    className: darkModeStyles.tooltipLeft,
  };

  const openFeedbackForm = () => {
    window.open('https://forms.gle/Z4FsGMFzE4NrFp369', '_blank');
  };

  const onClickSkip = useCallback(() => {
    if (dialogControl) {
      dialogControl.showDialog({
        type: DialogType.Skip,
        handleConfirm: () => {
          if (skipUrl) {
            sendCodebridgeAnalyticsEvent(EVENTS.SKIP_TO_PROJECT, appName, {
              levelPath: window.location.pathname,
            });
            window.location.href = skipUrl;
          }
        },
      });
    }
  }, [appName, dialogControl, skipUrl]);

  const onClickFlash = async () => {
    console.log('flash micro:bit');
    console.log('appName', appName);
    const device = await navigator.usb.requestDevice({
      filters: [{vendorId: MICROBIT_VENDOR_ID, productId: MICROBIT_PRODUCT_ID}],
    });
    const microBitId = device.serialNumber?.substring(0, 4);
    if (microBitId) {
      let microBitVersion = null;
      if (MICROBIT_IDS_V1.includes(microBitId)) {
        microBitVersion = MICROBIT_V1;
      } else if (MICROBIT_IDS_V2.includes(microBitId)) {
        microBitVersion = MICROBIT_V2;
      }
      if (microBitVersion === null) {
        throw new Error('micro:bit version not detected correctly.');
      }
      console.log('microbitId microBitVersion', microBitId, microBitVersion);
      const transport = new WebUSB(device);
      const target = new DAPLink(transport);
      console.log('target', target);
      // TODO: Implement update percent.

      /* TODO: Get modified .hex file that includes: 
        1. An identical copy of the base MicroPython .hex code file;
        2. A small header which marks a region as a MicroPython script (followed by the length of the script in bytes);
        3. A verbatim copy of user's Python program, complete with comments and any spaces.
        Ref: uFlash package (python implementation). https://github.com/ntoll/uflash
        See uflash implementation for mu editor at https://github.com/mu-editor/mu/blob/master/mu/modes/microbit.py
        TS implementation in https://github.com/microbit-foundation/python-editor-v3
        */
      // Python code stored in pythonCode.
      // For now just flash the Code.org Firmata.
      const firmataUrl =
        microBitVersion === MICROBIT_V1
          ? MICROBIT_FIRMATA_V1_URL
          : MICROBIT_FIRMATA_V2_URL;
      const result = await fetch(firmataUrl);
      const hexStr = await result.text();
      // Intel Hex is currently in ASCII, do a 1-to-1 conversion from chars to bytes
      const hexAsBytes = new TextEncoder().encode(hexStr);
      try {
        // Push binary to board
        await target.connect();
        await target.flash(hexAsBytes);
        await target.disconnect();
      } catch (error) {
        console.log(error);
        return Promise.reject('Failed to send program to micro:bit.');
      }
    }
  };

  return (
    <div className={moduleStyles.rightHeaderButtons}>
      <Button
        iconRight={{iconStyle: 'solid', iconName: 'arrow-right-from-arc'}}
        onClick={onClickFlash}
        size={'xs'}
        type={'tertiary'}
        color={buttonColors.white}
        text={'Send to micro:bit'}
        className={darkModeStyles.tertiaryButton}
      />
      <VersionHistoryButton startSource={startSource} />
      {appName === 'pythonlab' && (
        <WithTooltip tooltipProps={feedbackTooltipProps}>
          <Button
            isIconOnly
            icon={{iconStyle: 'solid', iconName: 'commenting'}}
            color={'white'}
            onClick={openFeedbackForm}
            ariaLabel={commonI18n.feedback()}
            size={'xs'}
            type={'tertiary'}
            className={darkModeStyles.tertiaryButton}
          />
        </WithTooltip>
      )}
      {skipUrl && (
        <Button
          iconRight={{iconStyle: 'solid', iconName: 'arrow-right'}}
          onClick={onClickSkip}
          size={'xs'}
          type={'tertiary'}
          color={buttonColors.white}
          text={commonI18n.skipToProject()}
          className={darkModeStyles.tertiaryButton}
        >
          {commonI18n.skipToProject()}
        </Button>
      )}
    </div>
  );
};

export default WorkspaceHeaderButtons;
