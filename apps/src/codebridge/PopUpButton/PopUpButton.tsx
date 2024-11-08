import React from 'react';

import ActionDropdown, {
  ActionDropdownOption,
} from '@cdo/apps/componentLibrary/dropdown/actionDropdown';

import darkModeStyles from '@cdo/apps/lab2/styles/dark-mode.module.scss';

type PopUpButtonProps = {
  iconName: string;
  options: ActionDropdownOption[];
  className?: string;
  alignment?: 'left' | 'right';
  id?: string;
  labelText: string;
};

export const PopUpButton = ({
  options,
  iconName,
  className,
  alignment = 'left',
  id,
  labelText,
}: PopUpButtonProps) => {
  return (
    <ActionDropdown
      name="swap-layout"
      labelText={labelText}
      triggerButtonProps={{
        color: 'white',
        size: 'xs',
        icon: {
          iconName: iconName,
          iconStyle: 'solid',
        },
        isIconOnly: true,
        type: 'tertiary',
        className: darkModeStyles.iconOnlyTertiaryButton,
      }}
      options={options}
      menuPlacement={alignment}
      size="xs"
    />
  );
};
