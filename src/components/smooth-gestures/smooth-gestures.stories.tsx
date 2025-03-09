import { Meta, StoryObj } from '@storybook/react';
import browser from 'webextension-polyfill';

import { SmoothGestures } from './smooth-gestures';

const meta: Meta<typeof SmoothGestures> = {
  title: 'Components/SmoothGestures',
  component: SmoothGestures,
  args: {
    holdButton: 2,
    contextOnLink: false,
    trailColor: 'rgba(255, 0, 0, 1)',
    trailWidth: 2,
    trailBlock: false,
    selectToLink: true,
    validGestures: {
      U: {
        L: {},
        R: {
          D: {},
        },
        D: {
          U: {},
          R: {},
          L: {},
        },
      },
      D: {
        R: {},
        U: {},
        L: {},
      },
      L: {
        U: {},
        D: {
          R: {},
        },
      },
      R: {
        U: {
          L: {
            D: {},
          },
        },
        D: {
          L: {
            U: {
              R: {},
            },
          },
        },
      },
    },
    sendMessage: async () => {
      //
    },
    onMessage: {
      addListener: () => {
        //
      },
      removeListener: () => {
        //
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof SmoothGestures>;

export const Default: Story = {};
