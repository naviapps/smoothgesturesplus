import { Meta, StoryObj } from '@storybook/react';

import { Gesture } from './gesture';

const meta: Meta<typeof Gesture> = {
  title: 'Components/Gesture',
  component: Gesture,
  args: {
    width: 200,
    height: 200,
  },
};

export default meta;

type Story = StoryObj<typeof Gesture>;

export const U: Story = {
  args: {
    gesture: 'U',
  },
};

export const lU: Story = {
  args: {
    gesture: 'lU',
  },
};

export const D: Story = {
  args: {
    gesture: 'D',
  },
};

export const L: Story = {
  args: {
    gesture: 'L',
  },
};

export const rRL: Story = {
  args: {
    gesture: 'rRL',
  },
};

export const R: Story = {
  args: {
    gesture: 'R',
  },
};

export const rLR: Story = {
  args: {
    gesture: 'rLR',
  },
};

export const UL: Story = {
  args: {
    gesture: 'UL',
  },
};

export const UR: Story = {
  args: {
    gesture: 'UR',
  },
};

export const wU: Story = {
  args: {
    gesture: 'wU',
  },
};

export const wD: Story = {
  args: {
    gesture: 'wD',
  },
};

export const DR: Story = {
  args: {
    gesture: 'DR',
  },
};

export const LU: Story = {
  args: {
    gesture: 'LU',
  },
};

export const DU: Story = {
  args: {
    gesture: 'DU',
  },
};

export const lDU: Story = {
  args: {
    gesture: 'lDU',
  },
};

export const UD: Story = {
  args: {
    gesture: 'UD',
  },
};

export const UDU: Story = {
  args: {
    gesture: 'UDU',
  },
};

export const URD: Story = {
  args: {
    gesture: 'URD',
  },
};

export const UDR: Story = {
  args: {
    gesture: 'UDR',
  },
};

export const UDL: Story = {
  args: {
    gesture: 'UDL',
  },
};

export const LDR: Story = {
  args: {
    gesture: 'LDR',
  },
};

export const RULD: Story = {
  args: {
    gesture: 'RULD',
  },
};

export const DL: Story = {
  args: {
    gesture: 'DL',
  },
};

export const RU: Story = {
  args: {
    gesture: 'RU',
  },
};

export const RDLUR: Story = {
  args: {
    gesture: 'RDLUR',
  },
};
