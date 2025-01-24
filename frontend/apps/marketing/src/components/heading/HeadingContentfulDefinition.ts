// Creates a definition for the Typography component to be used in Contentful Studio
import {ComponentDefinition} from '@contentful/experiences-sdk-react';

export const HeadingContentfulComponentDefinition: ComponentDefinition = {
  id: 'heading',
  name: 'Heading',
  category: 'Typography',
  variables: {
    visualAppearance: {
      displayName: 'Visual Appearance',
      type: 'Text',
      defaultValue: 'heading-xxl',
      group: 'style',
      validations: {
        in: [
          {value: 'heading-xxl', displayName: 'Heading 1'},
          {value: 'heading-xl', displayName: 'Heading 2'},
          {value: 'heading-lg', displayName: 'Heading 3'},
          {value: 'heading-md', displayName: 'Heading 4'},
          {value: 'heading-sm', displayName: 'Heading 5'},
          {value: 'heading-xs', displayName: 'Heading 6'},
        ],
      },
    },
    children: {
      displayName: 'Content',
      type: 'Text',
      defaultValue: 'Heading',
      group: 'content',
      required: true,
    },
  },
};
