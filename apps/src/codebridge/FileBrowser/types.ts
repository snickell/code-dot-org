import {FileId, FolderId, ProjectFile, ProjectFolder} from '@codebridge/types';

import {ProjectFileType} from '@cdo/apps/lab2/types';

export enum DragType {
  FILE,
  FOLDER,
}

export type DragDataType = {
  id: FileId | FolderId;
  type: DragType;
  parentId: FolderId;
};

export type DropdownOptionType = {
  condition: boolean;
  iconName: string;
  labelText: string;
  clickHandler: () => void;
};

export type DropDataType = {id: string};

export type downloadFileType = (fileId: FileId) => void;
export type moveFilePromptType = (fileId: FileId) => void;
export type moveFolderPromptType = (folderId: FolderId) => void;
export type newFilePromptType = (folderId?: FolderId) => void;
export type newFolderPromptType = (parentId?: FolderId) => void;
export type renameFilePromptType = (fileId: FileId) => void;
export type renameFolderPromptType = (folderId: FolderId) => void;
export type setFileType = (fileId: FileId, type: ProjectFileType) => void;

type FileBrowserRowItemType = ProjectFile | ProjectFolder;
export type FileBrowserIconComponentType = React.FunctionComponent<{
  item: FileBrowserRowItemType;
}>;
export type FileBrowserNameComponentType = React.FunctionComponent<{
  item: FileBrowserRowItemType;
}>;

export type ItemRowProps = {
  item: FileBrowserRowItemType;
  // If the pop-up menu is enabled, we will show the 3-dot menu button on hover.
  enableMenu: boolean;
  dropdownOptions: DropdownOptionType[];
  IconComponent: FileBrowserIconComponentType;
  NameComponent: FileBrowserNameComponentType;
  openFunction: (id: string) => void;
};
