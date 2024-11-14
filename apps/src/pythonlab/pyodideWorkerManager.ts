import {
  appendOutputImage,
  appendSystemMessage,
  appendSystemOutMessage,
  appendErrorMessage,
  appendSystemError,
} from '@codebridge/redux/consoleRedux';

import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {setAndSaveProjectSource} from '@cdo/apps/lab2/redux/lab2ProjectRedux';
import {setLoadedCodeEnvironment} from '@cdo/apps/lab2/redux/systemRedux';
import {MultiFileSource, ProjectFile} from '@cdo/apps/lab2/types';
import {getStore} from '@cdo/apps/redux';

import {parseErrorMessage} from './pythonHelpers/messageHelpers';
import {MATPLOTLIB_IMG_TAG} from './pythonHelpers/patches';
import {PyodideMessage} from './types';

let callbacks: {[key: number]: (event: PyodideMessage) => void} = {};
let inputServiceWorker: ServiceWorker | undefined;
let lastInputId = -1;

const setUpPyodideWorker = () => {
  // @ts-expect-error because TypeScript does not like this syntax.
  const worker = new Worker(new URL('./pyodideWebWorker.ts', import.meta.url));

  callbacks = {};

  worker.onmessage = async event => {
    const {type, id, message} = event.data as PyodideMessage;
    const onSuccess = callbacks[id];
    switch (type) {
      case 'sysout':
      case 'syserr':
        // We currently treat sysout and syserr the same, but we may want to
        // change this in the future. Test output goes to syserr by default.
        if (message.startsWith(MATPLOTLIB_IMG_TAG)) {
          // This is a matplotlib image, so we need to append it to the output
          const image = message.slice(MATPLOTLIB_IMG_TAG.length + 1);
          getStore().dispatch(appendOutputImage(image));
          break;
        }
        getStore().dispatch(appendSystemOutMessage(message));
        break;
      case 'run_complete':
        getStore().dispatch(appendSystemMessage('Program completed.'));
        delete callbacks[id];
        onSuccess(event.data);
        break;
      case 'updated_source':
        getStore().dispatch(setAndSaveProjectSource({source: message}));
        break;
      case 'error':
        getStore().dispatch(appendErrorMessage(parseErrorMessage(message)));
        break;
      case 'system_error':
        getStore().dispatch(appendSystemError(message));
        Lab2Registry.getInstance()
          .getMetricsReporter()
          .logError('Python Lab System Code Error', undefined, {message});
        break;
      case 'internal_error':
        Lab2Registry.getInstance()
          .getMetricsReporter()
          .logError('Python Lab Internal Error', undefined, {message});
        break;
      case 'loading_pyodide':
        getStore().dispatch(setLoadedCodeEnvironment(false));
        break;
      case 'loaded_pyodide':
        getStore().dispatch(setLoadedCodeEnvironment(true));
        if (message && parseInt(message)) {
          Lab2Registry.getInstance()
            .getMetricsReporter()
            .reportLoadTime('PythonLab.PyodideLoadTime', parseInt(message));
        }
        break;
      default:
        console.warn(
          `Unknown message type ${type} with message ${message} from pyodideWorker.`
        );
        break;
    }

    if ('serviceWorker' in navigator) {
      try {
        const url = new URL(
          './inputServiceWorker.js',
          // @ts-expect-error because TypeScript does not like this syntax.
          import.meta.url
        );
        const registration = await navigator.serviceWorker.register(url);
        if (registration.active) {
          console.debug('Service worker active');
          inputServiceWorker = registration.active;
        }

        registration.addEventListener('updatefound', () => {
          const installingWorker = registration.installing;
          if (installingWorker) {
            console.debug('Installing new service worker');
            installingWorker.addEventListener('statechange', () => {
              if (installingWorker.state === 'installed') {
                console.debug('New service worker installed');
                inputServiceWorker = installingWorker;
              }
            });
          }
        });
      } catch (error) {
        console.error(`Registration failed with ${error}`);
      }

      navigator.serviceWorker.onmessage = event => {
        console.log(`got message in main thread with type ${event.data.type}`);
        if (event.data.type === 'CDO_PY_AWAITING_INPUT') {
          console.log('got input request in main thread');
          if (event.source instanceof ServiceWorker) {
            // Update the service worker reference, in case the service worker is different to the one we registered
            inputServiceWorker = event.source;
          }
          lastInputId = event.data.id;
          // TODO: get input from the user here
          // setWorkerAwaitingInputIds(prev => new Set(prev).add(event.data.id));
          // setWorkerAwaitingInputPrompt(prev => {
          //   const next = new Map(prev);
          //   next.set(event.data.id, event.data.prompt);
          //   return next;
          // });
        }
      };
    } else {
      console.error('Service workers not supported');
    }
  };

  return worker;
};

let pyodideWorker = setUpPyodideWorker();

const asyncRun = (() => {
  let id = 0; // identify a Promise
  return (
    script: string,
    source: MultiFileSource,
    validationFile?: ProjectFile
  ) => {
    // the id could be generated more carefully
    id = (id + 1) % Number.MAX_SAFE_INTEGER;
    return new Promise<PyodideMessage>(onSuccess => {
      callbacks[id] = onSuccess;
      const messageData = {
        python: script,
        id,
        source,
        validationFile,
      };
      pyodideWorker.postMessage(messageData);
    });
  };
})();

const restartPyodideIfProgramIsRunning = () => {
  // Only restart if there are pending callbacks, as that means the worker is currently
  // running a program.
  if (Object.keys(callbacks).length > 0) {
    pyodideWorker.terminate();
    pyodideWorker = setUpPyodideWorker();
    getStore().dispatch(appendSystemMessage('Program stopped.'));
    Lab2Registry.getInstance()
      .getMetricsReporter()
      .incrementCounter('PythonLab.PyodideRestarted');
  }
};

const sendInput = (value: string): void => {
  console.log('sending input?');
  // if (!workerAwaitingInputIds.has(id)) {
  //   console.error('Worker not awaiting input')
  //   return
  // }

  if (!inputServiceWorker) {
    console.error('No service worker registered');
    return;
  }

  inputServiceWorker.postMessage({
    type: 'CDO_PY_INPUT',
    value,
    id: lastInputId,
  });

  // setWorkerAwaitingInputIds(prev => {
  //   const next = new Set(prev);
  //   next.delete(id);
  //   return next;
  // });
  // setWorkerAwaitingInputPrompt(prev => {
  //   const next = new Map(prev);
  //   next.delete(id);
  //   return next;
  // });
};

export {asyncRun, restartPyodideIfProgramIsRunning, sendInput};
