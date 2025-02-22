import {FileId, FolderId} from '@codebridge/types';

import {MultiFileSource, ProjectFileType} from '@cdo/apps/lab2/types';
export type ReplaceSourceFunction = (source: MultiFileSource) => void;

export type SaveFileFunction = (fileId: FileId, contents: string) => void;
export type CloseFileFunction = (fileId: FileId) => void;
export type SetActiveFileFunction = (fileId: FileId) => void;

export type NewFolderFunction = (arg: {
  folderName: string;
  parentId?: FolderId;
}) => void;
export type ToggleOpenFolderFunction = (folderId: FolderId) => void;
export type DeleteFolderFunction = (folderId: FolderId) => void;
export type OpenFileFunction = (fileId: FileId) => void;
export type DeleteFileFunction = (fileId: FileId) => void;
export type NewFileFunction = (arg: {
  fileName: string;
  folderId?: FolderId;
  contents?: string;
  validationFileId?: string;
}) => void;
export type RenameFileFunction = (fileId: FileId, newName: string) => void;
export type RenameFolderFunction = (folderId: string, newName: string) => void;
export type MoveFileFunction = (fileId: FileId, folderId: FolderId) => void;
export type MoveFolderFunction = (
  folderId: FolderId,
  parentId: FolderId
) => void;
export type SetFileTypeFunction = (
  fileId: FileId,
  type: ProjectFileType
) => void;
export type RearrangeFilesFunction = (fileIds: FileId[]) => void;
