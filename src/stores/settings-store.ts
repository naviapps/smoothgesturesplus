import { combine } from 'zustand/middleware';
import { useStore } from 'zustand/react';
import { createStore } from 'zustand/vanilla';

import { LineDirection, RockerDirection, ValidGestures, WheelDirection } from '@/types';
import { isLineDirection, isRockerDirection, isWheelDirection } from '@/utils';

export type SettingsState = {
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
  validGestures: ValidGestures;
};

export type SettingsActions = {
  setHoldButton: (holdButton: number) => void;
  setContextOnLink: (contextOnLink: boolean) => void;
  setNewTabUrl: (newTabUrl: string) => void;
  setNewTabRight: (newTabRight: boolean) => void;
  setNewTabLinkRight: (newTabLinkRight: boolean) => void;
  setTrailColor: (trailColor: string) => void;
  setTrailWidth: (trailWidth: number) => void;
  setTrailBlock: (trailBlock: boolean) => void;
  setBlacklist: (blacklist: string[]) => void;
  setSelectToLink: (selectToLink: boolean) => void;
  setCloseLastBlock: (closeLastBlock: boolean) => void;
  setGestures: (gestures: Record<string, string>) => void;
  updateValidGestures: () => void;
};

export type SettingsStore = SettingsState & SettingsActions;

const initialState: SettingsState = {
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
  validGestures: {},
};

export const settingsStore = createStore<SettingsStore>(
  combine(initialState, (set, get) => ({
    setHoldButton: (holdButton) => set({ holdButton }),
    setContextOnLink: (contextOnLink) => set({ contextOnLink }),
    setNewTabUrl: (newTabUrl) => set({ newTabUrl }),
    setNewTabRight: (newTabRight) => set({ newTabRight }),
    setNewTabLinkRight: (newTabLinkRight) => set({ newTabLinkRight }),
    setTrailColor: (trailColor) => set({ trailColor }),
    setTrailWidth: (trailWidth) => set({ trailWidth }),
    setTrailBlock: (trailBlock) => set({ trailBlock }),
    setBlacklist: (blacklist) => set({ blacklist }),
    setSelectToLink: (selectToLink) => set({ selectToLink }),
    setCloseLastBlock: (closeLastBlock) => set({ closeLastBlock }),
    setGestures: (gestures) => set({ gestures }),
    updateValidGestures: () => {
      const validGestures: ValidGestures = {};
      const { gestures } = get();
      Object.keys(gestures).forEach((gesture) => {
        const g = gesture.replace(/^[lis]/, '');
        if (g.startsWith('k')) {
          const mod = g.slice(1, 5);
          validGestures.k ??= {};
          validGestures.k[mod] ??= [];
          validGestures.k[mod].push(g.slice(6));
        } else if (g.startsWith('r')) {
          validGestures.r ??= {};
          let cur = validGestures.r;
          for (let i = 1; i < g.length; i += 1) {
            const dir = g[i] as RockerDirection;
            if (isRockerDirection(dir)) {
              cur[dir] ??= {};
              cur = cur[dir];
            }
          }
        } else if (g.startsWith('w')) {
          validGestures.w ??= {};
          let cur = validGestures.w;
          for (let i = 1; i < g.length; i += 1) {
            const dir = g[i] as WheelDirection;
            if (isWheelDirection(dir)) {
              cur[dir] ??= {};
              cur = cur[dir];
            }
          }
        } else {
          let cur = validGestures;
          for (let i = 0; i < g.length; i += 1) {
            const dir = g[i] as LineDirection;
            if (isLineDirection(dir)) {
              cur[dir] ??= {};
              cur = cur[dir];
            }
          }
        }
      });
      set({ validGestures });
    },
  })),
);

settingsStore.getState().updateValidGestures();

export const useSettings = () => useStore(settingsStore);
