import classNames from 'classnames';
import {ChangeEvent, HTMLAttributes} from 'react';

import {ComponentSizeXSToL} from '@/common/types';
import FontAwesomeV6Icon, {FontAwesomeV6IconProps} from '@/fontAwesomeV6Icon';

import moduleStyles from './textfield.module.scss';

export interface TextFieldProps extends HTMLAttributes<HTMLInputElement> {
  /** TextField onChange handler*/
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  /** TextField id */
  id?: string;
  /** Specifies the type of input; see included options below. */
  inputType?: 'text' | 'email' | 'password' | 'number';
  /** The name attribute specifies the name of an input element.
     The name attribute is used to reference elements in a JavaScript,
     or to reference form data after a form is submitted.
     Note: Only form elements with a name attribute will have their values passed when submitting a form. */
  name: string;
  /** The value attribute specifies the value of an input element. */
  value?: string;
  /** TextField label */
  label?: string;
  /** TextField helper message */
  helperMessage?: string;
  /** TextField helper icon */
  helperIcon?: FontAwesomeV6IconProps;
  /** TextField placeholder */
  placeholder?: string;
  /** Is TextField readOnly */
  readOnly?: boolean;
  /** Is TextField disabled */
  disabled?: boolean;
  /** TextField error message */
  errorMessage?: string;
  /** TextField custom className */
  className?: string;
  /** TextField color */
  color?: 'black' | 'gray' | 'white';
  /** Size of TextField */
  size?: Exclude<ComponentSizeXSToL, 'xs'>;
  /** max length of TextField */
  maxLength?: number;
  /** min length of TextField */
  minLength?: number;
  /** min length of TextField */
  autoComplete?: string;
}

/**
 * ### Production-ready Checklist:
 * * (✔) implementation of component approved by design team;
 * * (✔) has storybook, covered with stories and documentation;
 * * (✔) has tests: test every prop, every state and every interaction that's js related;
 * * (see ./__tests__/TextField.test.tsx)
 * * (?) passes accessibility checks;
 *
 * ###  Status: ```Ready for dev```
 *
 * Design System: TextField Component.
 * Used to render a text field.
 */
const TextField: React.FunctionComponent<TextFieldProps> = ({
  id,
  inputType = 'text',
  label,
  onChange,
  name,
  value,
  placeholder,
  disabled = false,
  readOnly = false,
  helperMessage,
  helperIcon,
  errorMessage,
  className,
  maxLength,
  minLength,
  autoComplete,
  color = 'black',
  size = 'm',
  ...HTMLAttributes
}) => {
  return (
    <label
      className={classNames(
        moduleStyles.textField,
        moduleStyles[`textField-${color}`],
        moduleStyles[`textField-${size}`],
        className,
      )}
      aria-describedby={HTMLAttributes['aria-describedby']}
    >
      {label && <span className={moduleStyles.textFieldLabel}>{label}</span>}
      <input
        id={id}
        type={inputType}
        name={name}
        value={value}
        placeholder={placeholder}
        readOnly={readOnly}
        disabled={disabled}
        maxLength={maxLength}
        minLength={minLength}
        autoComplete={autoComplete}
        onChange={onChange}
        className={classNames({
          [moduleStyles.hasError]: errorMessage,
        })}
        {...HTMLAttributes}
        aria-disabled={disabled || HTMLAttributes['aria-disabled']}
      />
      {!errorMessage && (helperMessage || helperIcon) && (
        <div className={moduleStyles.textFieldHelperSection}>
          {helperIcon && <FontAwesomeV6Icon {...helperIcon} />}
          {helperMessage && <span>{helperMessage}</span>}
        </div>
      )}
      {errorMessage && (
        <div
          className={classNames(
            moduleStyles.textFieldHelperSection,
            moduleStyles.textFieldErrorSection,
          )}
        >
          <FontAwesomeV6Icon iconName={'circle-exclamation'} />
          <span>{errorMessage}</span>
        </div>
      )}
    </label>
  );
};

export default TextField;
