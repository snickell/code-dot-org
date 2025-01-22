import {BlockTypes} from '../blockTypes';
import {categoryTypeToLocalizedName, dynamicCategoryLabels} from '../toolbox';
import {Category} from '../toolbox/types';

const validStaticCategories = Object.entries(Category)
  .filter(
    ([key, value]) =>
      // Functions and Variables are handled by dynamic categories
      value !== Category.Functions && value !== Category.Variables
  )
  .map(([key, value]) => [categoryTypeToLocalizedName[value], value]);

const validDynamicCategories = Object.entries(dynamicCategoryLabels).map(
  ([key, value]) => [key, value]
);

/**
 * Represents a dynamic category block definition for Blockly.
 * This block allows users to select a category from a dropdown menu.
 */
export const staticCategoryBlock = {
  definition: {
    type: BlockTypes.CATEGORY,
    message0: 'Category %1',
    args0: [
      {
        type: 'field_dropdown',
        name: 'CATEGORY',
        options: validStaticCategories,
      },
    ],
    inputsInline: true,
    style: 'loop_blocks',
    tooltip:
      'Blocks between category blocks will be grouped within the student toolbox.',
  },
  generator: () => '\n',
};

/**
 * Represents a dynamic category block definition for Blockly. This block allows
 * levelbuilders to create auto-populated Functions or Variables categories.
 */
export const dynamicCategoryBlock = {
  definition: {
    type: BlockTypes.CUSTOM_CATEGORY,
    message0: 'Auto-populated Category %1',
    args0: [
      {
        type: 'field_dropdown',
        name: 'CUSTOM',
        options: validDynamicCategories,
      },
    ],
    inputsInline: true,
    style: 'loop_blocks',
    tooltip:
      'Creates an auto-populated category. Cannot include other static blocks.',
  },
  generator: () => '\n',
};
