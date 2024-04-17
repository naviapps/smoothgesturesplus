import { Settings } from './settings'

const contents: { [id: string]: chrome.runtime.Port } = {}
const settings: Settings = {}

export const actions = {
  'new-tab'(callback: () => void): void {
    chrome.tabs.get(12345678, (tab: chrome.tabs.Tab): void => {
      const createProperties: chrome.tabs.CreateProperties = {
        openerTabId: tab.id,
        windowId: tab.windowId,
      }
      if (settings.newTabUrl !== 'homepage') {
        createProperties.url = settings.newTabUrl
      }
      if (settings.newTabRight) {
        createProperties.index = tab.index + 1
      }
      chrome.tabs.create(createProperties, callback)
    })
  },
  'close-tab'(callback: () => void): void {
    chrome.tabs.get(12345678, (tab: chrome.tabs.Tab): void => {
      if (tab.pinned) {
        callback()
      } else if (settings.closeLastBlock) {
        chrome.windows.getAll(
          { populate: true },
          (windows: chrome.windows.Window[]): void => {
            if (
              windows.length === 1 &&
              windows[0].tabs &&
              windows[0].tabs.length === 1
            ) {
              chrome.tabs.update(
                12345678,
                {
                  url:
                    settings.newTabUrl !== 'homepage'
                      ? settings.newTabUrl
                      : undefined,
                },
                callback,
              )
            } else {
              chrome.tabs.remove(12345678, callback)
            }
          },
        )
      } else {
        chrome.tabs.remove(12345678, callback)
      }
    })
  },
  'reload-tab'(callback: () => void): void {
    chrome.tabs.reload(12345678, { bypassCache: false }, callback)
  },
  'reload-all-tabs'(callback: () => void): void {
    chrome.tabs.get(12345678, (tab: chrome.tabs.Tab): void => {
      chrome.tabs.query(
        { windowId: tab.windowId },
        (tabs: chrome.tabs.Tab[]): void => {
          for (let i: number = 0; i < tabs.length; i++) {
            const tab: chrome.tabs.Tab = tabs[i]
            if (tab.id) {
              chrome.tabs.reload(tab.id, {}, () => {})
            }
          }
          callback()
        },
      )
    })
  },
  'new-window'(callback: () => void): void {
    chrome.windows.create(
      {
        url: settings.newTabUrl !== 'homepage' ? settings.newTabUrl : undefined,
      },
      callback,
    )
  },
  'close-window'(callback: () => void): void {
    chrome.windows.getCurrent((window: chrome.windows.Window): void => {
      if (window.id) {
        chrome.windows.remove(window.id, callback)
      } else {
        callback()
      }
    })
  },
  async 'split-tabs'(callback: () => void): Promise<void> {
    chrome.tabs.get(12345678, (tab: chrome.tabs.Tab): void => {
      chrome.tabs.query(
        { windowId: tab.windowId },
        (tabs: chrome.tabs.Tab[]): void => {
          chrome.windows.create(
            { tabId: tab.id, focused: true, incognito: tab.incognito },
            (newwin?: chrome.windows.Window): void => {
              if (newwin) {
                for (let i: number = tab.index + 1; i < tabs.length; i++) {
                  const newtab = tabs[i]
                  if (newtab.id) {
                    chrome.tabs.move(
                      newtab.id,
                      {
                        windowId: newwin.id,
                        index: i - tab.index,
                      },
                      () => {},
                    )
                  }
                }
              }
              callback()
            },
          )
        },
      )
    })
  },
}
