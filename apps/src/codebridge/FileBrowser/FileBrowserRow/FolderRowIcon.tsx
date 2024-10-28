import React from 'react';

import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';

import {FileBrowserIconComponentType} from '../types';

import moduleStyles from '../styles/filebrowser.module.scss';

export const FolderRowIcon: FileBrowserIconComponentType = ({item}) => {
  return (
    <FontAwesomeV6Icon
      iconName={item.open ? 'caret-down' : 'caret-right'}
      iconStyle={'solid'}
      className={moduleStyles.rowIcon}
    />
  );
};
