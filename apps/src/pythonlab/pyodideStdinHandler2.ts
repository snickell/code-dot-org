export default class PyodideStdinHandler {
  public isatty: boolean;
  public error: boolean;

  constructor() {
    this.isatty = true;
    this.error = false;
  }

  stdin() {
    const sharedBuffer = new SharedArrayBuffer(1024);
    postMessage({type: 'stdin', buffer: sharedBuffer});
    Atomics.wait(new Int32Array(sharedBuffer), 0, 0);
    return String.fromCharCode(...new Uint16Array(sharedBuffer).slice(0, 10));
  }
}
