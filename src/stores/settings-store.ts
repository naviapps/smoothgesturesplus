import { useStore } from 'zustand/react';
import { createStore } from 'zustand/vanilla';

import { ValidGestures } from '@/types';

export type SettingsStore = {
  holdButton: number;
  contextOnLink: boolean;
  newTabUrl: string;
  newTabRight: boolean;
  newTabLinkRight: boolean;
  trailColor: string;
  trailWidth: number;
  trailBlock: boolean;
  blacklist: string[];
  selectToLink: boolean;
  closeLastBlock: boolean;
  gestures: Record<string, string>;
  setHoldButton: (holdButton: number) => void;
  setContextOnLink: (contextOnLink: boolean) => void;
  setTrailColor: (trailColor: string) => void;
  setTrailWidth: (trailWidth: number) => void;
  setTrailBlock: (trailBlock: boolean) => void;
  setSelectToLink: (selectToLink: boolean) => void;
  validGestures: ValidGestures;
};

export const settingsStore = createStore<SettingsStore>((set) => ({
  holdButton: 2,
  contextOnLink: false,
  newTabUrl: 'chrome://newtab/',
  newTabRight: false,
  newTabLinkRight: true,
  trailColor: 'rgba(255, 0, 0, 1)',
  trailWidth: 2,
  trailBlock: false,
  blacklist: [],
  selectToLink: true,
  closeLastBlock: false,
  gestures: {
    U: 'new-tab',
    lU: 'new-tab-link',
    D: 'toggle-pin',
    L: 'page-back',
    rRL: 'page-back',
    R: 'page-forward',
    rLR: 'page-forward',
    UL: 'prev-tab',
    UR: 'next-tab',
    wU: 'goto-top',
    wD: 'goto-bottom',
    DR: 'close-tab',
    LU: 'undo-close',
    DU: 'clone-tab',
    lDU: 'new-tab-back',
    UD: 'reload-tab',
    UDU: 'reload-tab-full',
    URD: 'view-source',
    UDR: 'split-tabs',
    UDL: 'merge-tabs',
    LDR: 'show-cookies',
    RULD: 'fullscreen-window',
    DL: 'minimize-window',
    RU: 'maximize-window',
    RDLUR: 'options',
  },
  setHoldButton: (holdButton) => set({ holdButton }),
  setContextOnLink: (contextOnLink) => set({ contextOnLink }),
  setTrailColor: (trailColor) => set({ trailColor }),
  setTrailWidth: (trailWidth) => set({ trailWidth }),
  setTrailBlock: (trailBlock) => set({ trailBlock }),
  setSelectToLink: (selectToLink) => set({ selectToLink }),
  //
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
    D: {
      U: {},
      R: {},
      L: {},
    },
    L: {
      U: {},
      D: {
        R: {},
      },
    },
    r: {
      R: {
        L: {},
      },
      L: {
        R: {},
      },
    },
    w: {
      U: {},
      D: {},
    },
  },
}));

export const useSettings = () => useStore(settingsStore);
