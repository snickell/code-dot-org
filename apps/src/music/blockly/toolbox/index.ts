import * as GoogleBlockly from 'blockly/core';

import {getTypedKeys, ValueOf} from '@cdo/apps/types/utils';

import appConfig from '../../appConfig';
import {BlockMode} from '../../constants';
import musicI18n from '../../locale';
import {BlockTypes} from '../blockTypes';

import {defaultMaps} from './definitions';
import toolboxBlocks from './toolboxBlocks';
import {Category, ToolboxData} from './types';

import moduleStyles from './toolbox.module.scss';

const baseCategoryCssConfig = {
  container: moduleStyles.toolboxCategoryContainer,
  row: `${moduleStyles.toolboxRow} blocklyTreeRow`, // Used to look up category labels in UI tests
  label: moduleStyles.toolboxLabel,
};

const dynamicCategoryLabels: {
  [key in Category]?: string;
} = {
  [Category.Functions]: 'PROCEDURE',
  [Category.Variables]: 'VARIABLE',
};

export const dynamicCategories = getTypedKeys(dynamicCategoryLabels);

export const dynamicCategoryToCategoryName: {[key: string]: Category} =
  Object.fromEntries(
    Object.entries(dynamicCategoryLabels).map(([key, value]) => [
      value,
      key as Category,
    ])
  );

export const categoryTypeToLocalizedName: {[key in Category]: string} = {
  Control: musicI18n.blockly_toolboxCategoryControl(),
  Effects: musicI18n.blockly_toolboxCategoryEffects(),
  Events: musicI18n.blockly_toolboxCategoryEvents(),
  Functions: musicI18n.blockly_toolboxCategoryFunctions(),
  Logic: musicI18n.blockly_toolboxCategoryLogic(),
  Math: musicI18n.blockly_toolboxCategoryMath(),
  Play: musicI18n.blockly_toolboxCategoryPlay(),
  Simple: musicI18n.blockly_toolboxCategorySimple(),
  Tracks: musicI18n.blockly_toolboxCategoryTracks(),
  Variables: musicI18n.blockly_toolboxCategoryVariables(),
};

const localizedNameToCategoryType: {[key: string]: Category} =
  Object.fromEntries(
    Object.entries(categoryTypeToLocalizedName).map(([key, value]) => [
      value,
      key,
    ])
  ) as {[key: string]: Category};

/**
 * Generates a Music Lab Blockly toolbox for the given block mode,
 * configured by the level toolbox data if provided.
 */
export function getToolbox(
  blockMode: ValueOf<typeof BlockMode>,
  levelToolbox?: ToolboxData
) {
  const categoryBlocksMap = defaultMaps[blockMode];
  const allowList = levelToolbox?.blocks;
  const type = levelToolbox?.type;

  const toolbox: GoogleBlockly.utils.toolbox.ToolboxInfo = {
    kind: type === 'flyout' ? 'flyoutToolbox' : 'categoryToolbox',
    contents: [],
  };

  for (const category of getTypedKeys<Category>(categoryBlocksMap)) {
    // Skip if we aren't allowing anything from this category.
    if (allowList && !allowList[category]) {
      continue;
    }

    if (dynamicCategories.includes(category)) {
      // Dynamic categories are not allowed in flyout toolboxes
      if (type !== 'flyout') {
        toolbox.contents.push({
          kind: 'category',
          name: categoryTypeToLocalizedName[category],
          cssconfig: baseCategoryCssConfig,
          custom: dynamicCategoryLabels[category],
        });
      }
      continue;
    }

    const categoryContents: GoogleBlockly.utils.toolbox.ToolboxItemInfo[] = [];

    for (const blockName of categoryBlocksMap[category] || []) {
      // Skip if we aren't allowing this block.
      if (
        allowList &&
        allowList[category] &&
        !allowList[category].includes(blockName)
      ) {
        continue;
      }

      if (
        blockName === BlockTypes.PLAY_PATTERN_AI_AT_CURRENT_LOCATION_SIMPLE2 &&
        !(
          levelToolbox?.includeAi ||
          appConfig.getValue('play-pattern-ai-block') === 'true'
        )
      ) {
        continue;
      }

      categoryContents.push(toolboxBlocks[blockName]);
    }

    if (type === 'flyout') {
      toolbox.contents = toolbox.contents.concat(categoryContents);
    } else {
      toolbox.contents.push({
        kind: 'category',
        name: categoryTypeToLocalizedName[category],
        cssconfig: baseCategoryCssConfig,
        contents: categoryContents,
      });
    }
  }
  return toolbox;
}

/**
 * A toolbox category for Toolbox mode, containing a block for specifying
 * the start of a category. Only available for levelbuilders.
 */
export const toolboxModeCategory = {
  kind: 'category',
  name: 'Categories',
  cssconfig: baseCategoryCssConfig,
  contents: [{kind: 'block', type: 'category'}],
};

/**
 * Given a toolbox definition and a workspace, iterate through the categories,
 * if they exist, and add all blocks to the workspace.
 * Used for levelbuilder's toolbox mode.
 */
export function addToolboxBlocksToWorkspace(
  contents: GoogleBlockly.utils.toolbox.ToolboxItemInfo[],
  workspace: GoogleBlockly.WorkspaceSvg
) {
  contents.forEach(toolboxItem => {
    if (toolboxItem.kind === 'block') {
      // Add blocks directly to the workspace.
      Blockly.serialization.blocks.append(
        toolboxItem as GoogleBlockly.serialization.blocks.State,
        workspace
      );
    } else if (toolboxItem.kind === 'category' && 'custom' in toolboxItem) {
      // For categories with a custom value ('PROCEDURES' OR 'VARIABLES'),
      // get the category name.
      const dynamicCategoryName =
        dynamicCategoryToCategoryName[
          (toolboxItem as GoogleBlockly.utils.toolbox.DynamicCategoryInfo)
            .custom
        ];
      // Create a category block
      Blockly.serialization.blocks.append(
        {
          type: BlockTypes.CATEGORY,
          fields: {
            CATEGORY: dynamicCategoryName,
          },
        },
        workspace
      );
    } else if (toolboxItem.kind === 'category') {
      const categoryName =
        localizedNameToCategoryType[
          (toolboxItem as GoogleBlockly.utils.toolbox.StaticCategoryInfo).name
        ];
      // Create a category block
      Blockly.serialization.blocks.append(
        {
          type: BlockTypes.CATEGORY,
          fields: {
            CATEGORY: categoryName,
          },
        },
        workspace
      );
      // Recursively process the contents of the static category
      addToolboxBlocksToWorkspace(
        (toolboxItem as GoogleBlockly.utils.toolbox.StaticCategoryInfo)
          .contents,
        workspace
      );
    } else {
      console.warn('Unsupported toolbox item found:', toolboxItem);
    }
  });
}

/**
 * Creates a new category with default values. Used to convert workspace
 * blocks into a toolbox defintion in levelbuilder's toolbox mode.
 * @returns JSON representation of a new category called 'DEFAULT'.
 */
export function getNewCategory() {
  return {
    kind: 'category',
    cssconfig: baseCategoryCssConfig,
    contents: [] as GoogleBlockly.utils.toolbox.ToolboxItemInfo[],
    id: undefined,
    categorystyle: undefined,
    colour: undefined,
    hidden: undefined,
    name: 'DEFAULT',
  };
}
