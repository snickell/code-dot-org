import {PopUpButton} from '@codebridge/PopUpButton/PopUpButton';
import {PopUpButtonOption} from '@codebridge/PopUpButton/PopUpButtonOption';
import React from 'react';

import {ItemRowProps} from '../types';

import moduleStyles from '../styles/filebrowser.module.scss';

/**
 * A single row in the file browser. This component does not handle
 * drag and drop, that is handled by the parent component.
 */
export const ItemRow: React.FunctionComponent<ItemRowProps> = ({
  item,
  enableMenu,
  dropdownOptions,
  IconComponent,
  NameComponent,
  openFunction,
}) => {
  return (
    <div className={moduleStyles.row}>
      <div className={moduleStyles.label} onClick={() => openFunction(item.id)}>
        <IconComponent item={item} />
        <NameComponent item={item} />
      </div>
      {enableMenu && (
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
