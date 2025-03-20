import { delay } from 'es-toolkit';
import { Tabs } from 'wxt/browser';

import { GestureMessage } from '@/entrypoints/background/messaging';
import { sendMessage } from '@/entrypoints/content/messaging';
import { settingsStore } from '@/stores/settings-store';
import { ImageMessage, LinkMessage } from '@/types';

const ZOOM_FACTORS = [
  0.25, 0.33, 0.5, 0.67, 0.75, 0.8, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4, 5,
];

export const newTab = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab?.id || !tab.windowId) {
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
  if (!tab?.id || !tab.windowId || !links.length) {
    return;
  }
  for (const [i, link] of links.entries()) {
    const createProperties: Tabs.CreateCreatePropertiesType = {
      openerTabId: tab.id,
      windowId: tab.windowId,
      url: link.src,
    };
    if (settingsStore.getState().newTabLinkRight) {
      createProperties.index = tab.index + 1 + i;
    }
    await browser.tabs.create(createProperties);
  }
};

export const newTabBack = async (tab: Tabs.Tab, links: LinkMessage[]): Promise<void> => {
  if (!tab?.id || !tab.windowId || !links.length) {
    return;
  }
  for (const [i, link] of links.entries()) {
    const createProperties: Tabs.CreateCreatePropertiesType = {
      openerTabId: tab.id,
      windowId: tab.windowId,
      url: link.src,
      active: false,
    };
    if (settingsStore.getState().newTabLinkRight) {
      createProperties.index = tab.index + 1 + i;
    }
    await browser.tabs.create(createProperties);
  }
};

export const navigateTab = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab?.id) {
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
  if (!tab?.id || tab.pinned) {
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

export const closeOtherTabs = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab?.windowId) {
    return;
  }
  const tabs = await browser.tabs.query({ windowId: tab.windowId });
  if (!tabs.length) {
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

export const closeLeftTabs = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab?.windowId) {
    return;
  }
  const tabs = await browser.tabs.query({ windowId: tab.windowId });
  if (!tabs.length) {
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

export const closeRightTabs = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab?.windowId) {
    return;
  }
  const tabs = await browser.tabs.query({ windowId: tab.windowId });
  if (!tabs.length) {
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

export const reloadTab = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab?.id) {
    return;
  }
  await browser.tabs.reload(tab.id, { bypassCache: false });
};

export const reloadTabFull = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab?.id) {
    return;
  }
  await browser.tabs.reload(tab.id, { bypassCache: true });
};

export const reloadAllTabs = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab?.windowId) {
    return;
  }
  const tabs = await browser.tabs.query({ windowId: tab.windowId });
  if (!tabs.length) {
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

export const stop = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab?.id) {
    return;
  }
  await sendMessage('stop', undefined, tab.id);
};

export const viewSource = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab?.windowId || !tab.url) {
    return;
  }
  await browser.tabs.create({
    url: `view-source:${tab.url}`,
    windowId: tab.windowId,
    index: tab.index + 1,
  });
};

export const prevTab = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab?.id || !tab.windowId || tab.index === 0) {
    return;
  }
  const tabs = await browser.tabs.query({ windowId: tab.windowId });
  if (!tabs.length) {
    return;
  }
  for (const targetTab of tabs.reverse()) {
    if (targetTab.id && targetTab.index < tab.index) {
      await browser.tabs.update(targetTab.id, { active: true });
      return;
    }
  }
};

export const nextTab = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab?.id || !tab.windowId) {
    return;
  }
  const tabs = await browser.tabs.query({ windowId: tab.windowId });
  if (!tabs.length) {
    return;
  }
  for (const targetTab of tabs) {
    if (targetTab.id && tab.index < targetTab.index) {
      await browser.tabs.update(targetTab.id, { active: true });
      return;
    }
  }
};

export const pageBack = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab?.id) {
    return;
  }
  try {
    await browser.tabs.goBack(tab.id);
  } catch (error) {
    /* empty */
  }
};

export const pageForward = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab?.id) {
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
  for (const link of links) {
    await browser.windows.create({ url: link.src });
  }
};

export const closeWindow = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab?.windowId) {
    return;
  }
  await browser.windows.remove(tab.windowId);
};

export const splitTabs = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab?.id || !tab.windowId) {
    return;
  }
  const tabs = await browser.tabs.query({ windowId: tab.windowId });
  if (!tabs.length) {
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

export const options = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab?.windowId) {
    return;
  }
  await browser.tabs.create({
    url: browser.runtime.getURL('/options.html'),
    windowId: tab.windowId,
  });
};

export const pageBackClose = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab?.id || !tab.url) {
    return;
  }
  try {
    await browser.tabs.goBack(tab.id);
  } catch (error) {
    /* empty */
  }
  await delay(400);
  const targetTab = await browser.tabs.get(tab.id);
  if (targetTab.url !== tab.url) {
    return;
  }
  await browser.tabs.remove(tab.id);
};

export const gotoTop = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab?.id) {
    return;
  }
  await sendMessage('gotoTop', undefined, tab.id);
};

export const gotoBottom = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab?.id) {
    return;
  }
  await sendMessage('gotoBottom', undefined, tab.id);
};

export const pageUp = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab?.id) {
    return;
  }
  await sendMessage('pageUp', undefined, tab.id);
};

export const pageDown = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab?.id) {
    return;
  }
  await sendMessage('pageDown', undefined, tab.id);
};

export const pageNext = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab?.id) {
    return;
  }
  await sendMessage('pageNext', undefined, tab.id);
};

export const pagePrev = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab?.id) {
    return;
  }
  await sendMessage('pagePrev', undefined, tab.id);
};

export const fullscreenWindow = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab?.windowId) {
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
  if (!tab?.windowId) {
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
  if (!tab?.windowId) {
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

export const saveScreenshot = async (tab: Tabs.Tab): Promise<void> => {
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

export const cloneTab = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab?.id) {
    return;
  }
  await browser.tabs.duplicate(tab.id);
};

export const zoomIn = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab?.id) {
    return;
  }
  const currZoomFactor = await browser.tabs.getZoom(tab.id);
  const nextZoomFactor = ZOOM_FACTORS.slice().find(
    (zoomFactor) => currZoomFactor + Number.EPSILON < zoomFactor,
  );
  if (!nextZoomFactor) {
    return;
  }
  await browser.tabs.setZoom(tab.id, nextZoomFactor);
};

export const zoomOut = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab?.id) {
    return;
  }
  const currZoomFactor = await browser.tabs.getZoom(tab.id);
  const nextZoomFactor = ZOOM_FACTORS.slice()
    .reverse()
    .find((zoomFactor) => zoomFactor < currZoomFactor - Number.EPSILON);
  if (!nextZoomFactor) {
    return;
  }
  await browser.tabs.setZoom(tab.id, nextZoomFactor);
};

export const zoomZero = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab?.id) {
    return;
  }
  await browser.tabs.setZoom(tab.id, 0);
};

export const zoomImgIn = async (tab: Tabs.Tab, images: ImageMessage[]): Promise<void> => {
  if (!tab?.id || !images.length) {
    return;
  }
  await sendMessage('zoomImgIn', images, tab.id);
};

export const zoomImgOut = async (tab: Tabs.Tab, images: ImageMessage[]): Promise<void> => {
  if (!tab?.id || !images.length) {
    return;
  }
  await sendMessage('zoomImgOut', images, tab.id);
};

export const zoomImgZero = async (tab: Tabs.Tab, images: ImageMessage[]): Promise<void> => {
  if (!tab?.id || !images.length) {
    return;
  }
  await sendMessage('zoomImgZero', images, tab.id);
};

export const tabToLeft = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab?.id || tab.index === 0) {
    return;
  }
  await browser.tabs.move(tab.id, { index: tab.index - 1 });
};

export const tabToRight = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab?.id) {
    return;
  }
  await browser.tabs.move(tab.id, { index: tab.index + 1 });
};

export const parentDir = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab?.id || !tab.url) {
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
  if (!tab?.windowId) {
    return;
  }
  await browser.tabs.create({
    url: 'chrome://history/',
    windowId: tab.windowId,
  });
};

export const openDownloads = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab?.windowId) {
    return;
  }
  await browser.tabs.create({
    url: 'chrome://downloads/',
    windowId: tab.windowId,
  });
};

export const openExtensions = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab?.windowId) {
    return;
  }
  await browser.tabs.create({
    url: 'chrome://extensions/',
    windowId: tab.windowId,
  });
};

export const openBookmarks = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab?.windowId) {
    return;
  }
  await browser.tabs.create({
    url: 'chrome://bookmarks/',
    windowId: tab.windowId,
  });
};

export const openImage = async (tab: Tabs.Tab, images: ImageMessage[]): Promise<void> => {
  if (!tab?.id || !tab.windowId || !images.length) {
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
  if (!images.length) {
    return;
  }
  for (const image of images) {
    await browser.downloads.download({ url: image.src });
  }
};

export const hideImage = async (tab: Tabs.Tab, images: ImageMessage[]): Promise<void> => {
  if (!tab?.id || !images.length) {
    return;
  }
  await sendMessage('hideImage', images, tab.id);
};

export const showCookies = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab?.id) {
    return;
  }
  await sendMessage('showCookies', undefined, tab.id);
};

export const searchSel = async (tab: Tabs.Tab, selection?: string): Promise<void> => {
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

export const print = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab?.id) {
    return;
  }
  await sendMessage('print', undefined, tab.id);
};

export const togglePin = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab?.id) {
    return;
  }
  await browser.tabs.update(tab.id, { pinned: !tab.pinned });
};

export const pin = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab?.id) {
    return;
  }
  await browser.tabs.update(tab.id, { pinned: true });
};

export const unpin = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab?.id) {
    return;
  }
  await browser.tabs.update(tab.id, { pinned: false });
};

export const copy = async (tab: Tabs.Tab, selection?: string): Promise<void> => {
  if (!tab?.id || !selection) {
    return;
  }
  await sendMessage('copy', selection, tab.id);
};

export const copyLink = async (tab: Tabs.Tab, links: LinkMessage[]): Promise<void> => {
  if (!tab?.id || !links.length) {
    return;
  }
  await sendMessage('copyLink', links, tab.id);
};

export const findPrev = async (tab: Tabs.Tab, selection?: string) => {
  if (!tab?.id || !selection) {
    return;
  }
  await sendMessage('findPrev', selection, tab.id);
};

export const findNext = async (tab: Tabs.Tab, selection?: string) => {
  if (!tab?.id || !selection) {
    return;
  }
  await sendMessage('findNext', selection, tab.id);
};

export const toggleBookmark = async (tab: Tabs.Tab): Promise<void> => {
  if (!tab?.url) {
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
  if (!tab?.url) {
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

const createActions = (tab: Tabs.Tab, { links, images, selection }: GestureMessage) => ({
  newTab: () => newTab(tab),
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
  prevTab: () => prevTab(tab),
  nextTab: () => nextTab(tab),
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
  pageUp: () => pageUp(tab),
  pageDown: () => pageDown(tab),
  pageNext: () => pageNext(tab),
  pagePrev: () => pagePrev(tab),
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
  parentDir: () => parentDir(tab),
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
  findPrev: () => findPrev(tab, selection),
  findNext: () => findNext(tab, selection),
  toggleBookmark: () => toggleBookmark(tab),
  bookmark: () => bookmark(tab),
  unbookmark: () => unbookmark(tab),
});

export default createActions;
