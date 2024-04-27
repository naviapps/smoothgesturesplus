import { create } from 'zustand'

export type RValidGestures = {
  [first: string]: string[]
}

export type KValidGestures = {
  [mod: string]: string[]
}

export interface ValidGestures {
  [key: string]: ValidGestures | boolean
}

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
  gestures: { [gesture: string]: string }
  //
  rValidGestures: RValidGestures
  wValidGestures: string[]
  kValidGestures: KValidGestures
  validGestures: ValidGestures
  //
  updateValidGestures: () => void
  setTrailBlock: (trailBlock: boolean) => void
  closeLastBlock?: boolean
}

export const useSettingStore = create<SettingsStore>()((set, get) => ({
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
  rValidGestures: {},
  wValidGestures: [],
  kValidGestures: {
    '0000': ['a:KeyA'],
  },
  validGestures: {
    U: {
      L: {
        '': true,
      },
      R: {
        D: {
          '': true,
        },
      },
      D: {
        U: {
          '': true,
        },
        R: {
          '': true,
        },
        L: {
          '': true,
        },
      },
    },
    D: {
      R: {
        '': true,
      },
      U: {
        '': true,
      },
      L: {
        '': true,
      },
    },
    L: {
      U: {
        '': true,
      },
      D: {
        R: {
          '': true,
        },
      },
    },
    R: {
      U: {
        L: {
          D: {
            '': true,
          },
        },
      },
      D: {
        L: {
          U: {
            R: {
              '': true,
            },
          },
        },
      },
    },
  },
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
  //
  setTrailBlock: (trailBlock: boolean) => set({ trailBlock }),
  updateValidGestures: (): void => {
    console.log('updateValidGestures')
    const rValidGestures: RValidGestures = {}
    const wValidGestures: string[] = []
    const kValidGestures: KValidGestures = {}
    const validGestures: ValidGestures = {}
    Object.keys(get().gestures).forEach((g: string) => {
      if (g[0] === 'l' || g[0] === 'i' || g[0] === 's') {
        g = g.substring(1)
      }
      if (g[0] === 'r') {
        const first: string = g[1]
        if (!rValidGestures[first]) {
          rValidGestures[first] = []
        }
        const second: string = g[2]
        rValidGestures[first].push(second)
      } else if (g[0] === 'w') {
        const dir: string = g[1]
        wValidGestures.push(dir)
      } else if (g[0] === 'k') {
        const mod: string = g.substring(1, 5)
        if (!kValidGestures[mod]) {
          kValidGestures[mod] = []
        }
        kValidGestures[mod].push(g.substring(6))
      } else {
        let cur: ValidGestures = validGestures
        for (let i: number = 0; i < g.length; i += 1) {
          if (!cur[g[i]]) {
            cur[g[i]] = {}
          }
          cur = cur[g[i]] as ValidGestures
        }
        cur[''] = true
      }
    })
    set({ rValidGestures, wValidGestures, kValidGestures, validGestures })
  },
}))
