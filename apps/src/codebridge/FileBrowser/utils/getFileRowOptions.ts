import {FileId, ProjectType, ProjectFile} from '@codebridge/types';
import {
  getPossibleDestinationFoldersForFile,
  sendCodebridgeAnalyticsEvent,
} from '@codebridge/utils';
import fileDownload from 'js-file-download';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import {ProjectFileType} from '@cdo/apps/lab2/types';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';

const handleFileDownload = (file: ProjectFile, appName: string | undefined) => {
  fileDownload(file.contents, file.name);
  sendCodebridgeAnalyticsEvent(EVENTS.CODEBRIDGE_DOWNLOAD_FILE, appName);
};

type GetFileRowOptionsArgs = {
  file: ProjectFile;
  isStartMode: boolean;
  appName?: string;
  handleDeleteFile: (fileId: string) => void;
  projectFiles: ProjectType['files'];
  projectFolders: ProjectType['folders'];
  editableFileTypes: string[];
  openMoveFilePrompt: (args: {fileId: FileId}) => void;
  openRenameFilePrompt: (args: {fileId: FileId}) => void;
};

export const getFileRowOptions = ({
  file,
  isStartMode,
  appName,
  handleDeleteFile,
  projectFiles,
  projectFolders,
  editableFileTypes,
  openMoveFilePrompt,
  openRenameFilePrompt,
}: GetFileRowOptionsArgs) => {
  const isLocked = !isStartMode && file.type === ProjectFileType.LOCKED_STARTER;

  const dropdownOptions = [
    {
      condition:
        !isLocked &&
        Boolean(
          getPossibleDestinationFoldersForFile({
            file,
            projectFiles,
            projectFolders,
            isStartMode,
            validationFile: undefined,
          }).length
        ),
      iconName: 'arrow-right',
      labelText: codebridgeI18n.moveFile(),
      clickHandler: () => openMoveFilePrompt({fileId: file.id}),
    },
    {
      condition: !isLocked,
      iconName: 'pencil',
      labelText: codebridgeI18n.renameFile(),
      clickHandler: () => openRenameFilePrompt({fileId: file.id}),
    },
    {
      condition: editableFileTypes.includes(file.language),
      iconName: 'download',
      labelText: codebridgeI18n.downloadFile(),
      clickHandler: () => handleFileDownload(file, appName),
    },
    {
      condition: !isLocked,
      iconName: 'trash',
      labelText: codebridgeI18n.deleteFile(),
      clickHandler: () => handleDeleteFile(file.id),
    },
  ];
  return dropdownOptions;
};
