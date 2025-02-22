import {START_SOURCES} from '@cdo/apps/lab2/constants';
import currentLocale from '@cdo/apps/util/currentLocale';
import getScriptData, {hasScriptData} from '@cdo/apps/util/getScriptData';

import {MultiFileSource, ProjectFile, ProjectFileType} from '../types';

// Partial definition of the App Options structure, only defining the
// pieces we need in this component.
export interface PartialAppOptions {
  channel: string;
  editBlocks: string;
  levelId: number;
  share: boolean;
  isEditingExemplar: boolean;
  isViewingExemplar: boolean;
  publicCaching: boolean;
}

/**
 * Fetch the ID of the current project from the App Options object
 * if currently on a standalone project level (i.e. under /projects).
 *
 * @returns channel ID if on a standalone project level, null if not.
 *
 * Note: We are trying to use app options as little as possible.
 */
export function getStandaloneProjectId(): string | undefined {
  if (hasScriptData('script[data-appoptions]')) {
    const appOptions = getScriptData('appoptions') as PartialAppOptions;
    return appOptions.channel;
  }
}

/**
 * Returns the level ID provided by App Options, if available.
 * This is specifically used in scenarios where the level ID is not provided
 * by other means (for example via header.js)
 */
export function getAppOptionsLevelId(): number | undefined {
  if (hasScriptData('script[data-appoptions]')) {
    const appOptions = getScriptData('appoptions') as PartialAppOptions;
    return appOptions.levelId;
  }
}

/**
 * Returns the edit mode provided by App Options, if available.
 * This can be used to tell if we are a levelbuilder mode (e.g. start_sources)
 */
export function getAppOptionsEditBlocks(): string | undefined {
  if (hasScriptData('script[data-appoptions]')) {
    const appOptions = getScriptData('appoptions') as PartialAppOptions;
    return appOptions.editBlocks;
  }
}

/**
 * Returns the value of isEditingExemplar provided by App Options, if available.
 * This can be used to tell if we are currently editing exemplars.
 */
export function getAppOptionsEditingExemplar(): boolean | undefined {
  if (hasScriptData('script[data-appoptions]')) {
    const appOptions = getScriptData('appoptions') as PartialAppOptions;
    return appOptions.isEditingExemplar;
  }
}

/**
 * Returns the value of isViewingExemplar provided by App Options, if available.
 * This can be used to tell if we are currently viewing exemplars.
 */
export function getAppOptionsViewingExemplar(): boolean | undefined {
  if (hasScriptData('script[data-appoptions]')) {
    const appOptions = getScriptData('appoptions') as PartialAppOptions;
    return appOptions.isViewingExemplar;
  }
}
/**
 * Returns if the lab should presented in a share/play-only view,
 * if present in App Options. Only used in standalone project levels.
 */
export function getIsShareView(): boolean | undefined {
  if (hasScriptData('script[data-appoptions]')) {
    const appOptions = getScriptData('appoptions') as PartialAppOptions;
    return appOptions.share;
  }
}

/**
 * Fetch whether the page is cached.
 *
 * @returns true if the page is cached.
 */
export function getPublicCaching(): boolean | undefined {
  if (hasScriptData('script[data-appoptions]')) {
    const appOptions = getScriptData('appoptions') as PartialAppOptions;
    return appOptions.publicCaching;
  }
}

/**
 * Given a map of {fileId: ProjectFile}, return the first file with the given name.
 * @param files - Map of {fileId: ProjectFile}
 * @param name - Name of the file to find
 * @returns The ProjectFile with the given name, or null if not found.
 */
export function getFileByName(
  files: Record<string, ProjectFile>,
  name: string
) {
  for (const fileId in files) {
    if (files[fileId].name === name) {
      return files[fileId];
    }
  }
  return null;
}

/**
 * Given a map of {fileId: ProjectFile}, return the first non-hidden, active file.
 * @param source - The MultiFileSource for a given project.
 * @returns The first non-hidden, active file, the first open file if no files are active,
 * or undefined if no files are open.
 */
export function getActiveFileForSource(source: MultiFileSource) {
  const files = Object.values(source.files);
  const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;
  // Only system support files are hidden in start mode. In non-start mode, only show starter files
  // (or files without a type, which default to starter files).
  const visibleFiles = files.filter(
    f =>
      (isStartMode && f.type !== ProjectFileType.SYSTEM_SUPPORT) ||
      !f.type ||
      f.type === ProjectFileType.STARTER ||
      f.type === ProjectFileType.LOCKED_STARTER
  );

  // Get the first active file, if no active file then the first open file,
  // or undefined if no files are open.
  return visibleFiles.find(f => f.active) || visibleFiles.find(f => f.open);
}

/**
 * Returns the value of the language cookie (eg, en-US, which is also the default if the cookie is not set).
 */
export function getCurrentLocale(): string {
  return currentLocale();
}
