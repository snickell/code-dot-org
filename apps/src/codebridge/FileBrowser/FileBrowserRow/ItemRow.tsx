import {PopUpButton} from '@codebridge/PopUpButton/PopUpButton';
import React from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import {ActionDropdownOption} from '@cdo/apps/componentLibrary/dropdown/actionDropdown';

import {
  DropdownOptionType,
  FileBrowserIconComponentType,
  FileBrowserNameComponentType,
  FileBrowserRowItemType,
} from './types';

import moduleStyles from '../styles/filebrowser.module.scss';

/**
 * A single row in the file browser. This component does not handle
 * drag and drop, that is handled by the parent component.
 */
/**
 * Renders a single item row (file or folder) in a file browser or similar list.
 * @param item - The ProjectFile/ProjectFolder being displayed.
 * @param enableMenu - boolean - whether to display a context menu for the item.
 * @param dropdownOptions - An array of options to populate the context menu. Each option should have the following properties:
 *   - `condition`: boolean whether this item should be displayed
 *   - `iconName`: The name of the icon to display for the option.
 *   - `labelText`: The text label to display for the option.
 *   - `clickHandler`: The function to be called when the option is clicked.
 * @param IconComponent - A React component responsible for rendering the item's icon.
 * @param NameComponent - A React component responsible for rendering the item's name.
 * @param openFunction - A function to be called when the user clicks on the item name in the row.
 * @returns A JSX element representing the item row.
 */

interface ItemRowProps {
  item: FileBrowserRowItemType;
  // If the pop-up menu is enabled, we will show the 3-dot menu button on hover.
  enableMenu: boolean;
  dropdownOptions: DropdownOptionType[];
  IconComponent: FileBrowserIconComponentType;
  NameComponent: FileBrowserNameComponentType;
  openFunction: (id: string) => void;
}

export const ItemRow: React.FunctionComponent<ItemRowProps> = ({
  item,
  enableMenu,
  dropdownOptions,
  IconComponent,
  NameComponent,
  openFunction,
}) => {
  const getDropdownOptions = () => {
    return dropdownOptions
      .map(({condition, iconName, labelText, clickHandler, id}) => {
        const option: ActionDropdownOption = {
          onClick: clickHandler,
          icon: {iconName, iconStyle: 'solid'},
          label: labelText,
          value: labelText,
        };
        return condition ? option : null;
      })
      .filter(option => option !== null);
  };

  return (
    <div className={moduleStyles.row} id={`uitest-file-${item.id}-row`}>
      <div className={moduleStyles.label} onClick={() => openFunction(item.id)}>
        <IconComponent item={item} />
        <NameComponent item={item} />
      </div>
      {enableMenu && (
        <PopUpButton
          iconName="ellipsis-v"
          className={moduleStyles['button-kebab']}
          //id={`uitest-file-${item.id}-kebab`}
          // todo fix this
          options={getDropdownOptions()}
          labelText={codebridgeI18n.fileOptions()}
        />
      )}
    </div>
  );
};
