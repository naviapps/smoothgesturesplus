import { Meta, StoryObj } from '@storybook/react';

import { SmoothGestures } from './smooth-gestures';

const meta: Meta<typeof SmoothGestures> = {
  title: 'Components/SmoothGestures',
  component: SmoothGestures,
  args: {
    callback: () => {},
  },
};

export default meta;

type Story = StoryObj<typeof SmoothGestures>;

export const Default: Story = {};
