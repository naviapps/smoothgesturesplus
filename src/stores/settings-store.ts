import { isFQDN, isRgbColor } from 'validator';
import { z } from 'zod';
import { combine, createJSONStorage, persist, StateStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { useStore } from 'zustand/react';
import { createStore } from 'zustand/vanilla';

// Tabs
export enum NewTabPage {
  StartPage = 'start-page',
  Homepage = 'homepage',
  BlankPage = 'blank-page',
  SpecificPage = 'specific-page',
}

export enum NewTabPosition {
  AfterRelatedTabs = 'after-related-tabs',
  AfterActiveTab = 'after-active-tab',
  AsLastTab = 'as-last-tab',
  AsTabStackWithRelatedTab = 'as-tab-stack-with-related-tab',
}

export enum DuplicatedTabPosition {
  NextToOriginalTab = 'next-to-original-tab',
  AsLastTab = 'as-last-tab',
}

export enum CloseTabActivation {
  ActivateInRecentlyUsedOrder = 'activate-in-recently-used-order',
  ActivateLeftInTabOrder = 'activate-left-in-tab-order',
  ActivateRightInTabOrder = 'activate-right-in-tab-order',
}

// Settings
export const SettingsStateSchema = z.object({
  gestureMapping: z.record(z.string(), z.string()).default({
    U: 'new-tab',
    lU: 'open-link-in-new-tab',
    D: 'pin-unpin-tab',
    L: 'history-back',
    rRL: 'history-back',
    R: 'history-forward',
    rLR: 'history-forward',
    UL: 'previous-tab-by-order',
    UR: 'next-tab-by-order',
    //wU: 'page-up',
    //wD: 'page-down',
    wU: 'previous-tab-by-order',
    wD: 'next-tab-by-order',
    DR: 'close-tab',
    LU: 'reopen-closed-tab',
    DU: 'duplicate-selected-tabs',
    lDU: 'open-link-in-background-tab',
    UD: 'reload-page',
    UDU: 'force-page-reload',
    URD: 'view-page-source',
    RULD: 'fullscreen-mode',
    DL: 'minimize',
    RDLUR: 'options',
  }),
  lineStroke: z
    .string()
    .refine((str) => isRgbColor(str, { allowSpaces: true }))
    .default('rgb(0,0,255)'),
  lineStrokeWidth: z.number().int().min(1).max(4).default(2),
  blacklists: z.array(z.string().refine((str) => isFQDN(str))).default([]),
  // Tabs
  newTabPage: z.nativeEnum(NewTabPage).default(NewTabPage.StartPage),
  specificPage: z.string().url().optional(),
  newTabPosition: z.nativeEnum(NewTabPosition).default(NewTabPosition.AfterRelatedTabs),
  newTabFromLinkOpensInBackground: z.boolean().default(false),
  duplicateTabPosition: z
    .nativeEnum(DuplicatedTabPosition)
    .default(DuplicatedTabPosition.NextToOriginalTab),
  alwaysActivateRelatedTab: z.boolean().default(true),
  closeTabActivation: z
    .nativeEnum(CloseTabActivation)
    .default(CloseTabActivation.ActivateInRecentlyUsedOrder),
  keepWindowOpenWhenLastTabIsClosed: z.boolean().default(false),
  focusPageContentOnNewTab: z.boolean().default(false),
  // Mouse
  performGesturesWithAltKey: z.boolean().default(false),
  gestureSensitivity: z.number().int().min(5).max(100).default(20),
});

export type SettingsState = z.infer<typeof SettingsStateSchema>;

export type SettingsActions = {
  setGestureMapping: (gesture: string, action: string) => void;
  removeGestureMapping: (gesture: string) => void;
  setLineStroke: (lineStroke: string) => void;
  setLineStrokeWidth: (lineStrokeWidth: number) => void;
  addBlacklist: (blacklist: string) => void;
  removeBlacklist: (blacklist: string) => void;
  restore: (data: unknown) => void;
  reset: () => void;
  // Tabs
  setNewTabPage: (newTabPage: NewTabPage) => void;
  setSpecificPage: (specificPage: string) => void;
  setNewTabPosition: (newTabPosition: NewTabPosition) => void;
  setNewTabFromLinkOpensInBackground: (newTabFromLinkOpensInBackground: boolean) => void;
  setDuplicateTabPosition: (duplicateTabPosition: DuplicatedTabPosition) => void;
  setAlwaysActivateRelatedTab: (alwaysActivateRelatedTab: boolean) => void;
  setCloseTabActivation: (closeTabActivation: CloseTabActivation) => void;
  setKeepWindowOpenWhenLastTabIsClosed: (keepWindowOpenWhenLastTabIsClosed: boolean) => void;
  setFocusPageContentOnNewTab: (focusPageContentOnNewTab: boolean) => void;
  // Mouse
  setPerformGesturesWithAltKey: (performGesturesWithAltKey: boolean) => void;
  setGestureSensitivity: (gestureSensitivity: number) => void;
};

const initialState = SettingsStateSchema.parse({});

const storage: StateStorage = {
  getItem: async (name) => {
    const result = await browser.storage.local.get(name);
    return result[name] ?? null;
  },
  setItem: async (name, value) => {
    await browser.storage.local.set({ [name]: value });
  },
  removeItem: async (name) => {
    await browser.storage.local.remove(name);
  },
};

export const settingsStore = createStore<SettingsState & SettingsActions>()(
  persist(
    immer(
      combine(initialState, (set) => ({
        setGestureMapping: (gesture: string, action: string) =>
          set((state) => {
            state.gestureMapping[gesture] = action;
          }),
        removeGestureMapping: (gesture: string) =>
          set((state) => {
            delete state.gestureMapping[gesture];
          }),
        setLineStroke: (lineStroke: string) =>
          set((state) => {
            state.lineStroke = lineStroke;
          }),
        setLineStrokeWidth: (lineStrokeWidth: number) =>
          set((state) => {
            state.lineStrokeWidth = lineStrokeWidth;
          }),
        addBlacklist: (blacklist) =>
          set((state) => {
            if (!state.blacklists.includes(blacklist)) {
              state.blacklists.push(blacklist);
            }
          }),
        removeBlacklist: (blacklist) =>
          set((state) => {
            state.blacklists = state.blacklists.filter((b) => b !== blacklist);
          }),
        restore: (data) => {
          const parsed = SettingsStateSchema.safeParse(data);
          if (parsed.success) {
            set((state) => Object.assign(state, parsed.data));
          }
        },
        reset: () => set(() => initialState),
        // Tabs
        setNewTabPage: (newTabPage: NewTabPage) =>
          set((state) => {
            state.newTabPage = newTabPage;
          }),
        setSpecificPage: (specificPage: string) =>
          set((state) => {
            state.specificPage = specificPage;
          }),
        setNewTabPosition: (newTabPosition: NewTabPosition) =>
          set((state) => {
            state.newTabPosition = newTabPosition;
          }),
        setNewTabFromLinkOpensInBackground: (newTabFromLinkOpensInBackground: boolean) =>
          set((state) => {
            state.newTabFromLinkOpensInBackground = newTabFromLinkOpensInBackground;
          }),
        setDuplicateTabPosition: (duplicateTabPosition: DuplicatedTabPosition) =>
          set((state) => {
            state.duplicateTabPosition = duplicateTabPosition;
          }),
        setAlwaysActivateRelatedTab: (alwaysActivateRelatedTab: boolean) =>
          set((state) => {
            state.alwaysActivateRelatedTab = alwaysActivateRelatedTab;
          }),
        setCloseTabActivation: (closeTabActivation: CloseTabActivation) =>
          set((state) => {
            state.closeTabActivation = closeTabActivation;
          }),
        setKeepWindowOpenWhenLastTabIsClosed: (keepWindowOpenWhenLastTabIsClosed: boolean) =>
          set((state) => {
            state.keepWindowOpenWhenLastTabIsClosed = keepWindowOpenWhenLastTabIsClosed;
          }),
        setFocusPageContentOnNewTab: (focusPageContentOnNewTab: boolean) =>
          set((state) => {
            state.focusPageContentOnNewTab = focusPageContentOnNewTab;
          }),
        // Mouse
        setPerformGesturesWithAltKey: (performGesturesWithAltKey: boolean) =>
          set((state) => {
            state.performGesturesWithAltKey = performGesturesWithAltKey;
          }),
        setGestureSensitivity: (gestureSensitivity: number) =>
          set((state) => {
            state.gestureSensitivity = gestureSensitivity;
          }),
      })),
    ),
    {
      name: 'settings',
      storage: createJSONStorage(() => storage),
    },
  ),
);

export const useSettings = () => useStore(settingsStore);
