import { Runtime, Tabs, Windows } from 'wxt/browser';

import { settingsStore } from '@/stores/settings-store';
import { ContentMessage } from '@/types';
import { sendMessage } from '@/messaging.ts';

const ZOOM_FACTORS = [
  0.25, 0.33, 0.5, 0.67, 0.75, 0.8, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4, 5,
];

const createActions = (message: ContentMessage, sender: Runtime.MessageSender) => {
  const newTab = async (): Promise<void> => {
    if (!sender.tab?.id || !sender.tab.windowId) {
      return;
    }
    const createProperties: Tabs.CreateCreatePropertiesType = {
      openerTabId: sender.tab.id,
      windowId: sender.tab.windowId,
    };
    if (settingsStore.getState().newTabUrl !== 'homepage') {
      createProperties.url = settingsStore.getState().newTabUrl;
    }
    if (settingsStore.getState().newTabRight) {
      createProperties.index = sender.tab.index + 1;
    }
    await browser.tabs.create(createProperties);
  };

  const newTabLink = async (): Promise<void> => {
    if (!sender.tab?.id || !sender.tab.windowId || !message.links?.length) {
      return;
    }
    const promises: Promise<Tabs.Tab>[] = [];
    for (let i = 0; i < message.links.length; i += 1) {
      const createProperties: Tabs.CreateCreatePropertiesType = {
        openerTabId: sender.tab.id,
        windowId: sender.tab.windowId,
        url: message.links[i].src,
      };
      if (settingsStore.getState().newTabLinkRight) {
        createProperties.index = sender.tab.index + 1 + i;
      }
      promises.push(browser.tabs.create(createProperties));
    }
    await Promise.all(promises);
  };

  const newTabBack = async (): Promise<void> => {
    if (!sender.tab?.id || !sender.tab.windowId || !message.links?.length) {
      return;
    }
    const promises: Promise<Tabs.Tab>[] = [];
    for (let i = 0; i < message.links.length; i += 1) {
      const createProperties: Tabs.CreateCreatePropertiesType = {
        openerTabId: sender.tab.id,
        windowId: sender.tab.windowId,
        url: message.links[i].src,
        active: false,
      };
      if (settingsStore.getState().newTabLinkRight) {
        createProperties.index = sender.tab.index + 1 + i;
      }
      promises.push(browser.tabs.create(createProperties));
    }
    await Promise.all(promises);
  };

  const navigateTab = async (): Promise<void> => {
    if (!sender.tab?.id) {
      return;
    }
    await browser.tabs.update(sender.tab.id, {
      url:
        settingsStore.getState().newTabUrl !== 'homepage'
          ? settingsStore.getState().newTabUrl
          : undefined,
    });
  };

  const closeTab = async (): Promise<void> => {
    if (!sender.tab?.id || sender.tab.pinned) {
      return;
    }
    if (settingsStore.getState().closeLastBlock) {
      const wins = await browser.windows.getAll({ populate: true });
      if (wins.length === 1 && wins[0].tabs && wins[0].tabs.length === 1) {
        await browser.tabs.update(sender.tab.id, {
          url:
            settingsStore.getState().newTabUrl !== 'homepage'
              ? settingsStore.getState().newTabUrl
              : undefined,
        });
        return;
      }
    }
    await browser.tabs.remove(sender.tab.id);
  };

  const closeOtherTabs = async (): Promise<void> => {
    if (!sender.tab?.windowId) {
      return;
    }
    const tabs = await browser.tabs.query({ windowId: sender.tab.windowId });
    if (!tabs.length) {
      return;
    }
    const promises: Promise<void>[] = [];
    for (let i = 0; i < tabs.length; i += 1) {
      const tab = tabs[i];
      if (tab.id && tab.id !== sender.tab.id && !tab.pinned) {
        promises.push(browser.tabs.remove(tab.id));
      }
    }
    await Promise.all(promises);
  };

  const closeLeftTabs = async (): Promise<void> => {
    if (!sender.tab?.windowId) {
      return;
    }
    const tabs = await browser.tabs.query({ windowId: sender.tab.windowId });
    if (!tabs.length) {
      return;
    }
    const promises: Promise<void>[] = [];
    for (let i = 0; i < tabs.length; i += 1) {
      const tab = tabs[i];
      if (tab.id && tab.index < sender.tab.index && !tab.pinned) {
        promises.push(browser.tabs.remove(tab.id));
      }
    }
    await Promise.all(promises);
  };

  const closeRightTabs = async (): Promise<void> => {
    if (!sender.tab?.windowId) {
      return;
    }
    const tabs = await browser.tabs.query({ windowId: sender.tab.windowId });
    if (!tabs.length) {
      return;
    }
    const promises: Promise<void>[] = [];
    for (let i = 0; i < tabs.length; i += 1) {
      const tab = tabs[i];
      if (tab.id && tab.index > sender.tab.index && !tab.pinned) {
        promises.push(browser.tabs.remove(tab.id));
      }
    }
    await Promise.all(promises);
  };

  const undoClose = async (): Promise<void> => {
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

  const reloadTab = async (): Promise<void> => {
    if (!sender.tab?.id) {
      return;
    }
    await browser.tabs.reload(sender.tab.id, { bypassCache: false });
  };

  const reloadTabFull = async (): Promise<void> => {
    if (!sender.tab?.id) {
      return;
    }
    await browser.tabs.reload(sender.tab.id, { bypassCache: true });
  };

  const reloadAllTabs = async (): Promise<void> => {
    if (!sender.tab?.windowId) {
      return;
    }
    const tabs = await browser.tabs.query({ windowId: sender.tab.windowId });
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

  const stop = async (): Promise<void> => {
    if (!sender.tab?.id) {
      return;
    }
    await sendMessage('action-stop', undefined, sender.tab.id);
  };

  const viewSource = async (): Promise<void> => {
    if (!sender.tab?.windowId || !sender.url) {
      return;
    }
    await browser.tabs.create({
      url: `view-source:${sender.url}`,
      windowId: sender.tab.windowId,
      index: sender.tab.index + 1,
    });
  };

  const prevTab = async (): Promise<void> => {
    if (!sender.tab?.id || !sender.tab.windowId) {
      return;
    }
    const tabs = await browser.tabs.query({ windowId: sender.tab.windowId });
    if (!tabs.length) {
      return;
    }
    let tabId: number | undefined;
    for (let i = tabs.length - 1; i >= 0; i -= 1) {
      const tab = tabs[i];
      if (tab.id && tab.index < sender.tab.index) {
        tabId = tab.id;
        break;
      }
    }
    if (!tabId) {
      return;
    }
    await browser.tabs.update(tabId, { active: true });
  };

  const nextTab = async (): Promise<void> => {
    if (!sender.tab?.id || !sender.tab.windowId) {
      return;
    }
    const tabs = await browser.tabs.query({ windowId: sender.tab.windowId });
    if (!tabs.length) {
      return;
    }
    let tabId: number | undefined;
    for (let i = 1; i <= tabs.length; i += 1) {
      const tab = tabs[i];
      if (tab.id && sender.tab.index < tab.index) {
        tabId = tab.id;
        break;
      }
    }
    if (!tabId) {
      return;
    }
    await browser.tabs.update(tabId, { active: true });
  };

  const pageBack = async (): Promise<void> => {
    if (!sender.tab?.id) {
      return;
    }
    try {
      await browser.tabs.goBack(sender.tab.id);
    } catch (error) {
      /* empty */
    }
  };

  const pageForward = async (): Promise<void> => {
    if (!sender.tab?.id) {
      return;
    }
    try {
      await browser.tabs.goForward(sender.tab.id);
    } catch (error) {
      /* empty */
    }
  };

  const newWindow = async (): Promise<void> => {
    await browser.windows.create({
      url:
        settingsStore.getState().newTabUrl !== 'homepage'
          ? settingsStore.getState().newTabUrl
          : undefined,
    });
  };

  const newWindowLink = async (): Promise<void> => {
    if (!message.links?.length) {
      return;
    }
    const promises: Promise<Windows.Window>[] = [];
    for (let i = 0; i < message.links.length; i += 1) {
      promises.push(browser.windows.create({ url: message.links[i].src }));
    }
    await Promise.all(promises);
  };

  const closeWindow = async (): Promise<void> => {
    if (!sender.tab?.windowId) {
      return;
    }
    await browser.windows.remove(sender.tab.windowId);
  };

  const splitTabs = async (): Promise<void> => {
    if (!sender.tab?.id || !sender.tab.windowId) {
      return;
    }
    const tabs = await browser.tabs.query({ windowId: sender.tab.windowId });
    if (!tabs.length) {
      return;
    }
    const win = await browser.windows.create({
      tabId: sender.tab.id,
      focused: true,
      incognito: sender.tab.incognito,
    });
    if (!win.id) {
      return;
    }
    const promises: Promise<Tabs.Tab | Tabs.Tab[]>[] = [];
    for (let i = sender.tab.index + 1; i < tabs.length; i += 1) {
      const tab = tabs[i];
      if (tab.id) {
        promises.push(
          browser.tabs.move(tab.id, {
            windowId: win.id,
            index: i - sender.tab.index,
          }),
        );
      }
    }
    await Promise.all(promises);
  };

  const options = async (): Promise<void> => {
    if (!sender.tab?.windowId) {
      return;
    }
    await browser.tabs.create({
      url: browser.runtime.getURL('/options.html'),
      windowId: sender.tab.windowId,
    });
  };

  const pageBackClose = async (): Promise<void> => {
    if (!sender.tab?.id) {
      return;
    }
    const tabId = sender.tab.id;
    try {
      await browser.tabs.goBack(tabId);
    } catch (error) {
      /* empty */
    }
    setTimeout(async () => {
      const tab = await browser.tabs.get(tabId);
      if (tab.id && tab.url === sender.url) {
        await browser.tabs.remove(tab.id);
      }
    }, 400);
  };

  const gotoTop = async (): Promise<void> => {
    if (!sender.tab?.id) {
      return;
    }
    await sendMessage('action-goto-top', undefined, sender.tab.id);
  };

  const gotoBottom = async (): Promise<void> => {
    if (!sender.tab?.id) {
      return;
    }
    await sendMessage('action-goto-bottom', undefined, sender.tab.id);
  };

  const pageUp = async (): Promise<void> => {
    if (!sender.tab?.id) {
      return;
    }
    await sendMessage('action-page-up', undefined, sender.tab.id);
  };

  const pageDown = async (): Promise<void> => {
    if (!sender.tab?.id) {
      return;
    }
    await sendMessage('action-page-down', undefined, sender.tab.id);
  };

  const pageNext = async (): Promise<void> => {
    if (!sender.tab?.id) {
      return;
    }
    await sendMessage('action-page-next', undefined, sender.tab.id);
  };

  const pagePrev = async (): Promise<void> => {
    if (!sender.tab?.id) {
      return;
    }
    await sendMessage('action-page-prev', undefined, sender.tab.id);
  };

  const fullscreenWindow = async (): Promise<void> => {
    if (!sender.tab?.windowId) {
      return;
    }
    const win = await browser.windows.get(sender.tab.windowId);
    if (!win.id) {
      return;
    }
    await browser.windows.update(win.id, {
      state: win.state !== 'fullscreen' ? 'fullscreen' : 'normal',
    });
  };

  const minimizeWindow = async (): Promise<void> => {
    if (!sender.tab?.windowId) {
      return;
    }
    const win = await browser.windows.get(sender.tab.windowId);
    if (!win.id) {
      return;
    }
    await browser.windows.update(win.id, {
      state: win.state !== 'minimized' ? 'minimized' : 'normal',
    });
  };

  const maximizeWindow = async (): Promise<void> => {
    if (!sender.tab?.windowId) {
      return;
    }
    const win = await browser.windows.get(sender.tab.windowId);
    if (!win.id) {
      return;
    }
    await browser.windows.update(win.id, {
      state: win.state !== 'maximized' ? 'maximized' : 'normal',
    });
  };

  const openScreenshot = async (): Promise<void> => {
    if (!sender.tab?.id || !sender.tab.windowId) {
      return;
    }
    const { windowId } = sender.tab;
    await browser.tabs.update(sender.tab.id, { active: true });
    setTimeout(async () => {
      const dataUrl = await browser.tabs.captureVisibleTab(windowId, {
        format: 'png',
      });
      await browser.tabs.create({ url: dataUrl });
    }, 100);
  };

  const saveScreenshot = async (): Promise<void> => {
    if (!sender.tab?.id) {
      return;
    }
    const { windowId } = sender.tab;
    await browser.tabs.update(sender.tab.id, { active: true });
    setTimeout(async () => {
      const dataUrl = await browser.tabs.captureVisibleTab(windowId, {
        format: 'png',
      });
      await browser.downloads.download({
        filename: `screenshot${sender.url ? `-${new URL(sender.url).hostname}` : ''}.png`,
        url: dataUrl,
      });
    }, 100);
  };

  const cloneTab = async (): Promise<void> => {
    if (!sender.tab?.id) {
      return;
    }
    await browser.tabs.duplicate(sender.tab.id);
  };

  const zoomIn = async (): Promise<void> => {
    if (!sender.tab?.id) {
      return;
    }
    const currZoomFactor = (await browser.tabs.getZoom(sender.tab.id)) + Number.EPSILON;
    const nextZoomFactor = ZOOM_FACTORS.slice().find((zoomFactor) => currZoomFactor < zoomFactor);
    if (!nextZoomFactor) {
      return;
    }
    await browser.tabs.setZoom(sender.tab.id, nextZoomFactor);
  };

  const zoomOut = async (): Promise<void> => {
    if (!sender.tab?.id) {
      return;
    }
    const currZoomFactor = (await browser.tabs.getZoom(sender.tab.id)) - Number.EPSILON;
    const nextZoomFactor = ZOOM_FACTORS.slice()
      .reverse()
      .find((zoomFactor) => zoomFactor < currZoomFactor);
    if (!nextZoomFactor) {
      return;
    }
    await browser.tabs.setZoom(sender.tab.id, nextZoomFactor);
  };

  const zoomZero = async (): Promise<void> => {
    if (!sender.tab?.id) {
      return;
    }
    await browser.tabs.setZoom(sender.tab.id, 0);
  };

  const zoomImgIn = async (): Promise<void> => {
    if (!sender.tab?.id || !message.images?.length) {
      return;
    }
    await sendMessage('action-zoom-img-in', message.images, sender.tab.id);
  };

  const zoomImgOut = async (): Promise<void> => {
    if (!sender.tab?.id || !message.images?.length) {
      return;
    }
    await sendMessage('action-zoom-img-out', message.images, sender.tab.id);
  };

  const zoomImgZero = async (): Promise<void> => {
    if (!sender.tab?.id || !message.images?.length) {
      return;
    }
    await sendMessage('action-zoom-img-zero', message.images, sender.tab.id);
  };

  const tabToLeft = async (): Promise<void> => {
    if (!sender.tab?.id) {
      return;
    }
    await browser.tabs.move(sender.tab.id, { index: Math.max(sender.tab.index - 1, 0) });
  };

  const tabToRight = async (): Promise<void> => {
    if (!sender.tab?.id) {
      return;
    }
    await browser.tabs.move(sender.tab.id, { index: sender.tab.index + 1 });
  };

  const parentDir = async (): Promise<void> => {
    if (!sender.tab?.id || !sender.url) {
      return;
    }
    const parts = sender.url.split('#')[0].split('?')[0].split('/');
    if (parts[parts.length - 1] === '') {
      parts.pop();
    }
    const url = parts.length > 3 ? `${parts.slice(0, -1).join('/')}/` : `${parts.join('/')}/`;
    await browser.tabs.update(sender.tab.id, { url });
  };

  const openHistory = async (): Promise<void> => {
    if (!sender.tab?.windowId) {
      return;
    }
    await browser.tabs.create({
      url: 'chrome://history/',
      windowId: sender.tab.windowId,
    });
  };

  const openDownloads = async (): Promise<void> => {
    if (!sender.tab?.windowId) {
      return;
    }
    await browser.tabs.create({
      url: 'chrome://downloads/',
      windowId: sender.tab.windowId,
    });
  };

  const openExtensions = async (): Promise<void> => {
    if (!sender.tab?.windowId) {
      return;
    }
    await browser.tabs.create({
      url: 'chrome://extensions/',
      windowId: sender.tab.windowId,
    });
  };

  const openBookmarks = async (): Promise<void> => {
    if (!sender.tab?.windowId) {
      return;
    }
    await browser.tabs.create({
      url: 'chrome://bookmarks/',
      windowId: sender.tab.windowId,
    });
  };

  const openImage = async (): Promise<void> => {
    if (!sender.tab?.id || !sender.tab.windowId || !message.images?.length) {
      return;
    }
    const promises: Promise<Tabs.Tab>[] = [];
    for (let i = 0; i < message.images.length; i += 1) {
      promises.push(
        browser.tabs.create({
          url: message.images[i].src,
          openerTabId: sender.tab.id,
          windowId: sender.tab.windowId,
        }),
      );
    }
    await Promise.all(promises);
  };

  const saveImage = async (): Promise<void> => {
    if (!message.images?.length) {
      return;
    }
    const promises: Promise<number>[] = [];
    for (let i = 0; i < message.images.length; i += 1) {
      promises.push(browser.downloads.download({ url: message.images[i].src }));
    }
    await Promise.all(promises);
  };

  const hideImage = async (): Promise<void> => {
    if (!sender.tab?.id || !message.images?.length) {
      return;
    }
    await sendMessage('action-hide-image', message.images, sender.tab.id);
  };

  const showCookies = async (): Promise<void> => {
    if (!sender.tab?.id) {
      return;
    }
    await sendMessage('action-show-cookies', undefined, sender.tab.id);
  };

  const searchSel = async (): Promise<void> => {
    if (!sender.tab?.id || !sender.tab.windowId || !message.selection) {
      return;
    }
    await browser.tabs.create({
      url: `https://www.google.com/search?q=${message.selection}`,
      openerTabId: sender.tab.id,
      windowId: sender.tab.windowId,
      index: sender.tab.index + 1,
    });
  };

  const print = async (): Promise<void> => {
    if (!sender.tab?.id) {
      return;
    }
    await sendMessage('action-print', undefined, sender.tab.id);
  };

  const togglePin = async (): Promise<void> => {
    if (!sender.tab?.id) {
      return;
    }
    await browser.tabs.update(sender.tab.id, { pinned: !sender.tab.pinned });
  };

  const pin = async (): Promise<void> => {
    if (!sender.tab?.id) {
      return;
    }
    await browser.tabs.update(sender.tab.id, { pinned: true });
  };

  const unpin = async (): Promise<void> => {
    if (!sender.tab?.id) {
      return;
    }
    await browser.tabs.update(sender.tab.id, { pinned: false });
  };

  const copy = async (): Promise<void> => {
    if (!sender.tab?.id || !message.selection) {
      return;
    }
    await sendMessage('action-copy', message.selection, sender.tab.id);
  };

  const copyLink = async (): Promise<void> => {
    if (!sender.tab?.id || !message.links?.length) {
      return;
    }
    await sendMessage('action-copy-link', message.links, sender.tab.id);
  };

  const findPrev = async () => {
    if (!sender.tab || !sender.tab.id || !message.selection) {
      return;
    }
    await sendMessage('action-find-prev', message.selection, sender.tab.id);
  };

  const findNext = async () => {
    if (!sender.tab || !sender.tab.id || !message.selection) {
      return;
    }
    await sendMessage('action-find-next', message.selection, sender.tab.id);
  };

  const toggleBookmark = async (): Promise<void> => {
    if (!sender.tab || !sender.url) {
      return;
    }
    const results = await browser.bookmarks.search(sender.url);
    if (!results.length) {
      await browser.bookmarks.create({
        parentId: '2',
        title: sender.tab.title,
        url: sender.url,
      });
    } else {
      await browser.bookmarks.remove(results[0].id);
    }
  };

  const bookmark = async (): Promise<void> => {
    if (!sender.tab || !sender.url) {
      return;
    }
    await browser.bookmarks.create({
      parentId: '2',
      title: sender.tab.title,
      url: sender.url,
    });
  };

  const unbookmark = async (): Promise<void> => {
    if (!sender.url) {
      return;
    }
    const results = await browser.bookmarks.search(sender.url);
    if (!results.length) {
      return;
    }
    await browser.bookmarks.remove(results[0].id);
  };

  return {
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
    'save-image': saveImage,
    'hide-image': hideImage,
    'show-cookies': showCookies,
    'search-sel': searchSel,
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
  };
};

export default createActions;
