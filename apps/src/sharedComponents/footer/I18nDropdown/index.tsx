import React from 'react';

import {
  SimpleDropdown,
  SimpleDropdownProps,
} from '@cdo/apps/componentLibrary/dropdown';
import currentLocale from '@cdo/apps/util/currentLocale';

import './style.scss';

interface I18nDropdownProps {
  localeUrl: string;
  selected?: string;
  options?: SimpleDropdownProps['items'];
}

const I18nDropdown: React.FC<I18nDropdownProps> = ({
  localeUrl,
  selected = '',
  options = [],
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    event.target.form?.submit();
  };

  return (
    <form
      action={localeUrl}
      method="post"
      id="localeForm"
      style={{marginBottom: '0px'}}
    >
      <input type="hidden" name="user_return_to" value={window.location.href} />
      <SimpleDropdown
        className="languageSelect"
        name="locale"
        selectedValue={selected || currentLocale()}
        onChange={handleChange}
        items={options}
        labelText="Select Language"
        isLabelVisible={false}
        size="xs"
        color="gray"
      />
    </form>
  );
};

export default I18nDropdown;
