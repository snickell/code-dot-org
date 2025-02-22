import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import ControlButtons from '@codebridge/Console/ControlButtons';
import {MiniApps} from '@codebridge/constants';
import React from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';

import NeighborhoodPreview from './NeighborhoodPreview';

import moduleStyles from './mini-app-preview.module.scss';

const MiniAppPreview: React.FunctionComponent = () => {
  const {config, labConfig} = useCodebridgeContext();
  const isHorizontal = config.activeGridLayout === 'horizontal';

  const miniApp = labConfig?.miniApp?.name;

  const miniAppComponent =
    miniApp === MiniApps.Neighborhood ? <NeighborhoodPreview /> : null;

  return (
    <PanelContainer
      id="codebridge-preview"
      headerContent={codebridgeI18n.preview()}
      leftHeaderContent={<ControlButtons />}
      className={
        isHorizontal
          ? moduleStyles.previewContainerHorizontal
          : moduleStyles.previewContainerVertical
      }
      headerClassName={moduleStyles.previewHeader}
    >
      {miniAppComponent}
    </PanelContainer>
  );
};

export default MiniAppPreview;
