import { SmoothGestures, SmoothGesturesSettings } from './smoothGestures.ts'

const defaults = {
  'Smooth Gestures': {
    settings: {
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
    },
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
  },
}

'update_url' in chrome.runtime.getManifest() &&
  (console.log = console.error = () => {})
let settings: SmoothGesturesSettings = {}
chrome.storage.local.get(null, (items) => {
  settings = items
})
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local') {
    for (const key in changes) {
      settings[key] = changes[key].newValue
    }
  }
})

const defaultSettings: SmoothGesturesSettings = {
  gestures: defaults['Smooth Gestures'].gestures,
  ...defaults['Smooth Gestures'].settings,
}

const draw = new SmoothGestures()
draw.settings = defaultSettings
draw.drawGesture('A', 1, 1, 1)

export type SmoothGesturesDir = 'U' | 'R' | 'D' | 'L' | '1' | '3' | '7' | '9'
export type SmoothGesturesRocker = 'L' | 'M' | 'R'
export type SmoothGesturesWheelDir = 'U' | 'D'

export type SmoothGesturesDirObject = {
  [dir: string]: SmoothGesturesDirObject
}

export interface SmoothGesturesValidGestures {
  k: {
    [mod: string]: string[]
  }
  r: {
    [first in SmoothGesturesRocker]: {
      [second in SmoothGesturesRocker]: boolean
    }
  }
  w: {
    [dir in SmoothGesturesWheelDir]: boolean
  }
  U?: SmoothGesturesDirObject
  R?: SmoothGesturesDirObject
  D?: SmoothGesturesDirObject
  L?: SmoothGesturesDirObject
  '1'?: SmoothGesturesDirObject
  '3'?: SmoothGesturesDirObject
  '7'?: SmoothGesturesDirObject
  '9'?: SmoothGesturesDirObject
}

const updateValidGestures = (): void => {
  const validGestures: SmoothGesturesValidGestures = {
    k: {},
    r: {},
    w: {},
  }
  for (let g in s.gestures) {
    if (g[0] === 'l' || g[0] === 'i' || g[0] === 's') {
      g = g.substring(1)
    }
    if (g[0] === 'k') {
      const mod = g.substring(1, 5)
      if (validGestures['k'][mod]) {
        validGestures['k'][mod] = []
      }
      validGestures['k'][mod].push(g.substring(6))
    } else if (g[0] === 'w') {
      let cur = validGestures.r
      for (let i = 1; i < g.length; i++) {
        if (!cur[g[i]]) {
          cur[g[i]] = {}
        }
        cur = cur[g[i]]
      }
      cur[''] = true
    } else {
      let cur = validGestures
      for (let i = 0; i < g.length; i++) {
        if (!cur[g[i]]) {
          cur[g[i]] = {}
        }
        cur = cur[g[i]]
      }
      cur[''] = true
    }
  }
  c({ validGestures: validGestures })
}
