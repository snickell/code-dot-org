import classNames from 'classnames';
import {HTMLAttributes} from 'react';

import {
  ComponentSizeXSToL,
  DropdownFormFieldRelatedProps,
} from '@/common/types';
import FontAwesomeV6Icon, {FontAwesomeV6IconProps} from '@/fontAwesomeV6Icon';

import moduleStyles from './simpleDropdown.module.scss';

export interface SimpleDropdownProps
  extends DropdownFormFieldRelatedProps,
    HTMLAttributes<HTMLSelectElement> {
  /** SimpleDropdown items list */
  items?: {value: string; text: string}[];
  /** SimpleDropdown grouped list of items */
  itemGroups?: {label: string; groupItems: {value: string; text: string}[]}[];
  /** SimpleDropdown selected value */
  selectedValue?: string;
  /** SimpleDropdown onChange handler */
  onChange: (args: React.ChangeEvent<HTMLSelectElement>) => void;
  /** SimpleDropdown label text */
  labelText: string;
  /** SimpleDropdown dropdown text thickness */
  dropdownTextThickness?: 'thick' | 'thin';
  /** Is SimpleDropdown label visible or added via aria-label attribute */
  isLabelVisible?: boolean;
  /** SimpleDropdown name */
  name: string;
  /** SimpleDropdown id */
  id?: string;
  /** Custom class name */
  className?: string;
  /** Is SimpleDropdown disabled */
  disabled?: boolean;
  /** Is SimpleDropdown readOnly */
  readOnly?: boolean;
  /** SimpleDropdown color. Sets the color of dropdown arrow, text, label and border color.
   * White stands for 'white' dropdown that'll be rendered on dark background,
   * 'black' stands for black dropdown that'll be rendered on the white/light background. */
  color?: 'white' | 'black' | 'gray';
  /** SimpleDropdown size */
  size?: ComponentSizeXSToL;
  /** Simple Dropdown IconLeft */
  iconLeft?: FontAwesomeV6IconProps;
}

/**
 * ### Production-ready Checklist:
 * * (✔) implementation of component approved by design team;
 * * (✔) has storybook, covered with stories and documentation;
 * * (✔) has tests: test every prop, every state and every interaction that's js related;
 * * (see ./__tests__/SimpleDropdown.test.tsx)
 * * (?) passes accessibility checks;
 *
 * ###  Status: ```Ready for dev```
 *
 * Design System: SimpleDropdown Component.
 * Used to render simple SimpleDropdowns with styled select (SimpleDropdown button)
 * and browser's native select options.
 */
const SimpleDropdown: React.FunctionComponent<SimpleDropdownProps> = ({
  items = [],
  itemGroups = [],
  selectedValue,
  onChange,
  name,
  id,
  className,
  labelText,
  iconLeft,
  helperMessage,
  helperIcon,
  errorMessage,
  dropdownTextThickness = 'thick',
  isLabelVisible = true,
  disabled = false,
  readOnly = false,
  color = 'black',
  size = 'm',
  styleAsFormField = false,
  ...rest
}) => (
  <label
    className={classNames(
      moduleStyles.dropdownContainer,
      moduleStyles[`dropdownContainer-${size}`],
      moduleStyles[`dropdownContainer-${color}`],
      moduleStyles[`dropdownContainer-${dropdownTextThickness}`],
      styleAsFormField && moduleStyles.styleAsFormField,
      className,
    )}
    aria-describedby={rest['aria-describedby']}
  >
    {isLabelVisible && (
      <span className={moduleStyles.dropdownLabel}>{labelText}</span>
    )}

    <div className={moduleStyles.dropdownArrowDiv}>
      {iconLeft && (
        <FontAwesomeV6Icon
          {...iconLeft}
          className={classNames(moduleStyles.iconLeft, iconLeft.className)}
        />
      )}
      <select
        name={name}
        aria-label={isLabelVisible ? undefined : labelText}
        onChange={onChange}
        value={selectedValue}
        id={id}
        disabled={disabled || readOnly}
        className={classNames({
          [moduleStyles.hasError]: errorMessage,
          [moduleStyles.readOnly]: readOnly,
        })}
        {...rest}
      >
        {itemGroups.length > 0
          ? itemGroups.map(({label, groupItems}, index) => (
              <optgroup key={index} label={label}>
                {groupItems.map(({value, text}) => (
                  <option value={value} key={value}>
                    {text}
                  </option>
                ))}
              </optgroup>
            ))
          : items.map(({value, text}) => (
              <option value={value} key={value}>
                {text}
              </option>
            ))}
      </select>
    </div>
    {!errorMessage && (helperMessage || helperIcon) && (
      <div className={moduleStyles.helperSection}>
        {helperIcon && <FontAwesomeV6Icon {...helperIcon} />}
        {helperMessage && <span>{helperMessage}</span>}
      </div>
    )}
    {errorMessage && (
      <div
        className={classNames(
          moduleStyles.errorSection,
          moduleStyles.helperSection,
        )}
      >
        <FontAwesomeV6Icon iconName={'circle-exclamation'} />
        <span>{errorMessage}</span>
      </div>
    )}
  </label>
);

export default SimpleDropdown;
