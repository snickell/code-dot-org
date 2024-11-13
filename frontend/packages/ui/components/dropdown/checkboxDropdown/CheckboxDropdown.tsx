import React, {AriaAttributes, memo, MouseEvent} from 'react';

import Button, {buttonColors} from '@/button';
import Checkbox from '@/checkbox';
import {dropdownColors} from '@/common/constants';
import {DropdownProviderWrapper} from '@/common/contexts/DropdownContext';
import {
  ComponentSizeXSToL,
  DropdownColor,
} from '@/common/types';
import CustomDropdown, {
  _CustomDropdownOption,
} from '@/dropdown/_CustomDropdown';

import moduleStyles from '@/dropdown/customDropdown.module.scss';

export interface CheckboxDropdownOption extends _CustomDropdownOption {}

export interface CheckboxDropdownProps extends AriaAttributes {
  /** CheckboxDropdown name.
   * Name of the dropdown, used as unique identifier of the dropdown's HTML element */
  name: string;
  /** CheckboxDropdown custom class name */
  className?: string;
  /** CheckboxDropdown color */
  color?: DropdownColor;
  /** CheckboxDropdown size */
  size: ComponentSizeXSToL;
  /** CheckboxDropdown disabled state */
  disabled?: boolean;
  /** CheckboxDropdown label
   * The user-facing label of the dropdown */
  labelText: string;
  /** CheckboxDropdown label style type*/
  labelType?: 'thick' | 'thin';
  /** CheckboxDropdown options */
  allOptions: CheckboxDropdownOption[];
  /** CheckboxDropdown checked options */
  checkedOptions: string[];
  /** CheckboxDropdown onChange handler */
  onChange: (args: React.ChangeEvent<HTMLInputElement>) => void;
  /** CheckboxDropdown onSelectAll handler */
  onSelectAll: (
    event:
      | React.MouseEvent<HTMLButtonElement>
      | React.MouseEvent<HTMLAnchorElement>
  ) => void;
  /** CheckboxDropdown onClearAll handler */
  onClearAll: (
    event:
      | React.MouseEvent<HTMLButtonElement>
      | React.MouseEvent<HTMLAnchorElement>
  ) => void;
}

const CheckboxDropdown: React.FunctionComponent<CheckboxDropdownProps> = ({
  name,
  className,
  labelText,
  labelType = 'thick',
  allOptions,
  checkedOptions = [],
  onChange,
  onSelectAll,
  onClearAll,
  disabled = false,
  color = dropdownColors.black,
  size = 'm',
  ...rest
}) => {
  return (
    <CustomDropdown
      name={name}
      className={className}
      labelText={labelText}
      labelType={labelType}
      color={color}
      disabled={disabled}
      size={size}
      isSomeValueSelected={checkedOptions.length > 0}
      {...rest}
    >
      <div className={moduleStyles.dropdownMenuContainer}>
        <ul>
          {allOptions.map(({value, label, isOptionDisabled}) => (
            <li key={value}>
              <Checkbox
                checked={checkedOptions.includes(value)}
                disabled={disabled || isOptionDisabled}
                onChange={onChange}
                size={size}
                name={value}
                value={value}
                label={label}
              />
            </li>
          ))}
        </ul>
        <div className={moduleStyles.bottomButtonsContainer}>
          <Button
            type="tertiary"
            color={buttonColors.purple}
            text={'Select All'}
            onClick={onSelectAll}
            size={size}
          />
          <Button
            type="tertiary"
            color={buttonColors.purple}
            text={'Clear All'}
            onClick={onClearAll}
            size={size}
          />
        </div>
      </div>
    </CustomDropdown>
  );
};

/**
 * ### Production-ready Checklist:
 * * (✔) implementation of component approved by design team;
 * * (✔) has storybook, covered with stories and documentation;
 * * (✔) has tests: test every prop, every state and every interaction that's js related;
 * * (see apps/test/unit/componentLibrary/CheckboxDropdownTest.jsx)
 * * (?) passes accessibility checks;
 *
 * ###  Status: ```Ready for dev```
 *
 * Design System: Checkbox Dropdown Component.
 * Used to render checkbox (multiple choice) dropdowns.
 */
const WrappedCheckboxDropdown = (props: CheckboxDropdownProps) => (
  <DropdownProviderWrapper>
    <CheckboxDropdown {...props} />
  </DropdownProviderWrapper>
);

export default memo(WrappedCheckboxDropdown);
