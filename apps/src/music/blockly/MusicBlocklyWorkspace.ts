import * as GoogleBlockly from 'blockly/core';

import {BLOCK_TYPES, Renderers} from '@cdo/apps/blockly/constants';
import CdoDarkTheme from '@cdo/apps/blockly/themes/cdoDark';
import {ProcedureBlock, ExtendedBlock} from '@cdo/apps/blockly/types';
import {disableOrphanBlocks} from '@cdo/apps/blockly/utils';
import LabMetricsReporter from '@cdo/apps/lab2/Lab2MetricsReporter';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {getAppOptionsEditBlocks} from '@cdo/apps/lab2/projects/utils';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {ValueOf} from '@cdo/apps/types/utils';
import {nameComparator} from '@cdo/apps/util/sort';

import CustomMarshalingInterpreter from '../../lib/tools/jsinterpreter/CustomMarshalingInterpreter';
import {BlockMode, Triggers} from '../constants';
import musicI18n from '../locale';

import {BlockTypes} from './blockTypes';
import {
  FIELD_TRIGGER_START_NAME,
  TriggerStart,
  TRIGGER_FIELD,
} from './constants';
import {setUpBlocklyForMusicLab} from './setup';
import {getToolbox} from './toolbox';
import {ToolboxData} from './toolbox/types';

const experiments = require('@cdo/apps/util/experiments');

const triggerIdToEvent = (id: string) => `triggeredAtButton-${id}`;

type CompiledEvents = {[key: string]: {code: string; args?: string[]}};

/**
 * Wraps the Blockly workspace for Music Lab. Provides functions to setup the
 * workspace view, execute code, and save/load projects.
 */
export default class MusicBlocklyWorkspace {
  private static isBlocklyEnvironmentSetup = false;

  // Setup the global Blockly environment for Music Lab.
  // This should only happen once per page load.
  public static setupBlocklyEnvironment(blockMode: ValueOf<typeof BlockMode>) {
    if (this.isBlocklyEnvironmentSetup) {
      return;
    }
    setUpBlocklyForMusicLab();

    if (blockMode !== BlockMode.SIMPLE2) {
      Blockly.setInfiniteLoopTrap();
    }

    this.isBlocklyEnvironmentSetup = true;
  }

  private workspace:
    | GoogleBlockly.WorkspaceSvg
    | GoogleBlockly.Workspace
    | null;
  private container: HTMLElement | null;
  private codeHooks: {[key: string]: (...args: unknown[]) => void};
  private compiledEvents: CompiledEvents;
  private lastExecutedEvents: CompiledEvents;
  private triggerIdToStartType: {[id: string]: string};
  private headlessMode: boolean;
  private toolbox?: ToolboxData;
  private blockMode?: ValueOf<typeof BlockMode>;

  constructor(
    private readonly metricsReporter: LabMetricsReporter = Lab2Registry.getInstance().getMetricsReporter()
  ) {
    this.workspace = null;
    this.container = null;
    this.codeHooks = {};
    this.compiledEvents = {};
    this.triggerIdToStartType = {};
    this.lastExecutedEvents = {};
    this.headlessMode = false;
    this.toolbox = undefined;
    this.blockMode = undefined;
  }

  /**
   * Initialize the Blockly workspace
   * @param container HTML element to inject the workspace into
   * @param onBlockSpaceChange callback fired when any block space change events occur
   * @param isReadOnlyWorkspace is the workspace readonly
   * @param toolbox information about the toolbox
   *
   */
  init(
    container: HTMLElement,
    onBlockSpaceChange: (e: GoogleBlockly.Events.Abstract) => void,
    isReadOnlyWorkspace: boolean,
    toolbox: ToolboxData | undefined,
    isRtl: boolean,
    blockMode: ValueOf<typeof BlockMode>
  ) {
    if (this.workspace) {
      this.workspace.dispose();
    }

    this.container = container;

    this.toolbox = toolbox;
    this.blockMode = blockMode;

    const toolboxBlocks = getToolbox(blockMode, toolbox);

    // This dialog is used for naming variables, which are only present in advanced mode.
    const customSimpleDialog = function (options: {
      bodyText: string;
      promptPrefill: string;
      onCancel: (p1: string | null) => void;
    }) {
      Blockly.dialog.prompt(
        options.bodyText,
        options.promptPrefill,
        options.onCancel
      );
    };

    this.workspace = Blockly.inject(container, {
      toolbox: toolboxBlocks,
      grid: {spacing: 20, length: 0, colour: '#444', snap: true},
      theme: CdoDarkTheme,
      renderer: experiments.isEnabled('zelos')
        ? Renderers.ZELOS
        : Renderers.DEFAULT,
      // noFunctionBlockFrame is only used by our custom Blockly wrapper, so we cast this object to BlocklyOptions below
      noFunctionBlockFrame: true,
      zoom: {
        startScale: experiments.isEnabled('zelos') ? 0.9 : 1,
      },
      readOnly: isReadOnlyWorkspace,
      useBlocklyDynamicCategories: true,
      rtl: isRtl,
      editBlocks: getAppOptionsEditBlocks(),
      customSimpleDialog,
      comments: true,
      analyticsData: {
        appType: EVENTS.BLOCKLY_APP_TYPE_MUSIC,
      },
    } as GoogleBlockly.BlocklyOptions);

    this.resizeBlockly();

    this.workspace.addChangeListener(onBlockSpaceChange);

    this.headlessMode = false;
  }

  /**
   * Initialize the Blockly workspace in headless mode, with no UI.
   * This is useful for instances where code needs to only be loaded and executed.
   */
  initHeadless() {
    if (this.workspace) {
      this.workspace.dispose();
    }
    this.workspace = new GoogleBlockly.Workspace();
    this.headlessMode = true;
  }

  resizeBlockly() {
    if (this.headlessMode || !this.workspace || !this.container) {
      return;
    }

    this.container.style.width = '100%';
    this.container.style.height = '100%';
    Blockly.svgResize(this.workspace as GoogleBlockly.WorkspaceSvg);
  }

  dispose() {
    if (!this.workspace) {
      return;
    }

    this.workspace.dispose();
    this.workspace = null;
  }

  /**
   * Hide any custom fields that are showing.
   */
  hideChaff() {
    if (this.headlessMode) {
      return;
    }
    (this.workspace as GoogleBlockly.WorkspaceSvg)?.hideChaff();
  }

  /**
   * Generates executable JavaScript code for all blocks in the workspace.
   *
   * @param scope Global scope to provide the execution runtime
   * @param blockMode Current block mode, such as "simple2" or "advanced"
   */
  compileSong(scope: object, blockMode: ValueOf<typeof BlockMode>) {
    const workspace = this.workspace;
    if (!workspace) {
      this.metricsReporter.logWarning(
        'compileSong called before workspace initialized.'
      );
      return;
    }
    Blockly.getGenerator().init(workspace);

    this.compiledEvents = {};
    this.triggerIdToStartType = {};

    const topBlocks = workspace.getTopBlocks();

    // Make sure that simple2 top-level blocks only generate their code once.
    if (blockMode === BlockMode.SIMPLE2) {
      topBlocks.forEach(block => {
        if (
          block.type === BlockTypes.WHEN_RUN_SIMPLE2 ||
          block.type === BlockTypes.TRIGGERED_AT_SIMPLE2
        ) {
          (block as ExtendedBlock).skipNextBlockGeneration = true;
        }
      });
    }

    topBlocks.forEach(block => {
      if (blockMode !== BlockMode.SIMPLE2) {
        if (block.type === BlockTypes.WHEN_RUN) {
          this.compiledEvents.whenRunButton = {
            code:
              'var __context = "when_run";\n' +
              Blockly.JavaScript.workspaceToCode(workspace),
            args: ['startPosition'],
          };
        }
      } else {
        if (block.type === BlockTypes.WHEN_RUN_SIMPLE2) {
          this.compiledEvents.whenRunButton = {
            code:
              'var __context = "when_run";\n' +
              'var __functionCallsCount = 0;\n' +
              'var __loopIterationsCount = 0;\n' +
              Blockly.JavaScript.workspaceToCode(workspace),
          };
        }
      }

      if (
        (
          [
            BlockTypes.NEW_TRACK_AT_START,
            BlockTypes.NEW_TRACK_AT_MEASURE,
          ] as string[]
        ).includes(block.type)
      ) {
        if (!this.compiledEvents.tracks) {
          this.compiledEvents.tracks = {code: ''};
        }
        this.compiledEvents.tracks.code +=
          Blockly.JavaScript.blockToCode(block);
      }

      if (
        (
          [
            BlockTypes.TRIGGERED_AT,
            BlockTypes.TRIGGERED_AT_SIMPLE,
            BlockTypes.TRIGGERED_AT_SIMPLE2,
            BlockTypes.NEW_TRACK_ON_TRIGGER,
          ] as string[]
        ).includes(block.type)
      ) {
        const id = block.getFieldValue(TRIGGER_FIELD);
        let code = `var __context = "${id}";\n`;
        if (block.type === BlockTypes.TRIGGERED_AT_SIMPLE2) {
          code +=
            'var __functionCallsCount = 0;\n' +
            'var __loopIterationsCount = 0;\n';
        }
        this.compiledEvents[triggerIdToEvent(id)] = {
          code: code + Blockly.JavaScript.workspaceToCode(workspace),
          args: ['startPosition'],
        };
        // Also save the value of the trigger start field at compile time so we can
        // compute the correct start time at each invocation. For blocks without this
        // field, such as in advanced mode, the start time is immediately.
        this.triggerIdToStartType[triggerIdToEvent(id)] =
          block.getFieldValue(FIELD_TRIGGER_START_NAME) ||
          TriggerStart.IMMEDIATELY;
      }
    });

    const currentEventsJson = JSON.stringify(this.compiledEvents);
    const lastExecutedEventsJson = JSON.stringify(this.lastExecutedEvents);

    if (currentEventsJson === lastExecutedEventsJson) {
      console.log("Code hasn't changed since last execute.");
      return false;
    }

    this.codeHooks = {};

    CustomMarshalingInterpreter.evalWithEvents(
      scope,
      this.compiledEvents,
      '',
      undefined
    ).hooks.forEach(hook => {
      this.codeHooks[hook.name] = hook.func as () => void;
    });

    console.log('Compiled song.', this.compiledEvents);

    return true;
  }

  /**
   * Using JavaScript previously generated by compileSong, above, this function
   * executes that code for events that are triggered when the play button
   * is clicked (e.g. "When Run", "New Track"), as well any trigger events if
   * indicated.
   *
   * {@param triggerEvents} a list of trigger events to execute
   */
  executeCompiledSong(
    triggerEvents: {id: string; startPosition: number}[] = []
  ) {
    if (Object.keys(this.compiledEvents).length === 0) {
      this.metricsReporter.logWarning(
        'executeCompiledSong called before compileSong.'
      );
      return;
    }

    const startTime = Date.now();
    console.log('Executing compiled song.');

    if (this.codeHooks.whenRunButton) {
      this.callUserGeneratedCode(this.codeHooks.whenRunButton, [0]);
    }

    if (this.codeHooks.tracks) {
      this.callUserGeneratedCode(this.codeHooks.tracks);
    }

    triggerEvents.forEach(triggerEvent => {
      this.executeTrigger(triggerEvent.id, triggerEvent.startPosition);
    });

    this.lastExecutedEvents = this.compiledEvents;

    console.log('Execution time: ', Date.now() - startTime);
  }

  /**
   * Executes code for the specific trigger referenced by the ID. It is
   * assumed that {@link compileSong()} has already been called and all event
   * hooks have already been generated, as triggers cannot be played until
   * the song has started.
   *
   * @param id ID of the trigger
   */
  executeTrigger(id: string, startPosition: number) {
    const hook = this.codeHooks[triggerIdToEvent(id)];
    if (hook) {
      this.callUserGeneratedCode(hook, [startPosition]);
    }
  }

  /**
   * Executes code for all triggers in the workspace. Useful for assembling
   * all events that could be potentially triggered for preloading sounds.
   */
  executeAllTriggers(startPosition = 0) {
    Triggers.forEach(({id}) => {
      this.executeTrigger(id, startPosition);
    });
  }

  hasTrigger(id: string) {
    return !!this.codeHooks[triggerIdToEvent(id)];
  }

  hasAnyTriggers() {
    return Triggers.some(({id}) => this.hasTrigger(id));
  }

  /**
   * Given the exact current playback position, get the start position of the trigger,
   * adjusted based on when the trigger should play (immediately, next beat, or next measure).
   */
  getTriggerStartPosition(id: string, currentPosition: number) {
    const triggerStart = this.triggerIdToStartType[triggerIdToEvent(id)];

    if (!triggerStart) {
      console.warn('No compiled trigger with ID: ' + id);
      return;
    }

    switch (triggerStart) {
      case TriggerStart.IMMEDIATELY:
        return currentPosition;
      case TriggerStart.NEXT_BEAT:
        return Math.ceil(currentPosition * 4) / 4;
      case TriggerStart.NEXT_MEASURE:
        return Math.ceil(currentPosition);
    }
  }

  getCode() {
    if (!this.workspace) {
      this.metricsReporter.logWarning(
        'getCode called before workspace initialized.'
      );
      return {};
    }
    return Blockly.serialization.workspaces.save(this.workspace);
  }

  getAllBlocks() {
    if (!this.workspace) {
      this.metricsReporter.logWarning(
        'getAllBlocks called before workspace initialized.'
      );
      return [];
    }
    return this.workspace.getAllBlocks();
  }

  updateHighlightedBlocks(playingBlockIds: string[]) {
    if (this.headlessMode) {
      return;
    }
    if (!this.workspace) {
      this.metricsReporter.logWarning(
        'updateHighlightedBlocks called before workspace initialized.'
      );
      return;
    }
    // Clear all highlights.
    for (const block of this.workspace.getAllBlocks()) {
      (this.workspace as GoogleBlockly.WorkspaceSvg).highlightBlock(
        block.id,
        false
      );
    }
    // Highlight playing blocks.
    for (const blockId of playingBlockIds) {
      (this.workspace as GoogleBlockly.WorkspaceSvg).highlightBlock(
        blockId,
        true
      );
    }
  }

  // Given a block ID, selects that block.
  // Given undefined, unselects all blocks.
  selectBlock(blockId: string) {
    if (this.headlessMode || this.workspace === null) {
      this.metricsReporter.logWarning(
        'selectBlock called before workspace initialized.'
      );
      return;
    }

    if (blockId) {
      (this.workspace as GoogleBlockly.WorkspaceSvg)
        .getBlockById(blockId)
        ?.select();
    } else {
      (this.workspace as GoogleBlockly.WorkspaceSvg)
        .getAllBlocks()
        .forEach(block => {
          block.unselect();
        });
    }
  }

  getSelectedTriggerId(blockId: string) {
    if (!this.workspace) {
      this.metricsReporter.logWarning(
        'getSelectedTriggerId called before workspace initialized.'
      );
      return undefined;
    }
    const block = this.workspace.getBlockById(blockId);
    if (!block) {
      return undefined;
    }
    const isSelectedBlockTriggerAt =
      block.type === BlockTypes.TRIGGERED_AT_SIMPLE2;
    if (isSelectedBlockTriggerAt) {
      return block.getFieldValue(TRIGGER_FIELD);
    } else {
      return undefined;
    }
  }

  // Load the workspace with the given code.
  loadCode(code: object) {
    if (!this.workspace) {
      this.metricsReporter.logWarning(
        'loadCode called before workspace initialized.'
      );
      return;
    }
    this.workspace.clearUndo();

    // Clear the record of the last executed code so that if the new code
    // happens to match it, we actually execute it.
    this.lastExecutedEvents = {};

    // Ensure that we have an extensible object for Blockly.
    const codeCopy = JSON.parse(JSON.stringify(code));

    Blockly.serialization.workspaces.load(codeCopy, this.workspace);

    disableOrphanBlocks(this.workspace);
  }

  // For each function body in the current workspace, add a function call
  // block to the toolbox. Also add a function defintion block, if required.
  generateFunctionBlocks() {
    const blockList: GoogleBlockly.utils.toolbox.ToolboxItemInfo[] = [];

    if (this.toolbox?.addFunctionDefinition) {
      blockList.push({
        kind: 'block',
        type: BLOCK_TYPES.procedureDefinition,
        fields: {
          NAME: musicI18n.blockly_functionNamePlaceholder(),
        },
      });
    }

    const allFunctions: GoogleBlockly.serialization.procedures.State[] = [];

    (
      this.workspace?.getTopBlocks(
        this.toolbox?.addFunctionCallsSortByPosition
      ) as ProcedureBlock[]
    )
      .filter(
        // When a block is dragged from the toolbox, an insertion marker is
        // created with the same type. Insertion markers just provide a
        // visual indication of where the actual block will go. They should
        // not be counted here or we could end up with duplicate call blocks.
        block =>
          block.type === BLOCK_TYPES.procedureDefinition &&
          !block.isInsertionMarker()
      )
      .forEach(block => {
        allFunctions.push(
          Blockly.serialization.procedures.saveProcedure(
            block.getProcedureModel()
          )
        );
      });

    const compareFunction = this.toolbox?.addFunctionCallsSortByPosition
      ? () => 0
      : nameComparator;

    allFunctions.sort(compareFunction).forEach(({name, id, parameters}) => {
      blockList.push({
        kind: 'block',
        type: BLOCK_TYPES.procedureCall,
        extraState: {
          name,
          id,
          params: parameters?.map(param => param.name),
        },
      });
    });

    if (this.blockMode) {
      const existingToolbox = getToolbox(this.blockMode, this.toolbox);
      existingToolbox.contents = existingToolbox.contents.concat(blockList);
      const workspace = this.workspace as GoogleBlockly.WorkspaceSvg;
      workspace.updateToolbox(existingToolbox);

      if (workspace.RTL) {
        // When the flyout is dynamically populated, the flyout width can increase,
        // thereby overlapping start blocks in RTL. If this happens, we move the
        // blocks back to the left
        // Relates to https://github.com/google/blockly/issues/8637
        const flyout = workspace.getFlyout();
        const metricsManager = workspace.getMetricsManager();
        const flyoutWidth = flyout?.getWidth() || 0;

        if (flyoutWidth) {
          const {left: contentLeft, width: contentWidth} =
            metricsManager.getContentMetrics();
          const viewWidth = metricsManager.getViewMetrics().width;

          const contentRight = contentLeft + contentWidth;
          const expectedMargin = 20; // Add space between right-most block and flyout
          const overlapAmount = contentRight - viewWidth + expectedMargin;

          if (overlapAmount > 0) {
            workspace
              .getTopBlocks()
              .forEach(block => block.moveBy(-overlapAmount, 0));
          }
        }
      }
    }
  }

  private callUserGeneratedCode(
    fn: (...args: unknown[]) => void,
    args: unknown[] = []
  ) {
    try {
      fn.call(this, ...args);
    } catch (e) {
      this.metricsReporter.logError(
        'Error running user generated code',
        e as Error
      );
    }
  }

  undo() {
    this.undoRedo(false);
  }

  redo() {
    this.undoRedo(true);
  }

  canUndo() {
    if (!this.workspace) {
      this.metricsReporter.logWarning(
        'canUndo called before workspace initialized.'
      );
      return false;
    }
    return this.workspace.getUndoStack().length > 0;
  }

  canRedo() {
    if (!this.workspace) {
      this.metricsReporter.logWarning(
        'canRedo called before workspace initialized.'
      );
      return false;
    }
    return this.workspace.getRedoStack().length > 0;
  }

  undoRedo(redo: boolean) {
    if (!this.workspace) {
      this.metricsReporter.logWarning(
        'undoRedo called before workspace initialized.'
      );
      return;
    }
    this.workspace.undo(redo);
  }
}
