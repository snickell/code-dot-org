import {Meta, StoryFn} from '@storybook/react';

import Divider, {DividerProps} from '../index';

export default {
  title: 'DesignSystem/Divider',
  component: Divider,
} as Meta;

//
// TEMPLATE
//
const SingleTemplate: StoryFn<DividerProps> = args => <Divider {...args} />;

const MultipleTemplate: StoryFn<{
  components: DividerProps[];
}> = args => (
  <>
    <p>
      * Margins on this screen do not represent Component's margins, and are
      only added to improve storybook view *
    </p>
    <p>Multiple Dividers:</p>
    <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
      {args.components?.map((componentArg, index) => (
        <Divider key={index} {...componentArg} />
      ))}
    </div>
  </>
);

export const DefaultDivider = SingleTemplate.bind({});
DefaultDivider.args = {
  color: 'primary',
};

export const GroupOfDividers = MultipleTemplate.bind({});
GroupOfDividers.args = {
  components: [{color: 'primary'}, {color: 'strong'}],
};
