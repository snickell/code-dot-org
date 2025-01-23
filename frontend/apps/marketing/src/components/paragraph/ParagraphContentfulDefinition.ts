// Creates a definition for the Paragraph component to be used in Contentful Studio
import {ComponentDefinition} from '@contentful/experiences-sdk-react';

export const ParagraphContentfulComponentDefinition: ComponentDefinition = {
  id: 'paragraph',
  name: 'Paragraph',
  category: 'Typography',
  variables: {
    semanticTag: {
      displayName: 'Semantic Tag',
      type: 'Text',
      defaultValue: 'p',
      group: 'style',
      validations: {
        in: [
          {value: 'p', displayName: 'Paragraph (p)'},
          {value: 'span', displayName: 'Span'},
          {value: 'strong', displayName: 'Strong'},
        ],
      },
    },
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
          {value: 'strong', displayName: 'Strong'},
        ],
      },
    },
    className: {
      displayName: 'Custom Class Name',
      type: 'Text',
      group: 'style',
    },
    children: {
      displayName: 'Content',
      type: 'Text',
      defaultValue: 'Paragraph',
      group: 'content',
      description: 'The text or other elements to display inside the paragraph',
    },
    id: {
      displayName: 'ID',
      type: 'Text',
      group: 'accessibility',
      description: 'Unique ID for the paragraph element, useful for targeting.',
    },
  },
};
