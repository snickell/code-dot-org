import {
  ObservableParameterModel,
  ObservableProcedureModel,
} from '@blockly/block-shareable-procedures';
import {FieldColour} from '@blockly/field-colour';
import * as GoogleBlockly from 'blockly/core';
import {javascriptGenerator} from 'blockly/javascript';

import BlockSvgFrame from './addons/blockSvgFrame';
import BlockSvgLimitIndicator from './addons/blockSvgLimitIndicator';
import CdoAngleHelper from './addons/cdoAngleHelper';
import CdoFieldAngleDropdown from './addons/cdoFieldAngleDropdown';
import CdoFieldAngleTextInput from './addons/cdoFieldAngleTextInput';
import CdoFieldAnimationDropdown from './addons/cdoFieldAnimationDropdown';
import CdoFieldBehaviorPicker from './addons/cdoFieldBehaviorPicker';
import {CdoFieldBitmap} from './addons/cdoFieldBitmap';
import CdoFieldButton from './addons/cdoFieldButton';
import CdoFieldFlyout from './addons/cdoFieldFlyout';
import {CdoFieldImageDropdown} from './addons/cdoFieldImageDropdown';
import CdoFieldParameter from './addons/cdoFieldParameter';
import CdoFieldToggle from './addons/cdoFieldToggle';
import CdoFieldVariable from './addons/cdoFieldVariable';
import FunctionEditor from './addons/functionEditor';
import WorkspaceSvgFrame from './addons/workspaceSvgFrame';
import {
  BLOCK_TYPES,
  BlocklyVersion,
  Themes,
  WORKSPACE_EVENTS,
} from './constants';

export interface BlockDefinition {
  category: string;
  config: BlockConfig;
  helperCode: string;
  name: string;
  pool: string;
}

export interface BlockConfig {
  args: arg[];
  blockText: string;
  color: [number, number, number];
  func: string;
  style: string;
}

export interface arg {
  customInput: string;
  name: string;
}

export interface SerializedFields {
  [key: string]: {
    id?: string;
    name?: string;
  };
}

interface AnalyticsData {
  appType: string;
  scriptName?: string;
  scriptId?: number;
  levelId?: number;
}

type GoogleBlocklyType = typeof GoogleBlockly;
// Type for the Blockly instance created and modified by googleBlocklyWrapper.
export interface BlocklyWrapperType extends GoogleBlocklyType {
  varsInGlobals: boolean;
  disableVariableEditing: boolean;
  ALIGN_CENTRE: GoogleBlockly.inputs.Align.CENTRE;
  ALIGN_LEFT: GoogleBlockly.inputs.Align.LEFT;
  ALIGN_RIGHT: GoogleBlockly.inputs.Align.RIGHT;
  inputTypes: typeof GoogleBlockly.inputs.inputTypes;
  createSvgElement: typeof GoogleBlockly.utils.dom.createSvgElement;
  analyticsData: AnalyticsData;
  showUnusedBlocks: boolean | undefined;
  BlockFieldHelper: {[fieldHelper: string]: string};
  enableParamEditing: boolean;
  selected: GoogleBlockly.BlockSvg;
  blockCountMap: Map<string, number> | undefined;
  blockLimitMap: Map<string, number> | undefined;
  readOnly: boolean;
  grayOutUndeletableBlocks: boolean;
  topLevelProcedureAutopopulate: boolean;
  isJigsaw: boolean;
  getNewCursor: (type: string) => GoogleBlockly.Cursor;
  LineCursor: typeof GoogleBlockly.BasicCursor;
  version: BlocklyVersion;
  blockly_: typeof GoogleBlockly;
  mainWorkspace: GoogleBlockly.WorkspaceSvg | undefined;
  embeddedWorkspaces: string[];
  procedureSerializer: GoogleBlockly.serialization.procedures.ProcedureSerializer<
    ObservableProcedureModel,
    ObservableParameterModel
  >;
  themes: {[key in Themes]: GoogleBlockly.Theme};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  navigationController: any; // Navigation Controller is not typed by Blockly
  BlockSpace: {
    EVENTS: typeof WORKSPACE_EVENTS;
    onMainBlockSpaceCreated: (callback: () => void) => void;
  };

  AngleHelper: typeof CdoAngleHelper;
  FieldAngleDropdown: typeof CdoFieldAngleDropdown;
  FieldAngleTextInput: typeof CdoFieldAngleTextInput;
  FieldBehaviorPicker: typeof CdoFieldBehaviorPicker;
  FieldButton: typeof CdoFieldButton;
  FieldImageDropdown: typeof CdoFieldImageDropdown;
  FieldAnimationDropdown: typeof CdoFieldAnimationDropdown;
  FieldToggle: typeof CdoFieldToggle;
  FieldFlyout: typeof CdoFieldFlyout;
  FieldBitmap: typeof CdoFieldBitmap;
  FieldColour: typeof FieldColour;
  FieldVariable: typeof CdoFieldVariable;
  FieldParameter: typeof CdoFieldParameter;
  JavaScript: JavascriptGeneratorType;
  assetUrl: (path: string) => string;
  customSimpleDialog: (config: object) => void;
  levelBlockIds: Set<string>;
  isStartMode: boolean;
  isToolboxMode: boolean;
  toolboxBlocks: GoogleBlockly.utils.toolbox.ToolboxDefinition | undefined;
  useModalFunctionEditor: boolean;
  functionEditor: FunctionEditor;
  mainBlockSpace: ExtendedWorkspaceSvg;
  hiddenDefinitionWorkspace: ExtendedWorkspace;
  // TODO: better define this type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  customBlocks: any;
  // TODO: better define this type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cdoUtils: any;
  Generator: ExtendedCodeGenerator;
  Xml: ExtendedXml;
  Procedures: ExtendedProcedures;
  BlockValueType: {[key: string]: string};
  SNAP_RADIUS: number;
  Variables: ExtendedVariables;
  hasLoadedBlocks: boolean;

  wrapReadOnlyProperty: (propertyName: string) => void;
  wrapSettableProperty: (propertyName: string) => void;
  overrideFields: (
    overrides: [string, string, GoogleBlockly.fieldRegistry.RegistrableField][]
  ) => void;
  setInfiniteLoopTrap: () => void;
  clearInfiniteLoopTrap: () => void;
  getInfiniteLoopTrap: () => string | null;
  loopHighlight: (apiName: string, blockId: string) => string;
  getWorkspaceCode: () => string;
  addChangeListener: (
    blockspace: GoogleBlockly.Workspace,
    handler: (e: GoogleBlockly.Events.Abstract) => void
  ) => void;
  removeChangeListener: (
    handler: (e: GoogleBlockly.Events.Abstract) => void,
    blockspace: GoogleBlockly.Workspace
  ) => void;
  getGenerator: () => ExtendedJavascriptGenerator;
  addEmbeddedWorkspace: (workspace: GoogleBlockly.Workspace) => void;
  isEmbeddedWorkspace: (workspace: GoogleBlockly.Workspace) => boolean;
  findEmptyContainerBlock: (
    blocks: GoogleBlockly.Block[]
  ) => GoogleBlockly.Block | null;
  createEmbeddedWorkspace: (
    container: HTMLElement,
    xml: Node,
    options: GoogleBlockly.BlocklyOptions
  ) => GoogleBlockly.WorkspaceSvg;
  setMainWorkspace: (workspace: GoogleBlockly.WorkspaceSvg) => void;
  getMainWorkspace: () => ExtendedWorkspaceSvg;
  setHiddenDefinitionWorkspace: (workspace: ExtendedWorkspace) => void;
  getHiddenDefinitionWorkspace: () => ExtendedWorkspace;
  fireUiEvent: (element: Element, eventName: string) => void;
  getFunctionEditorWorkspace: () => ExtendedWorkspaceSvg | undefined;
  clearAllStudentWorkspaces: () => void;
  getPointerBlockImageUrl: (
    block: ExtendedBlockSvg,
    pointerMetadataMap: PointerMetadataMap,
    imageSourceId: string
  ) => string;
}

export type GoogleBlocklyInstance = typeof GoogleBlockly;

// Extended types are Blockly types we have monkey patched in googleBlocklyWrapper.
// We have specific methods we rely on from CDO Blockly that we needed to continue to support,
// but Blockly does not support overriding their base classes. Therefore we create these Extended
// types and can cast to them when needed.

export interface ExtendedBlockSvg extends GoogleBlockly.BlockSvg {
  canSerializeNextConnection?: boolean;
  isVisible: () => boolean;
  isUserVisible: () => boolean;
  shouldBeGrayedOut: () => boolean;
  // imageSourceId, shortString, longString and thumbnailSize are used for sprite pointer blocks
  imageSourceId?: string;
  shortString?: string;
  longString?: string;
  thumbnailSize?: number;
  // used for function blocks
  functionalSvg_?: BlockSvgFrame;
  blockSvgLimitIndicator?: BlockSvgLimitIndicator;
  workspace: ExtendedWorkspaceSvg;
}

export interface FieldHelperOptions {
  block: GoogleBlockly.Block;
  directionTitle?: string; // Ex. 'DIR'
  direction?: string; // Ex. 'turnRight'
}

export interface FieldHelpers {
  [fieldHelper: string]: FieldHelperOptions;
}
export interface ExtendedInput extends GoogleBlockly.Input {
  addFieldHelper: (
    fieldHelper: string,
    options: FieldHelperOptions
  ) => ExtendedInput;
  setStrictCheck: (check: string | string[] | null) => GoogleBlockly.Input;
  // Blockly explicitly uses any for this type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getFieldRow: () => GoogleBlockly.Field<any>[];
  setInline: (inline: boolean) => ExtendedInput;
}
export interface ExtendedConnection extends GoogleBlockly.Connection {
  getFieldHelperOptions: (fieldHelper: string) => FieldHelperOptions;
  fieldHelpers_: FieldHelpers;
  addFieldHelper(fieldHelper: string, options: FieldHelperOptions): unknown;
}

export interface ExtendedBlock extends GoogleBlockly.Block {
  getFillPattern: () => string | undefined;
  fillPattern?: string;
  setFillPattern: (pattern: string) => void;
  interpolateMsg: (
    this: ExtendedBlock,
    msg: string,
    ...inputArgs: [...([string, string, number] | (() => void))[], number]
  ) => void;
  setStrictOutput: (isOutput: boolean, check: string | string[] | null) => void;
  // Blockly uses any for value.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setTitleValue: (newValue: any, name: string) => void;
  skipNextBlockGeneration?: boolean;
  svgPathFill: SVGElement;
}

export interface ExtendedWorkspaceSvg extends GoogleBlockly.WorkspaceSvg {
  defs: SVGElement;
  previousViewWidth: number;
  flyoutParentBlock: GoogleBlockly.Block | null;
  globalVariables: string[];
  noFunctionBlockFrame: boolean;
  events: {
    dispatchEvent: () => void;
  };
  addUnusedBlocksHelpListener: () => void;
  getAllUsedBlocks: () => GoogleBlockly.Block[];
  registerGlobalVariables: (variableList: string[]) => void;
  getVariableMap: () => ExtendedVariableMap;
  getContainer: () => ParentNode | null;
  setEnableToolbox: () => void;
  traceOn: () => void;
  isReadOnly: () => boolean;
}

export interface EditorWorkspaceSvg extends ExtendedWorkspaceSvg {
  svgFrame_: WorkspaceSvgFrame;
}

export interface ExtendedVariableMap extends GoogleBlockly.VariableMap {
  addVariables: (variableList: string[]) => void;
}

export interface ExtendedBlocklyOptions extends GoogleBlockly.BlocklyOptions {
  varsInGlobals: boolean;
  disableVariableEditing: boolean;
  assetUrl: (path: string) => string;
  customSimpleDialog: (config: object) => void;
  levelBlockIds: Set<string>;
  isBlockEditMode: boolean;
  editBlocks: string | undefined;
  topLevelProcedureAutopopulate: boolean | undefined;
  noFunctionBlockFrame: boolean;
  useModalFunctionEditor: boolean;
  useBlocklyDynamicCategories: boolean;
  grayOutUndeletableBlocks: boolean | undefined;
  disableParamEditing: boolean;
  showUnusedBlocks: boolean | undefined;
  analyticsData: AnalyticsData;
  isJigsaw: boolean;
}

export interface ExtendedWorkspace extends GoogleBlockly.Workspace {
  noFunctionBlockFrame: boolean;
}

type CodeGeneratorType = typeof GoogleBlockly.CodeGenerator;
export interface ExtendedCodeGenerator extends CodeGeneratorType {
  xmlToCode?: (name: string, domBlocks: Element) => string;
  xmlToBlocks: (name: string, xml: Element) => GoogleBlockly.Block[];
  blockSpaceToCode: (
    name: string,
    opt_typeFilter?: string | string[]
  ) => string;
  blocksToCode: (
    name: string,
    blocksToGenerate: GoogleBlockly.Block[]
  ) => string;
  prefixLines: (text: string, prefix: string) => string;
  nameDB_: GoogleBlockly.Names | undefined;
  variableDB_: GoogleBlockly.Names | undefined;
  prototype: typeof GoogleBlockly.CodeGenerator.prototype;
  translateVarName: (name: string) => string;
}

type XmlType = typeof GoogleBlockly.Xml;
export interface ExtendedXml extends XmlType {
  textToDom: (text: string) => Element;
  blockSpaceToDom: (
    workspace: GoogleBlockly.Workspace,
    opt_noId?: boolean
  ) => Element;
  domToBlockSpace: (
    workspace: GoogleBlockly.Workspace,
    xml: Element
  ) => XmlBlockConfig[];
}

// This type is likely incomplete. We should add to it if we discover
// more properties it contains.
export interface XmlBlockConfig {
  blockly_block: GoogleBlockly.Block;
  x: number;
  y: number;
}

// This type is likely incomplete. We should add to it if we discover
// more properties it contains.
export interface JsonBlockConfig {
  id?: string;
  x?: number;
  y?: number;
  movable?: boolean;
  deletable?: boolean;
  // extraState can be any object. We may be able to define this better.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extraState?: any;
  type: string;
  fields: {[key: string]: {name: string; type: string; id?: string}};
  inputs: {[key: string]: {block: JsonBlockConfig}};
  next: {block: JsonBlockConfig};
  kind: string;
}

export interface Collider {
  x: number;
  y: number;
  height: number;
  width: number;
}

type ProceduresType = typeof GoogleBlockly.Procedures;

export interface ExtendedProcedures extends ProceduresType {
  DEFINITION_BLOCK_TYPES: string[];
}

type VariablesType = typeof GoogleBlockly.Variables;
export interface ExtendedVariables extends VariablesType {
  DEFAULT_CATEGORY: string;
  getters: {[key: string]: string};
  registerGetter: (category: string, blockName: string) => void;
  allVariablesFromBlock: (block: GoogleBlockly.Block) => string[];
  getVars: (opt_category?: string) => string[];
}

export interface ProcedureBlock
  extends ExtendedBlockSvg,
    GoogleBlockly.Procedures.IProcedureBlock {
  invisible: boolean;
  userCreated: boolean;
  getTargetWorkspace_(): GoogleBlockly.Workspace;
  hasReturn_: boolean;
  renameProcedure(
    oldName: string,
    newName: string,
    userCreated?: boolean
  ): void;
  defType_: string;
  model_: GoogleBlockly.Procedures.IProcedureModel;
  paramsFromSerializedState_: string[];
  updateArgsMap_: () => void;
  eventIsCreatingThisBlockDuringPaste_: (
    event: GoogleBlockly.Events.Abstract
  ) => boolean;
  defMatches_: (defBlock: ProcedureBlock) => boolean;
  createDef_: (
    name: string,
    params?: string[]
  ) => GoogleBlockly.Procedures.IProcedureModel;
  findProcedureModel_: (
    name: string,
    params?: string[]
  ) => GoogleBlockly.Procedures.IProcedureModel;
  initBlockWithProcedureModel_: () => void;
  noBlockHasClaimedModel_: (procedureId: string) => boolean;
  setStatements_: (hasStatements: boolean) => void;
  deserialize_: (name: string, params: string[]) => void;
  createArgInputs_: (params: string[]) => void;
  updateName_: () => void;
  updateEnabled_: () => void;
  updateParameters_: () => void;
  hasStatements_: boolean;
  description?: string | null;
  // used for behavior blocks
  behaviorId?: string | null;
  prevParams_: GoogleBlockly.Procedures.IParameterModel[];
  argsMap_: Map<string, GoogleBlockly.Block>;
}

// Blockly uses {[key: string]: any} to define workspace serialization.
// We have defined this more specifically, and therefore need to cast
// to this value when getting the serialzation of a workspace.
export type WorkspaceSerialization =
  | {
      blocks: {blocks: JsonBlockConfig[]};
      procedures?: ProcedureDefinitionConfig[];
      variables?: VariableConfig[];
    }
  | Record<string, never>; // empty object

export interface ProcedureDefinitionConfig {
  id: string;
  name: string;
  // As of now we only use null. Will we ever use return types?
  returnTypes: null;
}

export interface VariableConfig {
  name: string;
  id: string;
}

export interface ProcedureBlockConfiguration {
  kind: 'block';
  type: ProcedureType;
  extraState: {
    procedureId: string;
    userCreated: boolean;
    behaviorId?: string;
  };
  fields: {
    NAME: string;
  };
}

export type ProcedureType =
  | BLOCK_TYPES.procedureDefinition
  | BLOCK_TYPES.behaviorDefinition;

export type PointerMetadataMap = {
  [blockType: string]: {
    expectedRootBlockType: string;
    imageIndex: number;
  };
};

export type BlockColor = [number, number, number];

export type JavascriptGeneratorType = typeof javascriptGenerator;
export interface ExtendedJavascriptGenerator
  extends ExtendedCodeGenerator,
    JavascriptGeneratorType {
  nameDB_: GoogleBlockly.Names | undefined;
  forBlock: Record<
    string,
    (
      block: GoogleBlockly.Block,
      generator: GoogleBlockly.CodeGenerator
    ) => string | [string, number] | null
  >;
}
