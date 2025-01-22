import {BlockTypes} from '../blockTypes';
import {categoryTypeToLocalizedName} from '../toolbox';
import {Category} from '../toolbox/types';

const validToolboxCategories = Object.entries(Category).map(([key, value]) => [
  categoryTypeToLocalizedName[value],
  value,
]);

// This block is not localized because it is only available to levelbuilders in toolbox mode.
export const categoryBlock = {
  definition: {
    type: BlockTypes.CATEGORY,
    message0: 'Category %1',
    args0: [
      {
        type: 'field_dropdown',
        name: 'CATEGORY',
        options: validToolboxCategories,
      },
    ],
    inputsInline: true,
    style: 'loop_blocks',
    tooltip:
      'Blocks between category blocks will be grouped within the student toolbox.',
  },
  generator: () => '\n',
};
