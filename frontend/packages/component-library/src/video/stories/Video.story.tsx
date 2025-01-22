import type {Meta, StoryObj} from '@storybook/react';
import {within, expect} from '@storybook/test';

import Video from '../index';

export default {
  title: 'DesignSystem/Video',
  component: Video,
} as Meta;
type Story = StoryObj<typeof Video>;

//
// TEMPLATE
//
export const DefaultVideo: Story = {
  args: {
    videoTitle: "What Most Schools Don't Teach",
    youTubeId: 'nKIu9yen5nc',
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const video = canvas.getByRole('figure');

    // check if video is visible
    expect(video).toBeVisible();
  },
};

export const VideoWithCaption: Story = {
  args: {
    videoTitle: "What Most Schools Don't Teach",
    youTubeId: 'nKIu9yen5nc',
    showCaption: true,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const video = canvas.getByRole('figure');

    // check if video is visible
    expect(video).toBeVisible();
  },
};

export const VideoWithFallback: Story = {
  args: {
    videoTitle: "What Most Schools Don't Teach",
    videoFallback:
      'https://videos.code.org/social/what-most-schools-dont-teach.mp4',
    youTubeId: 'nKIu9yen5nc',
    showCaption: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          'This is a video component with a fallback HTML video player. The fallback player will show up if YouTube is blocked, and a Download button will also show up. To test this block _www.youtube.com_ and _www.youtube-nocookie.com_ in the Network tab in DevTools.',
      },
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const video = canvas.getByRole('figure');
    const download = canvas.getByRole('link');

    // check if video is visible
    expect(video).toBeVisible();

    // check if download button is visible
    expect(download).toBeVisible();
  },
};

export const VideoWithCaptionAndFallback: Story = {
  args: {
    videoTitle: "What Most Schools Don't Teach",
    videoFallback:
      'https://videos.code.org/social/what-most-schools-dont-teach.mp4',
    youTubeId: 'nKIu9yen5nc',
    showCaption: true,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const video = canvas.getByRole('figure');
    const download = canvas.getByRole('link');

    // check if video is visible
    expect(video).toBeVisible();

    // check if download button is visible
    expect(download).toBeVisible();
  },
};
