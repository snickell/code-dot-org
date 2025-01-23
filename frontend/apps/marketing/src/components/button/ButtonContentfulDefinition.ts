import {ComponentDefinition} from '@contentful/experiences-sdk-react';

export const ButtonContentfulComponentDefinition: ComponentDefinition = {
  id: 'button',
  name: 'Button',
  category: 'Custom Components',
  builtInStyles: 'cfMargin',
  variables: {
    color: {
      displayName: 'Color',
      type: 'Text',
      defaultValue: 'purple',
      group: 'style',
      validations: {
        in: [
          {value: 'purple', displayName: 'Purple'},
          {value: 'black', displayName: 'Black'},
          {value: 'white', displayName: 'White'},
        ],
      },
    },
    size: {
      displayName: 'Size',
      type: 'Text',
      defaultValue: 'm',
      group: 'style',
      validations: {
        in: [
          {value: 'm', displayName: 'Medium'},
        ],
      },
    },
    type: {
      displayName: 'Type',
      type: 'Text',
      defaultValue: 'primary',
      group: 'style',
      validations: {
        in: [
          {value: 'primary', displayName: 'Primary'},
          {value: 'secondary', displayName: 'Secondary'},
        ],
      },
    },
    text: {
      displayName: 'Text',
      type: 'Text',
      defaultValue: 'Button',
      group: 'content',
    },
    iconLeft: {
      displayName: 'Left Icon',
      type: 'Object',
      group: 'content',
      fields: {
        iconName: {type: 'Text', displayName: 'Icon Name'},
        iconStyle: {type: 'Text', displayName: 'Icon Style'},
        title: {type: 'Text', displayName: 'Title'},
      },
    },
    iconRight: {
      displayName: 'Right Icon',
      type: 'Object',
      group: 'content',
      fields: {
        iconName: {type: 'Text', displayName: 'Icon Name'},
        iconStyle: {type: 'Text', displayName: 'Icon Style'},
        title: {type: 'Text', displayName: 'Title'},
      },
    },
    useAsLink: {
      displayName: 'Use as Link',
      type: 'Boolean',
      defaultValue: true,
      group: 'behavior',
    },
    href: {
      displayName: 'Link URL',
      type: 'Text',
      defaultValue: 'code.org',
      group: 'content',
      visibility: 'useAsLink',
    },
    target: {
      displayName: 'Link Target',
      type: 'Text',
      defaultValue: '_self',
      group: 'behavior',
      visibility: 'useAsLink',
    },
    download: {
      displayName: 'Download',
      type: 'Text',
      group: 'behavior',
      visibility: 'useAsLink',
    },
    disabled: {
      displayName: 'Disabled',
      type: 'Boolean',
      defaultValue: false,
      group: 'behavior',
    },
    isPending: {
      displayName: 'Pending State',
      type: 'Boolean',
      defaultValue: false,
      group: 'behavior',
    },
    ariaLabel: {
      displayName: 'ARIA Label',
      type: 'Text',
      group: 'accessibility',
    },
    name: {
      displayName: 'Name',
      type: 'Text',
      group: 'behavior',
    },
    value: {
      displayName: 'Value',
      type: 'Text',
      group: 'behavior',
    },
    title: {
      displayName: 'Title',
      type: 'Text',
      group: 'content',
      visibility: 'useAsLink',
    },
    className: {
      displayName: 'Custom Class Name',
      type: 'Text',
      group: 'style',
    },
  },
};
