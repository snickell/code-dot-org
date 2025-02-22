// Pythonlab view
import {Codebridge} from '@codebridge/Codebridge';
import {useSource} from '@codebridge/hooks/useSource';
import {ConfigType} from '@codebridge/types';
import {python} from '@codemirror/lang-python';
import {LanguageSupport} from '@codemirror/language';
import React, {useContext, useEffect, useState} from 'react';

import {
  sendPredictLevelReport,
  sendProgressReport,
} from '@cdo/apps/code-studio/progressRedux';
import {getCurrentLevel} from '@cdo/apps/code-studio/progressReduxSelectors';
import {TestResults} from '@cdo/apps/constants';
import {MAIN_PYTHON_FILE, START_SOURCES} from '@cdo/apps/lab2/constants';
import useLifecycleNotifier from '@cdo/apps/lab2/hooks/useLifecycleNotifier';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {ProgressManagerContext} from '@cdo/apps/lab2/progress/ProgressContainer';
import {getAppOptionsEditBlocks} from '@cdo/apps/lab2/projects/utils';
import {isPredictAnswerLocked} from '@cdo/apps/lab2/redux/predictLevelRedux';
import {MultiFileSource, ProjectSources} from '@cdo/apps/lab2/types';
import {LifecycleEvent} from '@cdo/apps/lab2/utils/LifecycleNotifier';
import {AppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {LevelStatus} from '@cdo/generated-scripts/sharedConstants';

import PythonValidationTracker from './progress/PythonValidationTracker';
import PythonValidator from './progress/PythonValidator';
import {handleRunClick, stopPythonCode} from './pyodideRunner';
import {restartPyodideIfProgramIsRunning} from './pyodideWorkerManager';

import moduleStyles from './pythonlab-view.module.scss';

const pythonlabLangMapping: {[key: string]: LanguageSupport} = {
  py: python(),
};

const defaultProject: ProjectSources = {
  source: {
    files: {
      '0': {
        id: '0',
        name: MAIN_PYTHON_FILE,
        language: 'py',
        contents: 'print("Hello world!")',
        folderId: '0',
        active: true,
        open: true,
      },
    },
    folders: {},
  },
};

const labeledGridLayouts = {
  horizontal: {
    gridLayoutRows: '1fr',
    gridLayoutColumns: '340px minmax(0, 1fr)',
    gridLayout: `
  "info-panel workspace-and-output"
  `,
  },
  vertical: {
    gridLayoutRows: '1fr',
    gridLayoutColumns: '340px minmax(0, 1fr) 400px',
    gridLayout: `
    "info-panel workspace output"
    `,
  },
};
const defaultConfig: ConfigType = {
  activeLeftNav: 'Files',
  languageMapping: pythonlabLangMapping,
  editableFileTypes: ['py', 'csv', 'txt'],
  leftNav: [
    {
      icon: 'fa-square-check',
      component: 'info-panel',
    },
    {
      icon: 'fa-file',
      component: 'Files',
    },
    {
      icon: 'fa-solid fa-magnifying-glass',
      component: 'Search',
    },
  ],
  sideBar: [
    {
      icon: 'fa-circle-question',
      label: 'Help',
      action: () => window.alert('Help is not currently implemented'),
    },
    {
      icon: 'fa-folder',
      label: 'Files',
      action: () => window.alert('You are already on the file browser'),
    },
  ],

  labeledGridLayouts,
  activeGridLayout: 'horizontal',
  showFileBrowser: true,
  validMimeTypes: ['text/'],
};

const PythonlabView: React.FunctionComponent = () => {
  const [config, setConfig] = useState<ConfigType>(defaultConfig);
  const {
    source,
    setProject,
    startSources,
    projectVersion,
    validationFile,
    labConfig,
  } = useSource(defaultProject);
  const isPredictLevel = useAppSelector(
    state => state.lab.levelProperties?.predictSettings?.isPredictLevel
  );
  const predictResponse = useAppSelector(state => state.predictLevel.response);
  const predictAnswerLocked = useAppSelector(isPredictAnswerLocked);
  const progressManager = useContext(ProgressManagerContext);
  const appName = useAppSelector(state => state.lab.levelProperties?.appName);
  const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;

  const currentLevel = useAppSelector(state => getCurrentLevel(state));

  useEffect(() => {
    if (progressManager && appName === 'pythonlab') {
      progressManager.setValidator(
        new PythonValidator(PythonValidationTracker.getInstance())
      );
    }
  }, [progressManager, appName]);

  // Ensure any in-progress program is stopped when the level is switched.
  useLifecycleNotifier(
    LifecycleEvent.LevelLoadStarted,
    restartPyodideIfProgramIsRunning
  );

  const onRun = async (
    runTests: boolean,
    dispatch: AppDispatch,
    source: MultiFileSource | undefined
  ) => {
    // Flush any pending saves if we have a project manager on run. The user will likely
    // run their code before navigating away from the page, so switching pages
    // will be faster if we flush save now.
    Lab2Registry.getInstance().getProjectManager()?.flushSave();
    // We don't send the validation file to the runner if we are in start mode,
    // as we want to use the validation from the sources instead.
    await handleRunClick(
      runTests,
      dispatch,
      source,
      progressManager,
      isStartMode ? undefined : validationFile
    );
    if (
      currentLevel &&
      !isPredictLevel &&
      currentLevel.status === LevelStatus.not_tried
    ) {
      // If this is not a predict level and the current status is not tried,
      // send a level started progress report.
      dispatch(sendProgressReport(appName || '', TestResults.LEVEL_STARTED));
    }
    // Only send a predict level report if this is a predict level and the predict
    // answer was not locked.
    if (isPredictLevel && !predictAnswerLocked) {
      dispatch(
        sendPredictLevelReport({
          appType: 'pythonlab',
          predictResponse: predictResponse,
        })
      );
    }
  };

  return (
    <div className={moduleStyles.pythonlab}>
      {source && (
        <Codebridge
          source={source}
          config={config}
          setProject={setProject}
          setConfig={setConfig}
          startSources={startSources}
          onRun={onRun}
          onStop={stopPythonCode}
          projectVersion={projectVersion}
          labConfig={labConfig}
        />
      )}
    </div>
  );
};

export default PythonlabView;
