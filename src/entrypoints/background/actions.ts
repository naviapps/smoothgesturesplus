import { Runtime, Tabs, Windows } from 'wxt/browser';

import { settingsStore } from '@/stores/settings-store';
import { sendMessage } from '@/entrypoints/content/messaging';
import { delay } from 'es-toolkit';
import { GestureMessage } from '@/entrypoints/background/messaging';
import { ImageMessage, LinkMessage } from '@/types.ts';

const ZOOM_FACTORS = [
  0.25, 0.33, 0.5, 0.67, 0.75, 0.8, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4, 5,
];

export const newTab = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab.id || !tab.windowId) {
    return;
  }
  const createProperties: Tabs.CreateCreatePropertiesType = {
    openerTabId: tab.id,
    windowId: tab.windowId,
  };
  if (settingsStore.getState().newTabUrl !== 'homepage') {
    createProperties.url = settingsStore.getState().newTabUrl;
  }
  if (settingsStore.getState().newTabRight) {
    createProperties.index = tab.index + 1;
  }
  await browser.tabs.create(createProperties);
};

export const newTabLink = async (tab: Tabs.Tab, links: LinkMessage[]): Promise<void> => {
  if (!tab.id || !tab.windowId || !links.length) {
    return;
  }
  const promises: Promise<Tabs.Tab>[] = [];
  for (let i = 0; i < links.length; i += 1) {
    const createProperties: Tabs.CreateCreatePropertiesType = {
      openerTabId: tab.id,
      windowId: tab.windowId,
      url: links[i].src,
    };
    if (settingsStore.getState().newTabLinkRight) {
      createProperties.index = tab.index + 1 + i;
    }
    promises.push(browser.tabs.create(createProperties));
  }
  await Promise.all(promises);
};

export const newTabBack = async (tab: Tabs.Tab, links: LinkMessage[]): Promise<void> => {
  if (!tab.id || !tab.windowId || !links.length) {
    return;
  }
  const promises: Promise<Tabs.Tab>[] = [];
  for (let i = 0; i < links.length; i += 1) {
    const createProperties: Tabs.CreateCreatePropertiesType = {
      openerTabId: tab.id,
      windowId: tab.windowId,
      url: links[i].src,
      active: false,
    };
    if (settingsStore.getState().newTabLinkRight) {
      createProperties.index = tab.index + 1 + i;
    }
    promises.push(browser.tabs.create(createProperties));
  }
  await Promise.all(promises);
};

export const navigateTab = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab.id) {
    return;
  }
  await browser.tabs.update(tab.id, {
    url:
      settingsStore.getState().newTabUrl !== 'homepage'
        ? settingsStore.getState().newTabUrl
        : undefined,
  });
};

export const closeTab = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab.id || tab.pinned) {
    return;
  }
  if (settingsStore.getState().closeLastBlock) {
    const wins = await browser.windows.getAll({ populate: true });
    if (wins.length === 1 && wins[0].tabs && wins[0].tabs.length === 1) {
      await browser.tabs.update(tab.id, {
        url:
          settingsStore.getState().newTabUrl !== 'homepage'
            ? settingsStore.getState().newTabUrl
            : undefined,
      });
      return;
    }
  }
  await browser.tabs.remove(tab.id);
};

export const closeOtherTabs = async (senderTab: Tabs.Tab): Promise<void> => {
  if (!senderTab.windowId) {
    return;
  }
  const tabs = await browser.tabs.query({ windowId: senderTab.windowId });
  if (!tabs.length) {
    return;
  }
  const promises: Promise<void>[] = [];
  for (let i = 0; i < tabs.length; i += 1) {
    const tab = tabs[i];
    if (tab.id && tab.id !== senderTab.id && !tab.pinned) {
      promises.push(browser.tabs.remove(tab.id));
    }
  }
  await Promise.all(promises);
};

export const closeLeftTabs = async (senderTab: Tabs.Tab): Promise<void> => {
  if (!senderTab.windowId) {
    return;
  }
  const tabs = await browser.tabs.query({ windowId: senderTab.windowId });
  if (!tabs.length) {
    return;
  }
  const promises: Promise<void>[] = [];
  for (let i = 0; i < tabs.length; i += 1) {
    const tab = tabs[i];
    if (tab.id && tab.index < senderTab.index && !tab.pinned) {
      promises.push(browser.tabs.remove(tab.id));
    }
  }
  await Promise.all(promises);
};

export const closeRightTabs = async (senderTab: Tabs.Tab): Promise<void> => {
  if (!senderTab.windowId) {
    return;
  }
  const tabs = await browser.tabs.query({ windowId: senderTab.windowId });
  if (!tabs.length) {
    return;
  }
  const promises: Promise<void>[] = [];
  for (let i = 0; i < tabs.length; i += 1) {
    const tab = tabs[i];
    if (tab.id && tab.index > senderTab.index && !tab.pinned) {
      promises.push(browser.tabs.remove(tab.id));
    }
  }
  await Promise.all(promises);
};

export const undoClose = async (): Promise<void> => {
  const sessions = await browser.sessions.getRecentlyClosed();
  let sessionId: string | undefined;
  for (let i = 0; i < sessions.length; i += 1) {
    const session = sessions[i];
    if (session.tab?.sessionId) {
      sessionId = session.tab.sessionId;
      break;
    }
  }
  if (!sessionId) {
    return;
  }
  await browser.sessions.restore(sessionId);
};

export const reloadTab = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab.id) {
    return;
  }
  await browser.tabs.reload(tab.id, { bypassCache: false });
};

export const reloadTabFull = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab.id) {
    return;
  }
  await browser.tabs.reload(tab.id, { bypassCache: true });
};

export const reloadAllTabs = async (senderTab: Tabs.Tab): Promise<void> => {
  if (!senderTab.windowId) {
    return;
  }
  const tabs = await browser.tabs.query({ windowId: senderTab.windowId });
  if (!tabs.length) {
    return;
  }
  const promises: Promise<void>[] = [];
  for (let i = 0; i < tabs.length; i += 1) {
    const tab = tabs[i];
    if (tab.id) {
      promises.push(browser.tabs.reload(tab.id));
    }
  }
  await Promise.all(promises);
};

export const stop = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab.id) {
    return;
  }
  await sendMessage('actionStop', undefined, tab.id);
};

export const viewSource = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab.windowId || !tab.url) {
    return;
  }
  await browser.tabs.create({
    url: `view-source:${tab.url}`,
    windowId: tab.windowId,
    index: tab.index + 1,
  });
};

export const prevTab = async (senderTab: Tabs.Tab): Promise<void> => {
  if (!senderTab.id || !senderTab.windowId) {
    return;
  }
  const tabs = await browser.tabs.query({ windowId: senderTab.windowId });
  if (!tabs.length) {
    return;
  }
  let tabId: number | undefined;
  for (let i = tabs.length - 1; i >= 0; i -= 1) {
    const tab = tabs[i];
    if (tab.id && tab.index < senderTab.index) {
      tabId = tab.id;
      break;
    }
  }
  if (!tabId) {
    return;
  }
  await browser.tabs.update(tabId, { active: true });
};

export const nextTab = async (senderTab: Tabs.Tab): Promise<void> => {
  if (!senderTab.id || !senderTab.windowId) {
    return;
  }
  const tabs = await browser.tabs.query({ windowId: senderTab.windowId });
  if (!tabs.length) {
    return;
  }
  let tabId: number | undefined;
  for (let i = 1; i <= tabs.length; i += 1) {
    const tab = tabs[i];
    if (tab.id && senderTab.index < tab.index) {
      tabId = tab.id;
      break;
    }
  }
  if (!tabId) {
    return;
  }
  await browser.tabs.update(tabId, { active: true });
};

export const pageBack = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab.id) {
    return;
  }
  try {
    await browser.tabs.goBack(tab.id);
  } catch (error) {
    /* empty */
  }
};

export const pageForward = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab.id) {
    return;
  }
  try {
    await browser.tabs.goForward(tab.id);
  } catch (error) {
    /* empty */
  }
};

export const newWindow = async (): Promise<void> => {
  await browser.windows.create({
    url:
      settingsStore.getState().newTabUrl !== 'homepage'
        ? settingsStore.getState().newTabUrl
        : undefined,
  });
};

export const newWindowLink = async (links: LinkMessage[]): Promise<void> => {
  if (!links.length) {
    return;
  }
  const promises: Promise<Windows.Window>[] = [];
  for (let i = 0; i < links.length; i += 1) {
    promises.push(browser.windows.create({ url: links[i].src }));
  }
  await Promise.all(promises);
};

export const closeWindow = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab.windowId) {
    return;
  }
  await browser.windows.remove(tab.windowId);
};

export const splitTabs = async (senderTab: Tabs.Tab): Promise<void> => {
  if (!senderTab.id || !senderTab.windowId) {
    return;
  }
  const tabs = await browser.tabs.query({ windowId: senderTab.windowId });
  if (!tabs.length) {
    return;
  }
  const win = await browser.windows.create({
    tabId: senderTab.id,
    focused: true,
    incognito: senderTab.incognito,
  });
  if (!win.id) {
    return;
  }
  const promises: Promise<Tabs.Tab | Tabs.Tab[]>[] = [];
  for (let i = senderTab.index + 1; i < tabs.length; i += 1) {
    const tab = tabs[i];
    if (tab.id) {
      promises.push(
        browser.tabs.move(tab.id, {
          windowId: win.id,
          index: i - senderTab.index,
        }),
      );
    }
  }
  await Promise.all(promises);
};

export const options = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab.windowId) {
    return;
  }
  await browser.tabs.create({
    url: browser.runtime.getURL('/options.html'),
    windowId: tab.windowId,
  });
};

export const pageBackClose = async (senderTab: Tabs.Tab): Promise<void> => {
  if (!senderTab.id || !senderTab.url) {
    return;
  }
  const tabId = senderTab.id;
  try {
    await browser.tabs.goBack(tabId);
  } catch (error) {
    /* empty */
  }
  await delay(400);
  const tab = await browser.tabs.get(tabId);
  if (tab.id && tab.url === senderTab.url) {
    await browser.tabs.remove(tab.id);
  }
};

export const gotoTop = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab.id) {
    return;
  }
  await sendMessage('actionGotoTop', undefined, tab.id);
};

export const gotoBottom = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab.id) {
    return;
  }
  await sendMessage('actionGotoBottom', undefined, tab.id);
};

export const pageUp = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab.id) {
    return;
  }
  await sendMessage('actionPageUp', undefined, tab.id);
};

export const pageDown = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab.id) {
    return;
  }
  await sendMessage('actionPageDown', undefined, tab.id);
};

export const pageNext = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab.id) {
    return;
  }
  await sendMessage('actionPageNext', undefined, tab.id);
};

export const pagePrev = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab.id) {
    return;
  }
  await sendMessage('actionPagePrev', undefined, tab.id);
};

export const fullscreenWindow = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab.windowId) {
    return;
  }
  const win = await browser.windows.get(tab.windowId);
  if (!win.id) {
    return;
  }
  await browser.windows.update(win.id, {
    state: win.state !== 'fullscreen' ? 'fullscreen' : 'normal',
  });
};

export const minimizeWindow = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab.windowId) {
    return;
  }
  const win = await browser.windows.get(tab.windowId);
  if (!win.id) {
    return;
  }
  await browser.windows.update(win.id, {
    state: win.state !== 'minimized' ? 'minimized' : 'normal',
  });
};

export const maximizeWindow = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab.windowId) {
    return;
  }
  const win = await browser.windows.get(tab.windowId);
  if (!win.id) {
    return;
  }
  await browser.windows.update(win.id, {
    state: win.state !== 'maximized' ? 'maximized' : 'normal',
  });
};

export const openScreenshot = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab.id || !tab.windowId) {
    return;
  }
  await browser.tabs.update(tab.id, { active: true });
  await delay(100);
  const dataUrl = await browser.tabs.captureVisibleTab(tab.windowId, {
    format: 'png',
  });
  await browser.tabs.create({ url: dataUrl });
};

export const saveScreenshot = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab.id) {
    return;
  }
  await browser.tabs.update(tab.id, { active: true });
  await delay(100);
  const dataUrl = await browser.tabs.captureVisibleTab(tab.windowId, {
    format: 'png',
  });
  await browser.downloads.download({
    filename: `screenshot${tab.url ? `-${new URL(tab.url).hostname}` : ''}.png`,
    url: dataUrl,
  });
};

export const cloneTab = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab.id) {
    return;
  }
  await browser.tabs.duplicate(tab.id);
};

export const zoomIn = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab.id) {
    return;
  }
  const currZoomFactor = (await browser.tabs.getZoom(tab.id)) + Number.EPSILON;
  const nextZoomFactor = ZOOM_FACTORS.slice().find((zoomFactor) => currZoomFactor < zoomFactor);
  if (!nextZoomFactor) {
    return;
  }
  await browser.tabs.setZoom(tab.id, nextZoomFactor);
};

export const zoomOut = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab.id) {
    return;
  }
  const currZoomFactor = (await browser.tabs.getZoom(tab.id)) - Number.EPSILON;
  const nextZoomFactor = ZOOM_FACTORS.slice()
    .reverse()
    .find((zoomFactor) => zoomFactor < currZoomFactor);
  if (!nextZoomFactor) {
    return;
  }
  await browser.tabs.setZoom(tab.id, nextZoomFactor);
};

export const zoomZero = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab.id) {
    return;
  }
  await browser.tabs.setZoom(tab.id, 0);
};

export const zoomImgIn = async (tab: Tabs.Tab, images: ImageMessage[]): Promise<void> => {
  if (!tab.id || !images.length) {
    return;
  }
  await sendMessage('actionZoomImgIn', images, tab.id);
};

export const zoomImgOut = async (tab: Tabs.Tab, images: ImageMessage[]): Promise<void> => {
  if (!tab.id || !images.length) {
    return;
  }
  await sendMessage('actionZoomImgOut', images, tab.id);
};

export const zoomImgZero = async (tab: Tabs.Tab, images: ImageMessage[]): Promise<void> => {
  if (!tab.id || !images.length) {
    return;
  }
  await sendMessage('actionZoomImgZero', images, tab.id);
};

export const tabToLeft = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab.id) {
    return;
  }
  await browser.tabs.move(tab.id, { index: Math.max(tab.index - 1, 0) });
};

export const tabToRight = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab.id) {
    return;
  }
  await browser.tabs.move(tab.id, { index: tab.index + 1 });
};

export const parentDir = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab.id || !tab.url) {
    return;
  }
  const parts = tab.url.split('#')[0].split('?')[0].split('/');
  if (parts[parts.length - 1] === '') {
    parts.pop();
  }
  const url = parts.length > 3 ? `${parts.slice(0, -1).join('/')}/` : `${parts.join('/')}/`;
  await browser.tabs.update(tab.id, { url });
};

export const openHistory = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab.windowId) {
    return;
  }
  await browser.tabs.create({
    url: 'chrome://history/',
    windowId: tab.windowId,
  });
};

export const openDownloads = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab.windowId) {
    return;
  }
  await browser.tabs.create({
    url: 'chrome://downloads/',
    windowId: tab.windowId,
  });
};

export const openExtensions = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab.windowId) {
    return;
  }
  await browser.tabs.create({
    url: 'chrome://extensions/',
    windowId: tab.windowId,
  });
};

export const openBookmarks = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab.windowId) {
    return;
  }
  await browser.tabs.create({
    url: 'chrome://bookmarks/',
    windowId: tab.windowId,
  });
};

export const openImage = async (tab: Tabs.Tab, images: ImageMessage[]): Promise<void> => {
  if (!tab.id || !tab.windowId || !images.length) {
    return;
  }
  const promises: Promise<Tabs.Tab>[] = [];
  for (let i = 0; i < images.length; i += 1) {
    promises.push(
      browser.tabs.create({
        url: images[i].src,
        openerTabId: tab.id,
        windowId: tab.windowId,
      }),
    );
  }
  await Promise.all(promises);
};

export const saveImage = async (images: ImageMessage[]): Promise<void> => {
  if (!images.length) {
    return;
  }
  const promises: Promise<number>[] = [];
  for (let i = 0; i < images.length; i += 1) {
    promises.push(browser.downloads.download({ url: images[i].src }));
  }
  await Promise.all(promises);
};

export const hideImage = async (tab: Tabs.Tab, images: ImageMessage[]): Promise<void> => {
  if (!tab.id || !images.length) {
    return;
  }
  await sendMessage('actionHideImage', images, tab.id);
};

export const showCookies = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab.id) {
    return;
  }
  await sendMessage('actionShowCookies', undefined, tab.id);
};

export const searchSel = async (tab: Tabs.Tab, selection?: string): Promise<void> => {
  if (!tab.id || !tab.windowId || !selection) {
    return;
  }
  await browser.tabs.create({
    url: `https://www.google.com/search?q=${selection}`,
    openerTabId: tab.id,
    windowId: tab.windowId,
    index: tab.index + 1,
  });
};

export const print = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab.id) {
    return;
  }
  await sendMessage('actionPrint', undefined, tab.id);
};

export const togglePin = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab.id) {
    return;
  }
  await browser.tabs.update(tab.id, { pinned: !tab.pinned });
};

export const pin = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab.id) {
    return;
  }
  await browser.tabs.update(tab.id, { pinned: true });
};

export const unpin = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab.id) {
    return;
  }
  await browser.tabs.update(tab.id, { pinned: false });
};

export const copy = async (tab: Tabs.Tab, selection?: string): Promise<void> => {
  if (!tab.id || !selection) {
    return;
  }
  await sendMessage('actionCopy', selection, tab.id);
};

export const copyLink = async (tab: Tabs.Tab, links: LinkMessage[]): Promise<void> => {
  if (!tab.id || !links.length) {
    return;
  }
  await sendMessage('actionCopyLink', links, tab.id);
};

export const findPrev = async (tab: Tabs.Tab, selection?: string) => {
  if (!tab.id || !selection) {
    return;
  }
  await sendMessage('actionFindPrev', selection, tab.id);
};

export const findNext = async (tab: Tabs.Tab, selection?: string) => {
  if (!tab.id || !selection) {
    return;
  }
  await sendMessage('actionFindNext', selection, tab.id);
};

export const toggleBookmark = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab.url) {
    return;
  }
  const results = await browser.bookmarks.search(tab.url);
  if (!results.length) {
    await browser.bookmarks.create({
      parentId: '2',
      title: tab.title,
      url: tab.url,
    });
  } else {
    await browser.bookmarks.remove(results[0].id);
  }
};

export const bookmark = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab.url) {
    return;
  }
  await browser.bookmarks.create({
    parentId: '2',
    title: tab.title,
    url: tab.url,
  });
};

export const unbookmark = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab.url) {
    return;
  }
  const results = await browser.bookmarks.search(tab.url);
  if (!results.length) {
    return;
  }
  await browser.bookmarks.remove(results[0].id);
};

const createActions = (
  { links, images, selection }: GestureMessage,
  sender: Runtime.MessageSender,
) => {
  if (!sender.tab) {
    return;
  }
  const senderTab = sender.tab;

  return {
    'new-tab': () => newTab(senderTab),
    'new-tab-link': () => newTabLink(senderTab, links),
    'new-tab-back': () => newTabBack(senderTab, links),
    'navigate-tab': () => navigateTab(senderTab),
    'close-tab': () => closeTab(senderTab),
    'close-other-tabs': () => closeOtherTabs(senderTab),
    'close-left-tabs': () => closeLeftTabs(senderTab),
    'close-right-tabs': () => closeRightTabs(senderTab),
    'undo-close': () => undoClose(),
    'reload-tab': () => reloadTab(senderTab),
    'reload-tab-full': () => reloadTabFull(senderTab),
    'reload-all-tabs': () => reloadAllTabs(senderTab),
    stop: () => stop(senderTab),
    'view-source': () => viewSource(senderTab),
    'prev-tab': () => prevTab(senderTab),
    'next-tab': () => nextTab(senderTab),
    'page-back': () => pageBack(senderTab),
    'page-forward': () => pageForward(senderTab),
    'new-window': () => newWindow(),
    'new-window-link': () => newWindowLink(links),
    'close-window': () => closeWindow(senderTab),
    'split-tabs': () => splitTabs(senderTab),
    options: () => options(senderTab),
    'page-back-close': () => pageBackClose(senderTab),
    'goto-top': () => gotoTop(senderTab),
    'goto-bottom': () => gotoBottom(senderTab),
    'page-up': () => pageUp(senderTab),
    'page-down': () => pageDown(senderTab),
    'page-next': () => pageNext(senderTab),
    'page-prev': () => pagePrev(senderTab),
    'fullscreen-window': () => fullscreenWindow(senderTab),
    'minimize-window': () => minimizeWindow(senderTab),
    'maximize-window': () => maximizeWindow(senderTab),
    'open-screenshot': () => openScreenshot(senderTab),
    'save-screenshot': () => saveScreenshot(senderTab),
    'clone-tab': () => cloneTab(senderTab),
    'zoom-in': () => zoomIn(senderTab),
    'zoom-out': () => zoomOut(senderTab),
    'zoom-zero': () => zoomZero(senderTab),
    'zoom-img-in': () => zoomImgIn(senderTab, images),
    'zoom-img-out': () => zoomImgOut(senderTab, images),
    'zoom-img-zero': () => zoomImgZero(senderTab, images),
    'tab-to-left': () => tabToLeft(senderTab),
    'tab-to-right': () => tabToRight(senderTab),
    'parent-dir': () => parentDir(senderTab),
    'open-history': () => openHistory(senderTab),
    'open-downloads': () => openDownloads(senderTab),
    'open-extensions': () => openExtensions(senderTab),
    'open-bookmarks': () => openBookmarks(senderTab),
    'open-image': () => openImage(senderTab, images),
    'save-image': () => saveImage(images),
    'hide-image': () => hideImage(senderTab, images),
    'show-cookies': () => showCookies(senderTab),
    'search-sel': () => searchSel(senderTab, selection),
    print: () => print(senderTab),
    'toggle-pin': () => togglePin(senderTab),
    pin: () => pin(senderTab),
    unpin: () => unpin(senderTab),
    copy: () => copy(senderTab, selection),
    'copy-link': () => copyLink(senderTab, links),
    'find-prev': () => findPrev(senderTab, selection),
    'find-next': () => findNext(senderTab, selection),
    'toggle-bookmark': () => toggleBookmark(senderTab),
    bookmark: () => bookmark(senderTab),
    unbookmark: () => unbookmark(senderTab),
  };
};

export default createActions;
