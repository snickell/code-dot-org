// Creates a definition for the Typography component to be used in Contentful Studio
import {ComponentDefinition} from '@contentful/experiences-sdk-react';

export const HeadingContentfulComponentDefinition: ComponentDefinition = {
  id: 'heading',
  name: 'Heading',
  category: 'Custom Components',
  variables: {
    semanticTag: {
      displayName: 'Semantic Tag',
      type: 'Text',
      defaultValue: 'h1',
      group: 'style',
      validations: {
        in: [
          {value: 'h1', displayName: 'H1'},
          {value: 'h2', displayName: 'H2'},
          {value: 'h3', displayName: 'H3'},
          {value: 'h4', displayName: 'H4'},
          {value: 'h5', displayName: 'H5'},
          {value: 'h6', displayName: 'H6'},
          {value: 'p', displayName: 'Paragraph'},
          {value: 'span', displayName: 'Span'},
        ],
      },
    },
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
    className: {
      displayName: 'Custom Class Name',
      type: 'Text',
      group: 'style',
    },
    children: {
      displayName: 'Content',
      type: 'Text',
      defaultValue: 'Heading',
      group: 'content',
      required: true,
    },
    id: {
      displayName: 'ID',
      type: 'Text',
      group: 'accessibility',
    },
  },
};
