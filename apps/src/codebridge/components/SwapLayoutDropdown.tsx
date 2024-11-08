import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import {sendCodebridgeAnalyticsEvent} from '@codebridge/utils/analyticsReporterHelper';
import React, {useCallback} from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {PopUpButton} from '../PopUpButton/PopUpButton';

/*
  Please note - this is a fairly brittle component in that it's only allowing toggling between
  horizontal and vertical layouts.

  At some point in the future, we may need to expand the functionality to select between arbitrary
  layouts which are available.
*/

const SwapLayoutDropdown: React.FunctionComponent = () => {
  const {config, setConfig} = useCodebridgeContext();
  const appName = useAppSelector(state => state.lab.levelProperties?.appName);

  const onLayoutChange = useCallback(() => {
    const newLayout =
      config.activeGridLayout === 'horizontal' ? 'vertical' : 'horizontal';
    sendCodebridgeAnalyticsEvent(EVENTS.CODEBRIDGE_MOVE_CONSOLE, appName, {
      positionMovedTo: newLayout,
    });
    setConfig({
      ...config,
      activeGridLayout: newLayout,
    });
  }, [appName, config, setConfig]);

  if (!config.activeGridLayout || !config.labeledGridLayouts) {
    return null;
  }

  const iconName =
    config.activeGridLayout === 'horizontal' ? 'up-down' : 'left-right';
  const layoutLabel =
    config.activeGridLayout === 'horizontal'
      ? codebridgeI18n.verticalLayout()
      : codebridgeI18n.defaultLayout();

  return (
    <PopUpButton
      options={[
        {
          onClick: onLayoutChange,
          label: layoutLabel,
          value:
            config.activeGridLayout === 'horizontal'
              ? 'change-vertical'
              : 'change-horizontal',
          icon: {
            iconName,
            iconStyle: 'solid',
          },
        },
      ]}
      iconName="ellipsis-v"
      alignment="right"
      labelText={codebridgeI18n.changeLayout()}
    />
  );
};

export default SwapLayoutDropdown;
