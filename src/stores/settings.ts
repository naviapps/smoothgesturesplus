import { create } from 'zustand'

// TODO
export type SettingsLineValue = 'U' | 'D' | 'L' | 'R' | '1' | '3' | '7' | '9'
export type SmoothGesturesLineObject = {
  [dir in SmoothGesturesLineValue]: SmoothGesturesLineObject
}
export type SmoothGesturesRockerValue = 'L' | 'M' | 'R'
export type SmoothGesturesWheelValue = 'U' | 'D'

export interface SettingsValidGestures {
  k: {
    [mod: string]: string[]
  }
  r: {
    [first in SmoothGesturesRockerValue]?: {
      [second in SmoothGesturesRockerValue]: boolean
    }
  }
  w: {
    [dir in SmoothGesturesWheelValue]?: boolean
  }
  U?: SmoothGesturesLineObject
  D?: SmoothGesturesLineObject
  L?: SmoothGesturesLineObject
  R?: SmoothGesturesLineObject
  '1'?: SmoothGesturesLineObject
  '3'?: SmoothGesturesLineObject
  '7'?: SmoothGesturesLineObject
  '9'?: SmoothGesturesLineObject
}

export interface Settings {
  //
  gestures: { [gesture: string]: string }
  validGestures: SettingsValidGestures
  closeLastBlock: boolean
}

export const defaults: Settings = {
  //
  validGestures: {
    k: {},
    r: {},
    w: {},
  },
}

//

export type SettingsStore = {
  holdButton: number
  contextOnLink: boolean
  newTabUrl: string
  newTabRight: boolean
  newTabLinkRight: boolean
  trailColor: { r: number; g: number; b: number; a: number }
  trailWidth: number
  trailBlock: boolean
  blacklist: string[]
  selectToLink: boolean
  //
  gestures: { [gesture: string]: string }
}

export const useSettingStore = create<SettingsStore>(() => ({
  holdButton: 2,
  contextOnLink: false,
  newTabUrl: 'chrome://newtab/',
  newTabRight: false,
  newTabLinkRight: true,
  trailColor: { r: 255, g: 0, b: 0, a: 1 },
  trailWidth: 2,
  trailBlock: false,
  blacklist: [],
  selectToLink: true,
  //
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
}))
