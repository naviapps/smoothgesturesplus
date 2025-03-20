import { delay } from 'es-toolkit';

import { GestureMessage } from '@/entrypoints/background/messaging';
import { sendMessage } from '@/entrypoints/content/messaging';
import { settingsStore } from '@/stores/settings-store';
import { ImageMessage, LinkMessage } from '@/types/gesture';

const ZOOM_FACTORS = [
  0.25, 0.33, 0.5, 0.67, 0.75, 0.8, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4, 5,
];

export const newTab = async (tab: Browser.tabs.Tab): Promise<void> => {
  if (!tab?.id || !tab.windowId) {
    return;
  }
  const createProperties: Browser.tabs.CreateProperties = {
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

export const newTabLink = async (tab: Browser.tabs.Tab, links: LinkMessage[]): Promise<void> => {
  if (!tab?.id || !tab.windowId || links.length === 0) {
    return;
  }
  for (const [index, link] of links.entries()) {
    const createProperties: Browser.tabs.CreateProperties = {
      openerTabId: tab.id,
      windowId: tab.windowId,
      url: link.src,
    };
    if (settingsStore.getState().newTabLinkRight) {
      createProperties.index = tab.index + 1 + index;
    }
    await browser.tabs.create(createProperties);
  }
};

export const newTabBack = async (tab: Browser.tabs.Tab, links: LinkMessage[]): Promise<void> => {
  if (!tab?.id || !tab.windowId || links.length === 0) {
    return;
  }
  for (const [index, link] of links.entries()) {
    const createProperties: Browser.tabs.CreateProperties = {
      openerTabId: tab.id,
      windowId: tab.windowId,
      url: link.src,
      active: false,
    };
    if (settingsStore.getState().newTabLinkRight) {
      createProperties.index = tab.index + 1 + index;
    }
    await browser.tabs.create(createProperties);
  }
};

export const navigateTab = async (tab: Browser.tabs.Tab): Promise<void> => {
  if (!tab?.id) {
    return;
  }
  await browser.tabs.update(tab.id, {
    url:
      settingsStore.getState().newTabUrl === 'homepage'
        ? undefined
        : settingsStore.getState().newTabUrl,
  });
};

export const closeTab = async (tab: Browser.tabs.Tab): Promise<void> => {
  if (!tab?.id || tab.pinned) {
    return;
  }
  if (settingsStore.getState().closeLastBlock) {
    const wins = await browser.windows.getAll({ populate: true });
    if (wins.length === 1 && wins[0].tabs && wins[0].tabs.length === 1) {
      await browser.tabs.update(tab.id, {
        url:
          settingsStore.getState().newTabUrl === 'homepage'
            ? undefined
            : settingsStore.getState().newTabUrl,
      });
      return;
    }
  }
  await browser.tabs.remove(tab.id);
};

export const closeOtherTabs = async (tab: Browser.tabs.Tab): Promise<void> => {
  if (!tab?.windowId) {
    return;
  }
  const tabs = await browser.tabs.query({ windowId: tab.windowId });
  if (tabs.length === 0) {
    return;
  }
  const promises: Promise<void>[] = [];
  for (const targetTab of tabs) {
    if (targetTab.id && !targetTab.pinned && targetTab.id !== tab.id) {
      promises.push(browser.tabs.remove(targetTab.id));
    }
  }
  await Promise.all(promises);
};

export const closeLeftTabs = async (tab: Browser.tabs.Tab): Promise<void> => {
  if (!tab?.windowId) {
    return;
  }
  const tabs = await browser.tabs.query({ windowId: tab.windowId });
  if (tabs.length === 0) {
    return;
  }
  const promises: Promise<void>[] = [];
  for (const targetTab of tabs) {
    if (targetTab.id && !targetTab.pinned && targetTab.index < tab.index) {
      promises.push(browser.tabs.remove(targetTab.id));
    }
  }
  await Promise.all(promises);
};

export const closeRightTabs = async (tab: Browser.tabs.Tab): Promise<void> => {
  if (!tab?.windowId) {
    return;
  }
  const tabs = await browser.tabs.query({ windowId: tab.windowId });
  if (tabs.length === 0) {
    return;
  }
  const promises: Promise<void>[] = [];
  for (const targetTab of tabs) {
    if (targetTab.id && !targetTab.pinned && tab.index < targetTab.index) {
      promises.push(browser.tabs.remove(targetTab.id));
    }
  }
  await Promise.all(promises);
};

export const undoClose = async (): Promise<void> => {
  const sessions = await browser.sessions.getRecentlyClosed();
  for (const session of sessions) {
    if (session.tab?.sessionId) {
      await browser.sessions.restore(session.tab.sessionId);
      return;
    }
  }
};

export const reloadTab = async (tab: Browser.tabs.Tab): Promise<void> => {
  if (!tab?.id) {
    return;
  }
  await browser.tabs.reload(tab.id, { bypassCache: false });
};

export const reloadTabFull = async (tab: Browser.tabs.Tab): Promise<void> => {
  if (!tab?.id) {
    return;
  }
  await browser.tabs.reload(tab.id, { bypassCache: true });
};

export const reloadAllTabs = async (tab: Browser.tabs.Tab): Promise<void> => {
  if (!tab?.windowId) {
    return;
  }
  const tabs = await browser.tabs.query({ windowId: tab.windowId });
  if (tabs.length === 0) {
    return;
  }
  const promises: Promise<void>[] = [];
  for (const targetTab of tabs) {
    if (targetTab.id) {
      promises.push(browser.tabs.reload(targetTab.id));
    }
  }
  await Promise.all(promises);
};

export const stop = async (tab: Browser.tabs.Tab): Promise<void> => {
  if (!tab?.id) {
    return;
  }
  await sendMessage('stop', undefined, tab.id);
};

export const viewSource = async (tab: Browser.tabs.Tab): Promise<void> => {
  if (!tab?.windowId || !tab.url) {
    return;
  }
  await browser.tabs.create({
    url: `view-source:${tab.url}`,
    windowId: tab.windowId,
    index: tab.index + 1,
  });
};

export const previousTab = async (tab: Browser.tabs.Tab): Promise<void> => {
  if (!tab?.id || !tab.windowId || tab.index === 0) {
    return;
  }
  const tabs = await browser.tabs.query({ windowId: tab.windowId });
  if (tabs.length === 0) {
    return;
  }
  for (const targetTab of tabs.reverse()) {
    if (targetTab.id && targetTab.index < tab.index) {
      await browser.tabs.update(targetTab.id, { active: true });
      return;
    }
  }
};

export const nextTab = async (tab: Browser.tabs.Tab): Promise<void> => {
  if (!tab?.id || !tab.windowId) {
    return;
  }
  const tabs = await browser.tabs.query({ windowId: tab.windowId });
  if (tabs.length === 0) {
    return;
  }
  for (const targetTab of tabs) {
    if (targetTab.id && tab.index < targetTab.index) {
      await browser.tabs.update(targetTab.id, { active: true });
      return;
    }
  }
};

export const pageBack = async (tab: Browser.tabs.Tab): Promise<void> => {
  if (!tab?.id) {
    return;
  }
  try {
    await browser.tabs.goBack(tab.id);
  } catch {
    /* empty */
  }
};

export const pageForward = async (tab: Browser.tabs.Tab): Promise<void> => {
  if (!tab?.id) {
    return;
  }
  try {
    await browser.tabs.goForward(tab.id);
  } catch {
    /* empty */
  }
};

export const newWindow = async (): Promise<void> => {
  await browser.windows.create({
    url:
      settingsStore.getState().newTabUrl === 'homepage'
        ? undefined
        : settingsStore.getState().newTabUrl,
  });
};

export const newWindowLink = async (links: LinkMessage[]): Promise<void> => {
  if (links.length === 0) {
    return;
  }
  for (const link of links) {
    await browser.windows.create({ url: link.src });
  }
};

export const closeWindow = async (tab: Browser.tabs.Tab): Promise<void> => {
  if (!tab?.windowId) {
    return;
  }
  await browser.windows.remove(tab.windowId);
};

export const splitTabs = async (tab: Browser.tabs.Tab): Promise<void> => {
  if (!tab?.id || !tab.windowId) {
    return;
  }
  const tabs = await browser.tabs.query({ windowId: tab.windowId });
  if (tabs.length === 0) {
    return;
  }
  const win = await browser.windows.create({
    tabId: tab.id,
    focused: true,
    incognito: tab.incognito,
  });
  if (!win.id) {
    return;
  }
  for (const targetTab of tabs) {
    if (targetTab.id && tab.index < targetTab.index) {
      await browser.tabs.move(targetTab.id, {
        windowId: win.id,
        index: targetTab.index - tab.index + 1,
      });
    }
  }
};

export const options = async (tab: Browser.tabs.Tab): Promise<void> => {
  if (!tab?.windowId) {
    return;
  }
  await browser.tabs.create({
    url: browser.runtime.getURL('/options.html'),
    windowId: tab.windowId,
  });
};

export const pageBackClose = async (tab: Browser.tabs.Tab): Promise<void> => {
  if (!tab?.id || !tab.url) {
    return;
  }
  try {
    await browser.tabs.goBack(tab.id);
  } catch {
    /* empty */
  }
  await delay(400);
  const targetTab = await browser.tabs.get(tab.id);
  if (targetTab.url !== tab.url) {
    return;
  }
  await browser.tabs.remove(tab.id);
};

export const gotoTop = async (tab: Browser.tabs.Tab): Promise<void> => {
  if (!tab?.id) {
    return;
  }
  await sendMessage('gotoTop', undefined, tab.id);
};

export const gotoBottom = async (tab: Browser.tabs.Tab): Promise<void> => {
  if (!tab?.id) {
    return;
  }
  await sendMessage('gotoBottom', undefined, tab.id);
};

export const pageUp = async (tab: Browser.tabs.Tab): Promise<void> => {
  if (!tab?.id) {
    return;
  }
  await sendMessage('pageUp', undefined, tab.id);
};

export const pageDown = async (tab: Browser.tabs.Tab): Promise<void> => {
  if (!tab?.id) {
    return;
  }
  await sendMessage('pageDown', undefined, tab.id);
};

export const pageNext = async (tab: Browser.tabs.Tab): Promise<void> => {
  if (!tab?.id) {
    return;
  }
  await sendMessage('pageNext', undefined, tab.id);
};

export const pagePrevious = async (tab: Browser.tabs.Tab): Promise<void> => {
  if (!tab?.id) {
    return;
  }
  await sendMessage('pagePrevious', undefined, tab.id);
};

export const fullscreenWindow = async (tab: Browser.tabs.Tab): Promise<void> => {
  if (!tab?.windowId) {
    return;
  }
  const win = await browser.windows.get(tab.windowId);
  if (!win.id) {
    return;
  }
  await browser.windows.update(win.id, {
    state: win.state === 'fullscreen' ? 'normal' : 'fullscreen',
  });
};

export const minimizeWindow = async (tab: Browser.tabs.Tab): Promise<void> => {
  if (!tab?.windowId) {
    return;
  }
  const win = await browser.windows.get(tab.windowId);
  if (!win.id) {
    return;
  }
  await browser.windows.update(win.id, {
    state: win.state === 'minimized' ? 'normal' : 'minimized',
  });
};

export const maximizeWindow = async (tab: Browser.tabs.Tab): Promise<void> => {
  if (!tab?.windowId) {
    return;
  }
  const win = await browser.windows.get(tab.windowId);
  if (!win.id) {
    return;
  }
  await browser.windows.update(win.id, {
    state: win.state === 'maximized' ? 'normal' : 'maximized',
  });
};

export const openScreenshot = async (tab: Browser.tabs.Tab): Promise<void> => {
  if (!tab?.id || !tab.windowId) {
    return;
  }
  await browser.tabs.update(tab.id, { active: true });
  await delay(100);
  const dataUrl = await browser.tabs.captureVisibleTab(tab.windowId, {
    format: 'png',
  });
  await browser.tabs.create({ url: dataUrl });
};

export const saveScreenshot = async (tab: Browser.tabs.Tab): Promise<void> => {
  if (!tab?.id) {
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

export const cloneTab = async (tab: Browser.tabs.Tab): Promise<void> => {
  if (!tab?.id) {
    return;
  }
  await browser.tabs.duplicate(tab.id);
};

export const zoomIn = async (tab: Browser.tabs.Tab): Promise<void> => {
  if (!tab?.id) {
    return;
  }
  const currentZoomFactor = await browser.tabs.getZoom(tab.id);
  const nextZoomFactor = [...ZOOM_FACTORS].find(
    (zoomFactor) => currentZoomFactor + Number.EPSILON < zoomFactor,
  );
  if (!nextZoomFactor) {
    return;
  }
  await browser.tabs.setZoom(tab.id, nextZoomFactor);
};

export const zoomOut = async (tab: Browser.tabs.Tab): Promise<void> => {
  if (!tab?.id) {
    return;
  }
  const currentZoomFactor = await browser.tabs.getZoom(tab.id);
  const nextZoomFactor = [...ZOOM_FACTORS]
    .reverse()
    .find((zoomFactor) => zoomFactor < currentZoomFactor - Number.EPSILON);
  if (!nextZoomFactor) {
    return;
  }
  await browser.tabs.setZoom(tab.id, nextZoomFactor);
};

export const zoomZero = async (tab: Browser.tabs.Tab): Promise<void> => {
  if (!tab?.id) {
    return;
  }
  await browser.tabs.setZoom(tab.id, 0);
};

export const zoomImgIn = async (tab: Browser.tabs.Tab, images: ImageMessage[]): Promise<void> => {
  if (!tab?.id || images.length === 0) {
    return;
  }
  await sendMessage('zoomImgIn', images, tab.id);
};

export const zoomImgOut = async (tab: Browser.tabs.Tab, images: ImageMessage[]): Promise<void> => {
  if (!tab?.id || images.length === 0) {
    return;
  }
  await sendMessage('zoomImgOut', images, tab.id);
};

export const zoomImgZero = async (tab: Browser.tabs.Tab, images: ImageMessage[]): Promise<void> => {
  if (!tab?.id || images.length === 0) {
    return;
  }
  await sendMessage('zoomImgZero', images, tab.id);
};

export const tabToLeft = async (tab: Browser.tabs.Tab): Promise<void> => {
  if (!tab?.id || tab.index === 0) {
    return;
  }
  await browser.tabs.move(tab.id, { index: tab.index - 1 });
};

export const tabToRight = async (tab: Browser.tabs.Tab): Promise<void> => {
  if (!tab?.id) {
    return;
  }
  await browser.tabs.move(tab.id, { index: tab.index + 1 });
};

export const parentDirectory = async (tab: Browser.tabs.Tab): Promise<void> => {
  if (!tab?.id || !tab.url) {
    return;
  }
  const parts = tab.url.split('#')[0].split('?')[0].split('/');
  if (parts.at(-1) === '') {
    parts.pop();
  }
  const url = parts.length > 3 ? `${parts.slice(0, -1).join('/')}/` : `${parts.join('/')}/`;
  await browser.tabs.update(tab.id, { url });
};

export const openHistory = async (tab: Browser.tabs.Tab): Promise<void> => {
  if (!tab?.windowId) {
    return;
  }
  await browser.tabs.create({
    url: 'chrome://history/',
    windowId: tab.windowId,
  });
};

export const openDownloads = async (tab: Browser.tabs.Tab): Promise<void> => {
  if (!tab?.windowId) {
    return;
  }
  await browser.tabs.create({
    url: 'chrome://downloads/',
    windowId: tab.windowId,
  });
};

export const openExtensions = async (tab: Browser.tabs.Tab): Promise<void> => {
  if (!tab?.windowId) {
    return;
  }
  await browser.tabs.create({
    url: 'chrome://extensions/',
    windowId: tab.windowId,
  });
};

export const openBookmarks = async (tab: Browser.tabs.Tab): Promise<void> => {
  if (!tab?.windowId) {
    return;
  }
  await browser.tabs.create({
    url: 'chrome://bookmarks/',
    windowId: tab.windowId,
  });
};

export const openImage = async (tab: Browser.tabs.Tab, images: ImageMessage[]): Promise<void> => {
  if (!tab?.id || !tab.windowId || images.length === 0) {
    return;
  }
  for (const image of images) {
    await browser.tabs.create({
      url: image.src,
      openerTabId: tab.id,
      windowId: tab.windowId,
    });
  }
};

export const saveImage = async (images: ImageMessage[]): Promise<void> => {
  if (images.length === 0) {
    return;
  }
  for (const image of images) {
    await browser.downloads.download({ url: image.src });
  }
};

export const hideImage = async (tab: Browser.tabs.Tab, images: ImageMessage[]): Promise<void> => {
  if (!tab?.id || images.length === 0) {
    return;
  }
  await sendMessage('hideImage', images, tab.id);
};

export const showCookies = async (tab: Browser.tabs.Tab): Promise<void> => {
  if (!tab?.id) {
    return;
  }
  await sendMessage('showCookies', undefined, tab.id);
};

export const searchSel = async (tab: Browser.tabs.Tab, selection?: string): Promise<void> => {
  if (!tab?.id || !tab.windowId || !selection) {
    return;
  }
  await browser.tabs.create({
    url: `https://www.google.com/search?q=${selection}`,
    openerTabId: tab.id,
    windowId: tab.windowId,
    index: tab.index + 1,
  });
};

export const print = async (tab: Browser.tabs.Tab): Promise<void> => {
  if (!tab?.id) {
    return;
  }
  await sendMessage('print', undefined, tab.id);
};

export const togglePin = async (tab: Browser.tabs.Tab): Promise<void> => {
  if (!tab?.id) {
    return;
  }
  await browser.tabs.update(tab.id, { pinned: !tab.pinned });
};

export const pin = async (tab: Browser.tabs.Tab): Promise<void> => {
  if (!tab?.id) {
    return;
  }
  await browser.tabs.update(tab.id, { pinned: true });
};

export const unpin = async (tab: Browser.tabs.Tab): Promise<void> => {
  if (!tab?.id) {
    return;
  }
  await browser.tabs.update(tab.id, { pinned: false });
};

export const copy = async (tab: Browser.tabs.Tab, selection?: string): Promise<void> => {
  if (!tab?.id || !selection) {
    return;
  }
  await sendMessage('copy', selection, tab.id);
};

export const copyLink = async (tab: Browser.tabs.Tab, links: LinkMessage[]): Promise<void> => {
  if (!tab?.id || links.length === 0) {
    return;
  }
  await sendMessage('copyLink', links, tab.id);
};

export const findPrevious = async (tab: Browser.tabs.Tab, selection?: string) => {
  if (!tab?.id || !selection) {
    return;
  }
  await sendMessage('findPrevious', selection, tab.id);
};

export const findNext = async (tab: Browser.tabs.Tab, selection?: string) => {
  if (!tab?.id || !selection) {
    return;
  }
  await sendMessage('findNext', selection, tab.id);
};

export const toggleBookmark = async (tab: Browser.tabs.Tab): Promise<void> => {
  if (!tab?.url) {
    return;
  }
  const results = await browser.bookmarks.search(tab.url);
  await (results.length === 0
    ? browser.bookmarks.create({
        parentId: '2',
        title: tab.title,
        url: tab.url,
      })
    : browser.bookmarks.remove(results[0].id));
};

export const bookmark = async (tab: Browser.tabs.Tab): Promise<void> => {
  if (!tab?.url) {
    return;
  }
  await browser.bookmarks.create({
    parentId: '2',
    title: tab.title,
    url: tab.url,
  });
};

export const unbookmark = async (tab: Browser.tabs.Tab): Promise<void> => {
  if (!tab.url) {
    return;
  }
  const results = await browser.bookmarks.search(tab.url);
  if (results.length === 0) {
    return;
  }
  await browser.bookmarks.remove(results[0].id);
};

const createActions = (tab: Browser.tabs.Tab, { links, images, selection }: GestureMessage) => ({
  'new-tab': () => newTab(tab),
  newTabLink: () => newTabLink(tab, links),
  newTabBack: () => newTabBack(tab, links),
  navigateTab: () => navigateTab(tab),
  closeTab: () => closeTab(tab),
  closeOtherTabs: () => closeOtherTabs(tab),
  closeLeftTabs: () => closeLeftTabs(tab),
  closeRightTabs: () => closeRightTabs(tab),
  undoClose: () => undoClose(),
  reloadTab: () => reloadTab(tab),
  reloadTabFull: () => reloadTabFull(tab),
  reloadAllTabs: () => reloadAllTabs(tab),
  stop: () => stop(tab),
  viewSource: () => viewSource(tab),
  'previous-tab-by-order': () => previousTab(tab),
  'next-tab-by-order': () => nextTab(tab),
  pageBack: () => pageBack(tab),
  pageForward: () => pageForward(tab),
  newWindow: () => newWindow(),
  newWindowLink: () => newWindowLink(links),
  closeWindow: () => closeWindow(tab),
  splitTabs: () => splitTabs(tab),
  options: () => options(tab),
  pageBackClose: () => pageBackClose(tab),
  gotoTop: () => gotoTop(tab),
  gotoBottom: () => gotoBottom(tab),
  'page-up': () => pageUp(tab),
  'page-down': () => pageDown(tab),
  pageNext: () => pageNext(tab),
  pagePrevious: () => pagePrevious(tab),
  fullscreenWindow: () => fullscreenWindow(tab),
  minimizeWindow: () => minimizeWindow(tab),
  maximizeWindow: () => maximizeWindow(tab),
  openScreenshot: () => openScreenshot(tab),
  saveScreenshot: () => saveScreenshot(tab),
  cloneTab: () => cloneTab(tab),
  zoomIn: () => zoomIn(tab),
  zoomOut: () => zoomOut(tab),
  zoomZero: () => zoomZero(tab),
  zoomImgIn: () => zoomImgIn(tab, images),
  zoomImgOut: () => zoomImgOut(tab, images),
  zoomImgZero: () => zoomImgZero(tab, images),
  tabToLeft: () => tabToLeft(tab),
  tabToRight: () => tabToRight(tab),
  parentDirectory: () => parentDirectory(tab),
  openHistory: () => openHistory(tab),
  openDownloads: () => openDownloads(tab),
  openExtensions: () => openExtensions(tab),
  openBookmarks: () => openBookmarks(tab),
  openImage: () => openImage(tab, images),
  saveImage: () => saveImage(images),
  hideImage: () => hideImage(tab, images),
  showCookies: () => showCookies(tab),
  searchSel: () => searchSel(tab, selection),
  print: () => print(tab),
  togglePin: () => togglePin(tab),
  pin: () => pin(tab),
  unpin: () => unpin(tab),
  copy: () => copy(tab, selection),
  copyLink: () => copyLink(tab, links),
  findPrevious: () => findPrevious(tab, selection),
  findNext: () => findNext(tab, selection),
  toggleBookmark: () => toggleBookmark(tab),
  bookmark: () => bookmark(tab),
  unbookmark: () => unbookmark(tab),
});

export default createActions;
