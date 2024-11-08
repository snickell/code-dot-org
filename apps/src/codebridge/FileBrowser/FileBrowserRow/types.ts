import {ProjectFile, ProjectFolder} from '@codebridge/types';

export type DropdownOptionType = {
  condition: boolean;
  iconName: string;
  labelText: string;
  clickHandler: () => void;
  id?: string;
};

export type FileBrowserRowItemType = ProjectFile | ProjectFolder;
export type FileBrowserIconComponentType = React.FunctionComponent<{
  item: FileBrowserRowItemType;
}>;
export type FileBrowserNameComponentType = React.FunctionComponent<{
  item: FileBrowserRowItemType;
}>;
