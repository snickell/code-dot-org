import {ProjectFile} from '@codebridge/types';
import {getFileIconNameAndStyle} from '@codebridge/utils';
import classNames from 'classnames';
import React from 'react';

import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';

import {FileBrowserIconComponentType} from '../types';

import moduleStyles from '../styles/filebrowser.module.scss';

export const FileRowIcon: FileBrowserIconComponentType = ({item}) => {
  const {iconName, iconStyle, isBrand} = getFileIconNameAndStyle(
    item as ProjectFile
  );
  const iconClassName = isBrand
    ? classNames('fa-brands', moduleStyles.rowIcon)
    : moduleStyles.rowIcon;
  return (
    <FontAwesomeV6Icon
      iconName={iconName}
      iconStyle={iconStyle}
      className={iconClassName}
    />
  );
};
