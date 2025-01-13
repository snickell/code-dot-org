// Creates a definition for the Divider component to be used in Contentful Studio
import {ComponentDefinition} from '@contentful/experiences-sdk-react';

export const DividerContentfulComponentDefinition: ComponentDefinition = {
  id: 'divider',
  name: 'Divider',
  category: 'Custom Components',
  variables: {
    color: {
      displayName: 'Color',
      type: 'Text',
      defaultValue: 'primary',
    },
  },
};
