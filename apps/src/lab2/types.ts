// TODO: other channel properties mentioned in project.js:
// level, frozen, hidden, thumbnailUrl, migratedToS3, sharedWith, libraryName, libraryDescription,
// latestLibraryVersion, publishLibrary, libraryPublishedAt
//
// Do we still want/need these? Should they be on a separate type?
// If the ChannelsApi on the server doesn't care about these, they should
// live elsewhere.
// The library data should definitely live elsewhere.

import {ComponentType, LazyExoticComponent} from 'react';

import {BlockDefinition} from '@cdo/apps/blockly/types';
import {LevelPredictSettings} from '@cdo/apps/lab2/levelEditors/types';
import {Theme} from '@cdo/apps/lab2/views/ThemeWrapper';

import {lab2EntryPoints} from '../../lab2EntryPoints';

export {Theme};

/// ------ USER APP OPTIONS ------ ///

// Partial definition of the UserAppOptions structure, only defining the
// pieces we need at the moment.
export interface PartialUserAppOptions {
  isInstructor: boolean;
}

/// ------ PROJECTS ------ ///

/** Identifies a project. Corresponds to the "value" JSON column for the entry in the projects table. */
export interface Channel {
  id: string;
  name: string;
  isOwner: boolean;
  projectType: ProjectType;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  hidden?: boolean;
  thumbnailUrl?: string;
  frozen?: boolean;
  // Optional lab-specific configuration for this project.  If provided, this will be saved
  // to the Project model in the database along with the other entries in this interface,
  // inside the value field JSON.
  labConfig?: {[key: string]: {[key: string]: string}};
}

export type DefaultChannel = Pick<Channel, 'name'>;

/** A project and its corresponding sources if present, fetched together when loading a level. */
export interface ProjectAndSources {
  // When projects are loaded for the first time, sources may not be present
  sources?: ProjectSources;
  channel: Channel;
  abuseScore?: number;
}

/// ------ SOURCES ------ ///

// Represents the structure of the full project sources object (i.e. the main.json file)
export interface ProjectSources {
  // Source code can either be a string or a nested JSON object (for multi-file).
  source: string | MultiFileSource;
  // Optional lab-specific configuration for this project
  labConfig?: LabConfig;
  // Add other properties (animations, html, etc) as needed.
}

export type LabConfig = {[key: string]: {[key: string]: string}};

// We will eventually make this a union type to include other source types.
export type Source = BlocklySource | MultiFileSource;

export interface SaveSourceOptions {
  projectType?: string;
}

export interface UpdateSourceOptions extends SaveSourceOptions {
  currentVersion: string;
  replace: boolean;
  firstSaveTimestamp: string;
  tabId: string | null;
}

// -- BLOCKLY -- //

export interface BlocklySource {
  blocks: {
    languageVersion: number;
    blocks: BlocklyBlock[];
  };
  variables: BlocklyVariable[];
}

export interface BlocklyBlock {
  type: string;
  id: string;
  x: number;
  y: number;
  next: {
    block: BlocklyBlock;
  };
}

export interface BlocklyVariable {
  name: string;
  id: string;
}

// -- MULTI-FILE -- //

export type FileId = string;
export type FolderId = string;

// This structure (as well as ProjectFolder and ProjectFile) is still in flux
// and may change going forward. It should only be used for labs that are not released
// yet.
// Note that if it changes files_api.has_valid_encoding? may need to be updated to correctly validate
// the new structure.
export interface MultiFileSource {
  folders: Record<FolderId, ProjectFolder>;
  files: Record<FileId, ProjectFile>;
  openFiles?: FileId[];
}

export interface ProjectFile {
  id: FileId;
  name: string;
  language: string;
  contents: string;
  open?: boolean;
  active?: boolean;
  folderId: string;
  type?: ProjectFileType;
}

/**
 * Project file types are as follows:
 * Starter: Files that come from level start code that are editable by the user.
 * Support: Files that come from level start code that are hidden and not editable by the user.
 * Validation: The file that contain the level's validation code, which is a code file that will be
 * run by the lab. This file is hidden from users.
 * Locked Starter: Files that come from level start code that are editable by the user, but cannot be
 *  deleted or renamed.
 * System Support: Files that are used for running code and for share/remix, but are hidden from the user.
 *  For example, the serialized maze for a neighborhood level.
 */
export enum ProjectFileType {
  STARTER = 'starter',
  SUPPORT = 'support',
  VALIDATION = 'validation',
  LOCKED_STARTER = 'locked_starter',
  SYSTEM_SUPPORT = 'system_support',
}

export interface ProjectFolder {
  id: FolderId;
  name: string;
  parentId: string;
  open?: boolean;
}

/// ------ LEVELS ------ ///

/**
 * Labs may extend this type to add lab-specific properties.
 */
export interface LevelProperties {
  // Not a complete list; add properties as needed.
  id: number;
  isProjectLevel?: boolean;
  hideShareAndRemix?: boolean;
  usesProjects?: boolean;
  levelData?: LevelData;
  appName: AppName;
  longInstructions?: string;
  freePlay?: boolean;
  edit_blocks?: string;
  isK1?: boolean;
  skin?: string;
  toolboxBlocks?: string;
  startSources?: MultiFileSource;
  templateSources?: MultiFileSource;
  sharedBlocks?: BlockDefinition[];
  validations?: Validation[];
  baseAssetUrl?: string;
  // An optional URL that allows the user to skip the progression.
  skipUrl?: string;
  // Project Template level name for the level if it exists.
  projectTemplateLevelName?: string;
  // Help and Tips values
  mapReference?: string;
  referenceLinks?: string[];
  helpVideos?: VideoData[];
  // Exemplars
  exampleSolutions?: string[];
  exemplarSources?: MultiFileSource;
  // For Teachers Only value
  teacherMarkdown?: string;
  predictSettings?: LevelPredictSettings;
  submittable?: boolean;
  finishUrl?: string;
  finishDialog?: string;
  offerBrowserTts?: boolean;
  useSecondaryFinishButton?: boolean;
  // Python Lab/Codebridge specific properties
  validationFile?: ProjectFile;
  enableMicroBit?: boolean;
  miniApp?: string;
  serializedMaze?: MazeCell[][];
  startDirection?: number;
}

// Level configuration data used by project-backed labs that don't require
// reloads between levels. Labs may define more specific fields.
export interface ProjectLevelData {
  startSources: Source;
}

// The level data for a standalone_video level that doesn't require
// reloads between levels.
export interface VideoLevelData {
  src: string;
  download: string;
  thumbnail: string;
}

// Addtional fields for videos that are linked as references in the
// Help & Tips tab of Instructions.
interface VideoData extends VideoLevelData {
  name?: string;
  key?: string;
  enable_fallback?: boolean;
  autoplay?: boolean;
}

// Python Lab specific property
export interface MazeCell {
  tileType: number;
  value: number;
  assetId: number;
}

// Configuration for how a Lab should be rendered
export interface Lab2EntryPoint {
  /**
   * A lazy loaded view for the lab. This should be a lazy-loaded react
   * component using a dynamic import. See `pythonlab/entrypoint.tsx` for an
   * example.
   */
  view: LazyExoticComponent<ComponentType>;
  /**
   * Display theme for this lab. This will likely be configured by user
   * preferences eventually, but for now this is fixed for each lab. Defaults
   * to the default theme if not specified.
   */
  theme?: Theme;
}

export type LevelData = ProjectLevelData | VideoLevelData;

export type ProjectType =
  | AppName
  | StandaloneAppName
  | 'artist'
  | 'artist_k1'
  | 'frozen'
  | 'minecraft_adventurer'
  | 'minecraft_hero'
  | 'minecraft_designer'
  | 'minecraft_codebuilder'
  | 'minecraft_aquatic'
  | 'algebra_game'
  | 'starwars'
  | 'starwarsblocks_hour'
  | 'iceage'
  | 'infinity'
  | 'gumball'
  | 'playlab'
  | 'playlab_k1'
  | 'sports'
  | 'basketball';

export type AppName = keyof typeof lab2EntryPoints;

export type StandaloneAppName =
  | 'spritelab'
  | 'story'
  | 'science'
  | 'poetry_hoc'
  | 'poetry'
  | 'time_capsule'
  | 'dance';

/// ------ VALIDATIONS ------ ///

// A validation condition.
export interface Condition {
  name: string;
  value?: string | number;
}

export interface ConditionType {
  name: string;
  valueType?: 'string' | 'number';
  description: string;
}

// Validation in the level.
export interface Validation {
  conditions: Condition[];
  message: string;
  callout?: string;
  next: boolean;
  key: string;
}

/// ------ MISC ------ ///

export enum ProjectManagerStorageType {
  LOCAL = 'LOCAL',
  REMOTE = 'REMOTE',
}

export interface ExtraLinksLevelData {
  links: {[key: string]: {text: string; url: string; access_key?: string}[]};
  can_clone: boolean;
  can_delete: boolean;
  level_name: string;
  script_level_path_links: {
    script: string;
    path: string;
  }[];
  is_standalone_project: boolean;
}
export interface ExtraLinksProjectData {
  owner_info?: {storage_id: number; name: string};
  project_info?: {
    id: number;
    sources_link: string;
    is_featured_project: boolean;
    featured_status: string;
    remix_ancestry: string[];
    is_published_project: 'yes' | 'no';
    abuse_score: number;
  };
  meesage?: string;
}

export interface ProjectVersion {
  versionId: string;
  lastModified: string;
  isLatest: boolean;
}
