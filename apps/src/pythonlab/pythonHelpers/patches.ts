import {HOME_FOLDER, SERVICE_WORKER_PATH} from './constants';

export const MATPLOTLIB_IMG_TAG = 'MATPLOTLIB_SHOW_IMG';

export const TEARDOWN_CODE = `from pythonlab_setup import teardown_pythonlab
teardown_pythonlab('/${HOME_FOLDER}')
`;

export const SETUP_CODE = `from pythonlab_setup import setup_pythonlab
setup_pythonlab('${MATPLOTLIB_IMG_TAG}')
`;

export const patchInputCode = (id: string) => `
import sys, builtins
import pythonlab_input
__prompt_str__ = ""
def get_input(prompt=""):
    global __prompt_str__
    __prompt_str__ = prompt
    print(prompt)
    s = pythonlab_input.getInput("${id}", prompt)
    print()
    return s
builtins.input = get_input
sys.stdin.readline = lambda: pythonlab_input.getInput("${id}", __prompt_str__)
`;

export const pythonlabInputModule = {
  getInput: (id: string, prompt: string) => {
    const request = new XMLHttpRequest();
    // Synchronous request to be intercepted by service worker
    console.log('opening request');
    request.open(
      'GET',
      `${SERVICE_WORKER_PATH}?id=${id}&prompt=${encodeURIComponent(prompt)}`,
      false
    );
    request.send(null);
    return request.responseText;
  },
};
