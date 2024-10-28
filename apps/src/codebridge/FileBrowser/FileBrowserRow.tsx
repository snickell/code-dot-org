import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import OverflowTooltip from '@codebridge/components/OverflowTooltip';
import {PopUpButton} from '@codebridge/PopUpButton/PopUpButton';
import {PopUpButtonOption} from '@codebridge/PopUpButton/PopUpButtonOption';
import {ProjectFile} from '@codebridge/types';
import {getFileIconNameAndStyle} from '@codebridge/utils';
import classNames from 'classnames';
import React from 'react';

import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';

import {useFileRowOptions} from './hooks';

import moduleStyles from './styles/filebrowser.module.scss';
import darkModeStyles from '@cdo/apps/lab2/styles/dark-mode.module.scss';

export type FileBrowserRowProps = {
  file: ProjectFile;
  isReadOnly: boolean;
  // If the pop-up menu is enabled, we will show the 3-dot menu button on hover.
  enableMenu: boolean;
  hasValidationFile: boolean; // If the project has a validation file already.
};

/**
 * A single file row in the file browser. This component does not handle
 * drag and drop, that is handled by the parent component.
 */
const FileBrowserRow: React.FunctionComponent<FileBrowserRowProps> = ({
  file,
  isReadOnly,
  enableMenu,
  hasValidationFile,
}) => {
  const {openFile} = useCodebridgeContext();

  const {iconName, iconStyle, isBrand} = getFileIconNameAndStyle(file);
  const iconClassName = isBrand
    ? classNames('fa-brands', moduleStyles.rowIcon)
    : moduleStyles.rowIcon;

  const dropdownOptions = useFileRowOptions(file, hasValidationFile);

  return (
    <div className={moduleStyles.row}>
      <div className={moduleStyles.label} onClick={() => openFile(file.id)}>
        <FontAwesomeV6Icon
          iconName={iconName}
          iconStyle={iconStyle}
          className={iconClassName}
        />

        <OverflowTooltip
          tooltipProps={{
            text: file.name,
            tooltipId: `file-tooltip-${file.id}`,
            size: 's',
            direction: 'onBottom',
            className: darkModeStyles.tooltipBottom,
          }}
          tooltipOverlayClassName={moduleStyles.nameContainer}
          className={moduleStyles.nameContainer}
        >
          <span>{file.name}</span>
        </OverflowTooltip>
      </div>
      {!isReadOnly && enableMenu && (
        <PopUpButton
          iconName="ellipsis-v"
          className={moduleStyles['button-kebab']}
        >
          <span className={moduleStyles['button-bar']}>
            {dropdownOptions.map(
              ({condition, iconName, labelText, clickHandler}) =>
                condition && (
                  <PopUpButtonOption
                    key={labelText}
                    iconName={iconName}
                    labelText={labelText}
                    clickHandler={clickHandler}
                  />
                )
            )}
          </span>
        </PopUpButton>
      )}
    </div>
  );
};

export default FileBrowserRow;
