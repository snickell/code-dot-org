import {Condition} from '@cdo/apps/lab2/types';

export default class MusicBlocklyConditionTracker {
  private blocklyConditions: Condition[] | undefined = undefined;

  private static _instance: MusicBlocklyConditionTracker;

  public static getInstance(): MusicBlocklyConditionTracker {
    if (MusicBlocklyConditionTracker._instance === undefined) {
      MusicBlocklyConditionTracker.create();
    }
    return MusicBlocklyConditionTracker._instance;
  }

  public static create() {
    MusicBlocklyConditionTracker._instance = new MusicBlocklyConditionTracker();
  }

  getBlocklyConditions(): Condition[] | undefined {
    return this.blocklyConditions;
  }

  setBlocklyConditions(results: Condition[]) {
    if (results) {
      this.blocklyConditions = results;
    } else {
      this.blocklyConditions = undefined;
    }
  }

  reset() {
    this.blocklyConditions = undefined;
  }
}
