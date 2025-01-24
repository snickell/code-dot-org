// Creates a definition for the Paragraph component to be used in Contentful Studio
import {ComponentDefinition} from '@contentful/experiences-sdk-react';

export const ParagraphContentfulComponentDefinition: ComponentDefinition = {
  id: 'paragraph',
  name: 'Paragraph',
  category: 'Typography',
  variables: {
    visualAppearance: {
      displayName: 'Visual Appearance',
      type: 'Text',
      defaultValue: 'body-one',
      group: 'style',
      validations: {
        in: [
          {value: 'body-one', displayName: 'Body One'},
          {value: 'body-two', displayName: 'Body Two'},
          {value: 'body-three', displayName: 'Body Three'},
          {value: 'body-four', displayName: 'Body Four'},
        ],
      },
    },
    children: {
      displayName: 'Content',
      type: 'Text',
      defaultValue: 'Paragraph',
      group: 'content',
      description: 'The text or other elements to display inside the paragraph',
    },
    isStrong: {
      displayName: 'Is Strong Paragraph',
      type: 'Boolean',
      defaultValue: false,
      group: 'style',
    },
  },
};
