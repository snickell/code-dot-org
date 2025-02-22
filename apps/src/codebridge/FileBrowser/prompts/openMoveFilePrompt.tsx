import {MoveFileFunction} from '@codebridge/codebridgeContext/types';
import {ProjectFile, FileId} from '@codebridge/types';
import {
  getFolderPath,
  getPossibleDestinationFoldersForFile,
} from '@codebridge/utils';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import {MultiFileSource} from '@cdo/apps/lab2/types';
import {
  DialogType,
  DialogControlInterface,
  extractUserInput,
} from '@cdo/apps/lab2/views/dialogs';
import {GenericDropdownProps} from '@cdo/apps/lab2/views/dialogs/GenericDropdown';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';

type OpenMoveFilePromptArgsType = {
  fileId: FileId;
  projectFiles: MultiFileSource['files'];
  projectFolders: MultiFileSource['folders'];
  dialogControl: Pick<DialogControlInterface, 'showDialog'>;
  moveFile: MoveFileFunction;
  isStartMode: boolean;
  validationFile: ProjectFile | undefined;
  sendCodebridgeAnalyticsEvent: (eventName: string) => unknown;
};

export const openMoveFilePrompt = async ({
  fileId,
  projectFiles,
  projectFolders,
  dialogControl,
  moveFile,
  isStartMode,
  validationFile,
  sendCodebridgeAnalyticsEvent,
}: OpenMoveFilePromptArgsType) => {
  const file = projectFiles[fileId];

  // iterate over all the folders in the project AND the default folder, which isn't actually in the list.
  const possibleDestinationFolders: GenericDropdownProps['items'] =
    getPossibleDestinationFoldersForFile({
      file,
      projectFiles,
      projectFolders,
      isStartMode,
      validationFile,
    })
      .map(f => ({value: f.id, text: getFolderPath(f.id, projectFolders)}))
      .sort((a, b) => a.text.localeCompare(b.text));

  if (!possibleDestinationFolders.length) {
    return;
  }

  const results = await dialogControl?.showDialog({
    type: DialogType.GenericDropdown,
    title: codebridgeI18n.moveFilePrompt(),
    selectedValue: possibleDestinationFolders[0].value,
    items: possibleDestinationFolders,
    dropdownLabel: '',
  });

  if (results.type !== 'confirm') {
    return;
  }

  const destinationFolderId = extractUserInput(results);
  moveFile(fileId, destinationFolderId);

  sendCodebridgeAnalyticsEvent(EVENTS.CODEBRIDGE_MOVE_FILE);
};
