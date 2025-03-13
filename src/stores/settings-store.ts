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
  updateSetting: <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => void;
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
    updateSetting: (key, value) => set({ [key]: value }),
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
