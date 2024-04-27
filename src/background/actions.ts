import browser from 'webextension-polyfill'
import { BackgroundActionProps, ContentMessage } from './types'

const newTab = async ({ settings }: BackgroundActionProps): Promise<void> => {
  const currentTab = await getCurrentTab()
  if (!currentTab) return
  await browser.tabs.create({
    openerTabId: currentTab.id,
    url: settings.newTabUrl !== 'homepage' ? settings.newTabUrl : undefined,
    index: settings.newTabRight ? currentTab.index + 1 : undefined,
  })
}

const newTabLink = async ({ message, settings }: BackgroundActionProps): Promise<void> => {
  const currentTab = await getCurrentTab()
  if (!currentTab) return
  const results: Promise<browser.Tabs.Tab>[] = []
  for (let i = 0; i < message.links.length; i += 1) {
    results.push(
      browser.tabs.create({
        openerTabId: currentTab.id,
        url: message.links[i].src,
        index: settings.newTabLinkRight ? currentTab.index + 1 + i : undefined,
      }),
    )
  }
  await Promise.all(results)
}

const newTabBack = async ({ message, settings }: BackgroundActionProps): Promise<void> => {
  const currentTab = await getCurrentTab()
  if (!currentTab) return
  const results: Promise<browser.Tabs.Tab>[] = []
  for (let i = 0; i < message.links.length; i += 1) {
    results.push(
      browser.tabs.create({
        openerTabId: currentTab.id,
        url: message.links[i].src,
        index: settings.newTabLinkRight ? currentTab.index + 1 + i : undefined,
        active: false,
      }),
    )
  }
  await Promise.all(results)
}

const navigateTab = async ({ settings }: BackgroundActionProps): Promise<void> => {
  await browser.tabs.update({
    url: settings.newTabUrl !== 'homepage' ? settings.newTabUrl : undefined,
  })
}

const closeTab = async ({ settings }: BackgroundActionProps): Promise<void> => {
  const currentTab = await getCurrentTab()
  if (!currentTab || !currentTab.id || currentTab.pinned) return
  if (settings.closeLastBlock) {
    const wins = await browser.windows.getAll({ populate: true })
    if (wins.length === 1 && wins[0].tabs && wins[0].tabs.length === 1) {
      await browser.tabs.update({
        url: settings.newTabUrl !== 'homepage' ? settings.newTabUrl : undefined,
      })
      return
    }
  }
  await browser.tabs.remove(currentTab.id)
}

const closeOtherTabs = async (): Promise<void> => {
  const currentTab = await getCurrentTab()
  if (!currentTab || !currentTab.id) return
  const tabs = await browser.tabs.query({
    windowId: browser.windows.WINDOW_ID_CURRENT,
  })
  const results: Promise<void>[] = []
  for (let i = 0; i < tabs.length; i += 1) {
    const tab = tabs[i]
    if (tab.id && tab.id !== currentTab.id && !tab.pinned) {
      results.push(browser.tabs.remove(tab.id))
    }
  }
  await Promise.all(results)
}

const closeLeftTabs = async (): Promise<void> => {
  const currentTab = await getCurrentTab()
  if (!currentTab) return
  const tabs = await browser.tabs.query({
    windowId: browser.windows.WINDOW_ID_CURRENT,
  })
  const results: Promise<void>[] = []
  for (let i = 0; i < tabs.length; i += 1) {
    const tab = tabs[i]
    if (tab.id && tab.index < currentTab.index && !tab.pinned) {
      results.push(browser.tabs.remove(tab.id))
    }
  }
  await Promise.all(results)
}

const closeRightTabs = async (): Promise<void> => {
  const currentTab = await getCurrentTab()
  if (!currentTab) return
  const tabs = await browser.tabs.query({
    windowId: browser.windows.WINDOW_ID_CURRENT,
  })
  const results: Promise<void>[] = []
  for (let i = 0; i < tabs.length; i += 1) {
    const tab = tabs[i]
    if (tab.id && tab.index > currentTab.index && !tab.pinned) {
      results.push(browser.tabs.remove(tab.id))
    }
  }
  await Promise.all(results)
}

// TODO
const undoClose = async (): Promise<void> => {
  //
}

const reloadTab = async (): Promise<void> => {
  await browser.tabs.reload(undefined, { bypassCache: false })
}

const reloadTabFull = async (): Promise<void> => {
  await browser.tabs.reload(undefined, { bypassCache: true })
}

const reloadAllTabs = async (): Promise<void> => {
  const tabs = await browser.tabs.query({
    windowId: browser.windows.WINDOW_ID_CURRENT,
  })
  const results: Promise<void>[] = []
  for (let i = 0; i < tabs.length; i += 1) {
    const tab = tabs[i]
    if (tab.id) {
      results.push(browser.tabs.reload(tab.id))
    }
  }
  await Promise.all(results)
}

const stop = async ({ port }: BackgroundActionProps): Promise<void> => {
  port.postMessage({ action: { id: 'stop' } } as ContentMessage)
}

const viewSource = async ({ url }: BackgroundActionProps): Promise<void> => {
  const currentTab = await getCurrentTab()
  if (!currentTab) return
  await browser.tabs.create({
    url: `view-source:${url || currentTab.url}`,
    index: currentTab.index + 1,
  })
}

// TODO
const prevTab = async (): Promise<void> => {
  const currentTab = await getCurrentTab()
  if (!currentTab) return
  const tabs = await browser.tabs.query({ windowId: browser.windows.WINDOW_ID_CURRENT })
  let tabId: number | undefined
  for (let i = tabs.length - 1; i >= 0; i -= 1) {
    tabId = tabs[(currentTab.index + i) % tabs.length].id
    //
    if (1) break
    //
  }
  await browser.tabs.update(tabId, { active: true })
}

// TODO
const nextTab = async (): Promise<void> => {
  const currentTab = await getCurrentTab()
  if (!currentTab) return
  const tabs = await browser.tabs.query({ windowId: browser.windows.WINDOW_ID_CURRENT })
  let tabId: number | undefined
  for (let i = 1; i <= tabs.length; i += 1) {
    tabId = tabs[(currentTab.index + i) % tabs.length].id
    //
    if (1) break
    //
  }
  await browser.tabs.update(tabId, { active: true })
}

const pageBack = async ({ port }: BackgroundActionProps): Promise<void> => {
  port.postMessage({ action: { id: 'page-back' } } as ContentMessage)
}

const pageForward = async ({ port }: BackgroundActionProps): Promise<void> => {
  port.postMessage({ action: { id: 'page-forward' } } as ContentMessage)
}

const newWindow = async ({ settings }: BackgroundActionProps): Promise<void> => {
  await browser.windows.create({
    url: settings.newTabUrl !== 'homepage' ? settings.newTabUrl : undefined,
  })
}

const newWindowLink = async ({ message }: BackgroundActionProps): Promise<void> => {
  const results: Promise<browser.Windows.Window>[] = []
  for (let i = 0; i < message.links.length; i += 1) {
    results.push(browser.windows.create({ url: message.links[i].src }))
  }
  await Promise.all(results)
}

const closeWindow = async (): Promise<void> => {
  const currentWin = await browser.windows.getCurrent()
  if (currentWin.id) {
    await browser.windows.remove(currentWin.id)
  }
}

const splitTabs = async (): Promise<void> => {
  const currentTab = await getCurrentTab()
  if (!currentTab || !currentTab.id) return
  const tabs = await browser.tabs.query({
    windowId: browser.windows.WINDOW_ID_CURRENT,
  })
  const win = await browser.windows.create({
    tabId: currentTab.id,
    focused: true,
    incognito: currentTab.incognito,
  })
  const results: Promise<browser.Tabs.Tab | browser.Tabs.Tab[]>[] = []
  for (let i = currentTab.index + 1; i < tabs.length; i += 1) {
    const tab = tabs[i]
    if (tab.id) {
      results.push(
        browser.tabs.move(tab.id, {
          windowId: win.id,
          index: i - currentTab.index,
        }),
      )
    }
  }
  await Promise.all(results)
}

// TODO
const mergeTabs = async (): Promise<void> => {
  //
}

const options = async (): Promise<void> => {
  await browser.tabs.create({
    url: browser.runtime.getURL('options.html'),
  })
}

// TODO
const pageBackClose = async (): Promise<void> => {
  //
}

const gotoTop = async ({ port, message }: BackgroundActionProps): Promise<void> => {
  port.postMessage({
    action: { id: 'goto-top', startPoint: message.startPoint },
  } as ContentMessage)
}

const gotoBottom = async ({ port, message }: BackgroundActionProps): Promise<void> => {
  port.postMessage({
    action: { id: 'goto-bottom', startPoint: message.startPoint },
  } as ContentMessage)
}

const pageUp = async ({ port, message }: BackgroundActionProps): Promise<void> => {
  port.postMessage({
    action: { id: 'page-up', startPoint: message.startPoint },
  } as ContentMessage)
}

const pageDown = async ({ port, message }: BackgroundActionProps): Promise<void> => {
  port.postMessage({
    action: { id: 'page-down', startPoint: message.startPoint },
  } as ContentMessage)
}

const pageNext = async ({ port }: BackgroundActionProps): Promise<void> => {
  port.postMessage({ action: { id: 'page-next' } } as ContentMessage)
}

const pagePrev = async ({ port }: BackgroundActionProps): Promise<void> => {
  port.postMessage({ action: { id: 'page-prev' } } as ContentMessage)
}

// TODO
const fullscreenWindow = async (): Promise<void> => {
  //
}

// TODO
const minimizeWindow = async (): Promise<void> => {
  //
}

// TODO
const maximizeWindow = async (): Promise<void> => {
  //
}

const openScreenshot = async (): Promise<void> => {
  await browser.tabs.update({ active: true })
  setTimeout(async () => {
    const dataUrl = await browser.tabs.captureVisibleTab(undefined, {
      format: 'png',
    })
    await browser.tabs.create({ url: dataUrl })
  }, 100)
}

// TODO
const saveScreenshot = async (): Promise<void> => {
  const currentTab = await getCurrentTab()
  if (!currentTab) return
  await browser.tabs.update({ active: true })
  setTimeout(async () => {
    const dataUrl = await browser.tabs.captureVisibleTab(undefined, {
      format: 'png',
    })
    //
  }, 100)
}

// TODO
const openScreenshotFull = async (): Promise<void> => {
  //
}

// TODO
const saveScreenshotFull = async (): Promise<void> => {
  //
}

const cloneTab = async (): Promise<void> => {
  const currentTab = await getCurrentTab()
  if (!currentTab || !currentTab.id) return
  await browser.tabs.duplicate(currentTab.id)
}

// TODO
const zoomIn = async (): Promise<void> => {
  //
}

// TODO
const zoomOut = async (): Promise<void> => {
  //
}

// TODO
const zoomZero = async (): Promise<void> => {
  //
}

const zoomImgIn = async ({ port, message }: BackgroundActionProps): Promise<void> => {
  port.postMessage({ action: { id: 'zoom-img-in', images: message.images } } as ContentMessage)
}

const zoomImgOut = async ({ port, message }: BackgroundActionProps): Promise<void> => {
  port.postMessage({ action: { id: 'zoom-img-out', images: message.images } } as ContentMessage)
}

const zoomImgZero = async ({ port, message }: BackgroundActionProps): Promise<void> => {
  port.postMessage({ action: { id: 'zoom-img-zero', images: message.images } } as ContentMessage)
}

const tabToLeft = async (): Promise<void> => {
  const currentTab = await getCurrentTab()
  if (!currentTab || !currentTab.id) return
  await browser.tabs.move(currentTab.id, { index: currentTab.index > 0 ? currentTab.index - 1 : 0 })
}

const tabToRight = async (): Promise<void> => {
  const currentTab = await getCurrentTab()
  if (!currentTab || !currentTab.id) return
  await browser.tabs.move(currentTab.id, { index: currentTab.index + 1 })
}

const parentDir = async (): Promise<void> => {
  const currentTab = await getCurrentTab()
  if (!currentTab || !currentTab.url) return
  let parts = currentTab.url.split('#')[0].split('?')[0].split('/')
  if (parts[parts.length - 1] === '') {
    parts = parts.slice(0, parts.length - 1)
  }
  let url: string
  if (parts.length > 3) {
    url = `${parts.slice(0, parts.length - 1).join('/')}/`
  } else {
    url = `${parts.join('/')}/`
  }
  if (url) {
    await browser.tabs.update({ url })
  }
}

const openHistory = async (): Promise<void> => {
  await browser.tabs.create({ url: 'chrome://history/' })
}

const openDownloads = async (): Promise<void> => {
  await browser.tabs.create({ url: 'chrome://downloads/' })
}

const openExtensions = async (): Promise<void> => {
  await browser.tabs.create({ url: 'chrome://extensions/' })
}

const openBookmarks = async (): Promise<void> => {
  await browser.tabs.create({ url: 'chrome://bookmarks/' })
}

const openImage = async ({ message }: BackgroundActionProps): Promise<void> => {
  const currentTab = await getCurrentTab()
  if (!currentTab) return
  const results: Promise<browser.Tabs.Tab>[] = []
  for (let i = 0; i < message.images.length; i += 1) {
    results.push(
      browser.tabs.create({
        url: message.images[i].src,
        openerTabId: currentTab.id,
      }),
    )
  }
  await Promise.all(results)
}

// TODO
const sageImage = async (): Promise<void> => {
  //
}

const hideImage = async ({ port, message }: BackgroundActionProps): Promise<void> => {
  port.postMessage({ action: { id: 'hide-image', images: message.images } } as ContentMessage)
}

const showCookies = async ({ port }: BackgroundActionProps): Promise<void> => {
  port.postMessage({ action: { id: 'show-cookies' } } as ContentMessage)
}

const searchTel = async ({ message }: BackgroundActionProps): Promise<void> => {
  const currentTab = await getCurrentTab()
  if (!currentTab) return
  await browser.tabs.create({
    url: `http://www.google.com/search?q=${message.selection}`,
    openerTabId: currentTab.id,
    index: currentTab.index + 1,
  })
}

const print = async ({ port, message }: BackgroundActionProps): Promise<void> => {
  port.postMessage({ action: { id: 'print', images: message.images } } as ContentMessage)
}

const togglePin = async (): Promise<void> => {
  const currentTab = await getCurrentTab()
  if (!currentTab) return
  await browser.tabs.update({ pinned: !currentTab.pinned })
}

const pin = async (): Promise<void> => {
  await browser.tabs.update({ pinned: true })
}

const unpin = async (): Promise<void> => {
  await browser.tabs.update({ pinned: false })
}

const copy = async ({ message }: BackgroundActionProps): Promise<void> => {
  if (!message.selection) return
  await navigator.clipboard.writeText(message.selection)
}

const copyLink = async ({ message }: BackgroundActionProps): Promise<void> => {
  if (message.links.length === 0) return
  await navigator.clipboard.writeText(message.links[0].src)
}

const findPrev = async ({ message }: BackgroundActionProps): Promise<void> => {
  if (!message.selection) return
  await runJS(
    `window.find('${message.selection.replace(
      /[\\"']/g,
      '\\$&',
    )}', false, true, true, false, true, true);`,
  )
}

const findNext = async ({ message }: BackgroundActionProps): Promise<void> => {
  if (!message.selection) return
  await runJS(
    `window.find('${message.selection.replace(
      /[\\"']/g,
      '\\$&',
    )}', false, false, true, false, true, true);`,
  )
}

const toggleBookmark = async (): Promise<void> => {
  const currentTab = await getCurrentTab()
  if (!currentTab || !currentTab.url) return
  const bookmarks = await browser.bookmarks.search(currentTab.url)
  if (!bookmarks.length) {
    await browser.bookmarks.create({ parentId: '2', title: currentTab.title, url: currentTab.url })
  } else {
    await browser.bookmarks.remove(bookmarks[0].id)
  }
}

const bookmark = async (): Promise<void> => {
  const currentTab = await getCurrentTab()
  if (!currentTab || !currentTab.url) return
  await browser.bookmarks.create({ parentId: '2', title: currentTab.title, url: currentTab.url })
}

const unbookmark = async (): Promise<void> => {
  const currentTab = await getCurrentTab()
  if (!currentTab || !currentTab.url) return
  const bookmarks = await browser.bookmarks.search(currentTab.url)
  if (bookmarks.length) {
    await browser.bookmarks.remove(bookmarks[0].id)
  }
}

const getCurrentTab = async (): Promise<browser.Tabs.Tab | undefined> => {
  const [tab] = await browser.tabs.query({
    active: true,
    lastFocusedWindow: true,
  })
  return tab
}

// TODO
const runJS = async (code: string) => {
  //
}

export const actions = {
  'new-tab': newTab,
  'new-tab-link': newTabLink,
  'new-tab-back': newTabBack,
  'navigate-tab': navigateTab,
  'close-tab': closeTab,
  'close-other-tabs': closeOtherTabs,
  'close-left-tabs': closeLeftTabs,
  'close-right-tabs': closeRightTabs,
  'undo-close': undoClose,
  'reload-tab': reloadTab,
  'reload-tab-full': reloadTabFull,
  'reload-all-tabs': reloadAllTabs,
  stop,
  'view-source': viewSource,
  'prev-tab': prevTab,
  'next-tab': nextTab,
  'page-back': pageBack,
  'page-forward': pageForward,
  'new-window': newWindow,
  'new-window-link': newWindowLink,
  'close-window': closeWindow,
  'split-tabs': splitTabs,
  'merge-tabs': mergeTabs,
  options,
  'page-back-close': pageBackClose,
  'goto-top': gotoTop,
  'goto-bottom': gotoBottom,
  'page-up': pageUp,
  'page-down': pageDown,
  'page-next': pageNext,
  'page-prev': pagePrev,
  'fullscreen-window': fullscreenWindow,
  'minimize-window': minimizeWindow,
  'maximize-window': maximizeWindow,
  'open-screenshot': openScreenshot,
  'save-screenshot': saveScreenshot,
  'open-screenshot-full': openScreenshotFull,
  'save-screenshot-full': saveScreenshotFull,
  'clone-tab': cloneTab,
  'zoom-in': zoomIn,
  'zoom-out': zoomOut,
  'zoom-zero': zoomZero,
  'zoom-img-in': zoomImgIn,
  'zoom-img-out': zoomImgOut,
  'zoom-img-zero': zoomImgZero,
  'tab-to-left': tabToLeft,
  'tab-to-right': tabToRight,
  'parent-dir': parentDir,
  'open-history': openHistory,
  'open-downloads': openDownloads,
  'open-extensions': openExtensions,
  'open-bookmarks': openBookmarks,
  'open-image': openImage,
  'save-image': sageImage,
  'hide-image': hideImage,
  'show-cookies': showCookies,
  'search-sel': searchTel,
  print,
  'toggle-pin': togglePin,
  pin,
  unpin,
  copy,
  'copy-link': copyLink,
  'find-prev': findPrev,
  'find-next': findNext,
  'toggle-bookmark': toggleBookmark,
  bookmark,
  unbookmark,
}
