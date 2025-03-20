import { combine } from 'zustand/middleware';
import { useStore } from 'zustand/react';
import { createStore } from 'zustand/vanilla';

import { LineDirection, RockerDirection, ValidGestures, WheelDirection } from '@/types';
import { isLineDirection, isRockerDirection, isWheelDirection } from '@/utilities';

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
    U: 'newTab',
    lU: 'newTabLink',
    D: 'togglePin',
    L: 'pageBack',
    rRL: 'pageBack',
    R: 'pageForward',
    rLR: 'pageForward',
    UL: 'previousTab',
    UR: 'nextTab',
    wU: 'gotoTop',
    wD: 'gotoBottom',
    DR: 'closeTab',
    LU: 'undoClose',
    DU: 'cloneTab',
    lDU: 'newTabBack',
    UD: 'reloadTab',
    UDU: 'reloadTabFull',
    URD: 'viewSource',
    UDR: 'splitTabs',
    UDL: 'mergeTabs',
    LDR: 'showCookies',
    RULD: 'fullscreenWindow',
    DL: 'minimizeWindow',
    RU: 'maximizeWindow',
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
      for (const gesture of Object.keys(gestures)) {
        const g = gesture.replace(/^[lis]/, '');
        if (g.startsWith('k')) {
          const module_ = g.slice(1, 5);
          validGestures.k ??= {};
          validGestures.k[module_] ??= [];
          validGestures.k[module_].push(g.slice(6));
        } else if (g.startsWith('r')) {
          validGestures.r ??= {};
          let current = validGestures.r;
          for (let index = 1; index < g.length; index += 1) {
            const direction = g[index] as RockerDirection;
            if (isRockerDirection(direction)) {
              current[direction] ??= {};
              current = current[direction];
            }
          }
        } else if (g.startsWith('w')) {
          validGestures.w ??= {};
          let current = validGestures.w;
          for (let index = 1; index < g.length; index += 1) {
            const direction = g[index] as WheelDirection;
            if (isWheelDirection(direction)) {
              current[direction] ??= {};
              current = current[direction];
            }
          }
        } else {
          let current = validGestures;
          for (const element of g) {
            const direction = element as LineDirection;
            if (isLineDirection(direction)) {
              current[direction] ??= {};
              current = current[direction];
            }
          }
        }
      }
      set({ validGestures });
    },
  })),
);

settingsStore.getState().updateValidGestures();

export const useSettings = () => useStore(settingsStore);
