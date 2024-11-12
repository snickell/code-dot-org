import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import {DEFAULT_FOLDER_ID} from '@codebridge/constants';
import {PopUpButton} from '@codebridge/PopUpButton/PopUpButton';
import React from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';

import {
  useFileUploader,
  useFileUploadErrorCallback,
  useHandleFileUpload,
  usePrompts,
} from './hooks';

export const FileBrowserHeaderPopUpButton = () => {
  const {openNewFilePrompt, openNewFolderPrompt} = usePrompts();
  const {
    project,
    config: {validMimeTypes},
  } = useCodebridgeContext();
  const uploadErrorCallback = useFileUploadErrorCallback();
  const handleFileUpload = useHandleFileUpload(project.files);

  const {startFileUpload, FileUploaderComponent} = useFileUploader({
    callback: handleFileUpload,
    errorCallback: uploadErrorCallback,
    validMimeTypes,
  });
  return (
    <>
      <FileUploaderComponent />
      <PopUpButton
        iconName="plus"
        alignment="left"
        labelText={codebridgeI18n.manageFilesAndFolders()}
        options={[
          {
            icon: {iconName: 'plus', iconStyle: 'solid'},
            label: codebridgeI18n.newFolder(),
            onClick: () => openNewFolderPrompt({parentId: DEFAULT_FOLDER_ID}),
            value: codebridgeI18n.newFolder(),
          },
          {
            icon: {iconName: 'plus', iconStyle: 'solid'},
            label: codebridgeI18n.newFile(),
            onClick: () => openNewFilePrompt({folderId: DEFAULT_FOLDER_ID}),
            value: codebridgeI18n.newFile(),
          },
          {
            icon: {iconName: 'upload', iconStyle: 'solid'},
            label: codebridgeI18n.uploadFile(),
            onClick: startFileUpload,
            value: codebridgeI18n.uploadFile(),
          },
        ]}
      />
    </>
  );
};
