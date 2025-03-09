import browser, { Runtime, Tabs, Windows } from 'webextension-polyfill';

import { settingsStore } from '@/stores/settings-store';
import { ContentMessage as Message, Image, Link } from '@/types';

export type Actions = {
  'new-tab': () => Promise<void>;
  'new-tab-link': () => Promise<void>;
  'new-tab-back': () => Promise<void>;
  'navigate-tab': () => Promise<void>;
  'close-tab': () => Promise<void>;
  'close-other-tabs': () => Promise<void>;
  'close-left-tabs': () => Promise<void>;
  'close-right-tabs': () => Promise<void>;
  'undo-close': () => Promise<void>;
  'reload-tab': () => Promise<void>;
  'reload-tab-full': () => Promise<void>;
  'reload-all-tabs': () => Promise<void>;
  stop: () => Promise<void>;
  'view-source': () => Promise<void>;
  'prev-tab': () => Promise<void>;
  'next-tab': () => Promise<void>;
  'page-back': () => Promise<void>;
  'page-forward': () => Promise<void>;
  'new-window': () => Promise<void>;
  'new-window-link': () => Promise<void>;
  'close-window': () => Promise<void>;
  'split-tabs': () => Promise<void>;
  options: () => Promise<void>;
  'page-back-close': () => Promise<void>;
  'goto-top': () => Promise<void>;
  'goto-bottom': () => Promise<void>;
  'page-up': () => Promise<void>;
  'page-down': () => Promise<void>;
  'page-next': () => Promise<void>;
  'page-prev': () => Promise<void>;
  'fullscreen-window': () => Promise<void>;
  'minimize-window': () => Promise<void>;
  'maximize-window': () => Promise<void>;
  'open-screenshot': () => Promise<void>;
  'save-screenshot': () => Promise<void>;
  'open-screenshot-full': () => Promise<void>;
  'save-screenshot-full': () => Promise<void>;
  'clone-tab': () => Promise<void>;
  'zoom-in': () => Promise<void>;
  'zoom-out': () => Promise<void>;
  'zoom-zero': () => Promise<void>;
  'zoom-img-in': () => Promise<void>;
  'zoom-img-out': () => Promise<void>;
  'zoom-img-zero': () => Promise<void>;
  'tab-to-left': () => Promise<void>;
  'tab-to-right': () => Promise<void>;
  'parent-dir': () => Promise<void>;
  'open-history': () => Promise<void>;
  'open-downloads': () => Promise<void>;
  'open-extensions': () => Promise<void>;
  'open-bookmarks': () => Promise<void>;
  'open-image': () => Promise<void>;
  'save-image': () => Promise<void>;
  'hide-image': () => Promise<void>;
  'show-cookies': () => Promise<void>;
  'search-sel': () => Promise<void>;
  print: () => void;
  'toggle-pin': () => Promise<void>;
  pin: () => Promise<void>;
  unpin: () => Promise<void>;
  copy: () => Promise<void>;
  'copy-link': () => Promise<void>;
  'find-prev': () => Promise<void>;
  'find-next': () => Promise<void>;
  'toggle-bookmark': () => Promise<void>;
  bookmark: () => Promise<void>;
  unbookmark: () => Promise<void>;
};

const ZOOM_FACTORS = [
  0.25, 0.33, 0.5, 0.67, 0.75, 0.8, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4, 5,
];

const newTab = async (_: any, sender: Runtime.MessageSender): Promise<void> => {
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

const newTabLink = async (message: Message, sender: Runtime.MessageSender): Promise<void> => {
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

const newTabBack = async (message: Message, sender: Runtime.MessageSender): Promise<void> => {
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

const navigateTab = async (_: any, sender: Runtime.MessageSender): Promise<void> => {
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

const closeTab = async (_: any, sender: Runtime.MessageSender): Promise<void> => {
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

const closeOtherTabs = async (_: any, sender: Runtime.MessageSender): Promise<void> => {
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

const closeLeftTabs = async (_: any, sender: Runtime.MessageSender): Promise<void> => {
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

const closeRightTabs = async (_: any, sender: Runtime.MessageSender): Promise<void> => {
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

const reloadTab = async (_: any, sender: Runtime.MessageSender): Promise<void> => {
  if (!sender.tab?.id) {
    return;
  }
  await browser.tabs.reload(sender.tab.id, { bypassCache: false });
};

const reloadTabFull = async (_: any, sender: Runtime.MessageSender): Promise<void> => {
  if (!sender.tab?.id) {
    return;
  }
  await browser.tabs.reload(sender.tab.id, { bypassCache: true });
};

const reloadAllTabs = async (_: any, sender: Runtime.MessageSender): Promise<void> => {
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

const stop = async (_: any, sender: Runtime.MessageSender): Promise<void> => {
  if (!sender.tab?.id) {
    return;
  }
  await browser.scripting.executeScript({
    target: { tabId: sender.tab.id },
    func: () => {
      window.stop();
    },
  });
};

const viewSource = async (_: any, sender: Runtime.MessageSender): Promise<void> => {
  if (!sender.tab?.windowId || !sender.url) {
    return;
  }
  await browser.tabs.create({
    url: `view-source:${sender.url}`,
    windowId: sender.tab.windowId,
    index: sender.tab.index + 1,
  });
};

const prevTab = async (_: any, sender: Runtime.MessageSender): Promise<void> => {
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

const nextTab = async (_: any, sender: Runtime.MessageSender): Promise<void> => {
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

const pageBack = async (_: any, sender: Runtime.MessageSender): Promise<void> => {
  if (!sender.tab?.id) {
    return;
  }
  try {
    await browser.tabs.goBack(sender.tab.id);
  } catch (error) {
    /* empty */
  }
};

const pageForward = async (_: any, sender: Runtime.MessageSender): Promise<void> => {
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

const newWindowLink = async (message: Message): Promise<void> => {
  if (!message.links?.length) {
    return;
  }
  const promises: Promise<Windows.Window>[] = [];
  for (let i = 0; i < message.links.length; i += 1) {
    promises.push(browser.windows.create({ url: message.links[i].src }));
  }
  await Promise.all(promises);
};

const closeWindow = async (_: any, sender: Runtime.MessageSender): Promise<void> => {
  if (!sender.tab?.windowId) {
    return;
  }
  await browser.windows.remove(sender.tab.windowId);
};

const splitTabs = async (_: any, sender: Runtime.MessageSender): Promise<void> => {
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

const options = async (_: any, sender: Runtime.MessageSender): Promise<void> => {
  if (!sender.tab?.windowId) {
    return;
  }
  await browser.tabs.create({
    url: browser.runtime.getURL('options.html'),
    windowId: sender.tab.windowId,
  });
};

const pageBackClose = async (_: any, sender: Runtime.MessageSender): Promise<void> => {
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

const gotoTop = async (_: any, sender: Runtime.MessageSender): Promise<void> => {
  if (!sender.tab?.id) {
    return;
  }
  await browser.scripting.executeScript({
    target: { tabId: sender.tab.id },
    func: () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    },
  });
};

const gotoBottom = async (_: any, sender: Runtime.MessageSender): Promise<void> => {
  if (!sender.tab?.id) {
    return;
  }
  await browser.scripting.executeScript({
    target: { tabId: sender.tab.id },
    func: () => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth',
      });
    },
  });
};

const pageUp = async (_: any, sender: Runtime.MessageSender): Promise<void> => {
  if (!sender.tab?.id) {
    return;
  }
  await browser.scripting.executeScript({
    target: { tabId: sender.tab.id },
    func: () => {
      window.scrollBy({
        top: -window.innerHeight * 0.8,
        behavior: 'smooth',
      });
    },
  });
};

const pageDown = async (_: any, sender: Runtime.MessageSender): Promise<void> => {
  if (!sender.tab?.id) {
    return;
  }
  await browser.scripting.executeScript({
    target: { tabId: sender.tab.id },
    func: () => {
      window.scrollBy({
        top: window.innerHeight * 0.8,
        behavior: 'smooth',
      });
    },
  });
};

const fullscreenWindow = async (_: any, sender: Runtime.MessageSender): Promise<void> => {
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

const minimizeWindow = async (_: any, sender: Runtime.MessageSender): Promise<void> => {
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

const maximizeWindow = async (_: any, sender: Runtime.MessageSender): Promise<void> => {
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

const openScreenshot = async (_: any, sender: Runtime.MessageSender): Promise<void> => {
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

const saveScreenshot = async (_: any, sender: Runtime.MessageSender): Promise<void> => {
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

// TODO
const openScreenshotFull = async (_: any, sender: Runtime.MessageSender) => {
  if (!sender.tab?.id) {
    return;
  }
  await browser.scripting.executeScript({
    target: { tabId: sender.tab.id },
    func: () => {},
  });
};

// TODO
const saveScreenshotFull = async (_: any, sender: Runtime.MessageSender) => {
  if (!sender.tab?.id) {
    return;
  }
  await browser.scripting.executeScript({
    target: { tabId: sender.tab.id },
    func: () => {},
  });
};

const cloneTab = async (_: any, sender: Runtime.MessageSender): Promise<void> => {
  if (!sender.tab?.id) {
    return;
  }
  await browser.tabs.duplicate(sender.tab.id);
};

const zoomIn = async (_: any, sender: Runtime.MessageSender): Promise<void> => {
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

const zoomOut = async (_: any, sender: Runtime.MessageSender): Promise<void> => {
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

const zoomZero = async (_: any, sender: Runtime.MessageSender): Promise<void> => {
  if (!sender.tab?.id) {
    return;
  }
  await browser.tabs.setZoom(sender.tab.id, 0);
};

const zoomImgIn = async (message: Message, sender: Runtime.MessageSender): Promise<void> => {
  if (!sender.tab?.id || !message.images?.length) {
    return;
  }
  await browser.scripting.executeScript({
    target: { tabId: sender.tab.id },
    args: [message.images],
    func: (images: Image[]) => {
      images.forEach((image) => {
        const img = document.querySelector<HTMLImageElement>(`img[gestureid="${image.gestureid}"]`);
        if (!img) {
          return;
        }
        if (!img.getAttribute('origsize')) {
          img.setAttribute('origsize', `${img.clientWidth}x${img.clientHeight}`);
        }
        img.style.width = `${img.clientWidth * 1.2}px`;
        img.style.height = `${img.clientHeight * 1.2}px`;
      });
    },
  });
};

const zoomImgOut = async (message: Message, sender: Runtime.MessageSender): Promise<void> => {
  if (!sender.tab?.id || !message.images?.length) {
    return;
  }
  await browser.scripting.executeScript({
    target: { tabId: sender.tab.id },
    args: [message.images],
    func: (images: Image[]) => {
      images.forEach((image) => {
        const img = document.querySelector<HTMLImageElement>(`img[gestureid="${image.gestureid}"]`);
        if (!img) {
          return;
        }
        if (!img.getAttribute('origsize')) {
          img.setAttribute('origsize', `${img.clientWidth}x${img.clientHeight}`);
        }
        img.style.width = `${img.clientWidth / 1.2}px`;
        img.style.height = `${img.clientHeight / 1.2}px`;
      });
    },
  });
};

const zoomImgZero = async (message: Message, sender: Runtime.MessageSender): Promise<void> => {
  if (!sender.tab?.id || !message.images?.length) {
    return;
  }
  await browser.scripting.executeScript({
    target: { tabId: sender.tab.id },
    args: [message.images],
    func: (images: Image[]) => {
      images.forEach((image) => {
        const img = document.querySelector<HTMLImageElement>(`img[gestureid="${image.gestureid}"]`);
        if (!img) {
          return;
        }
        const origsize = img.getAttribute('origsize');
        if (!origsize) {
          return;
        }
        const size = origsize.split('x');
        img.style.width = `${size[0]}px`;
        img.style.height = `${size[1]}px`;
      });
    },
  });
};

const tabToLeft = async (_: any, sender: Runtime.MessageSender): Promise<void> => {
  if (!sender.tab?.id) {
    return;
  }
  await browser.tabs.move(sender.tab.id, { index: Math.max(sender.tab.index - 1, 0) });
};

const tabToRight = async (_: any, sender: Runtime.MessageSender): Promise<void> => {
  if (!sender.tab?.id) {
    return;
  }
  await browser.tabs.move(sender.tab.id, { index: sender.tab.index + 1 });
};

const parentDir = async (_: any, sender: Runtime.MessageSender): Promise<void> => {
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

const openHistory = async (_: any, sender: Runtime.MessageSender): Promise<void> => {
  if (!sender.tab?.windowId) {
    return;
  }
  await browser.tabs.create({
    url: 'chrome://history/',
    windowId: sender.tab.windowId,
  });
};

const openDownloads = async (_: any, sender: Runtime.MessageSender): Promise<void> => {
  if (!sender.tab?.windowId) {
    return;
  }
  await browser.tabs.create({
    url: 'chrome://downloads/',
    windowId: sender.tab.windowId,
  });
};

const openExtensions = async (_: any, sender: Runtime.MessageSender): Promise<void> => {
  if (!sender.tab?.windowId) {
    return;
  }
  await browser.tabs.create({
    url: 'chrome://extensions/',
    windowId: sender.tab.windowId,
  });
};

const openBookmarks = async (_: any, sender: Runtime.MessageSender): Promise<void> => {
  if (!sender.tab?.windowId) {
    return;
  }
  await browser.tabs.create({
    url: 'chrome://bookmarks/',
    windowId: sender.tab.windowId,
  });
};

const openImage = async (message: Message, sender: Runtime.MessageSender): Promise<void> => {
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

const saveImage = async (message: Message): Promise<void> => {
  if (!message.images?.length) {
    return;
  }
  const promises: Promise<number>[] = [];
  for (let i = 0; i < message.images.length; i += 1) {
    promises.push(browser.downloads.download({ url: message.images[i].src }));
  }
  await Promise.all(promises);
};

const hideImage = async (message: Message, sender: Runtime.MessageSender): Promise<void> => {
  if (!sender.tab?.id || !message.images?.length) {
    return;
  }
  await browser.scripting.executeScript({
    target: { tabId: sender.tab.id },
    args: [message.images],
    func: (images: Image[]) => {
      images.forEach((image) => {
        const img = document.querySelector<HTMLImageElement>(`img[gestureid="${image.gestureid}"]`);
        if (!img) {
          return;
        }
        img.style.display = 'none';
      });
    },
  });
};

const showCookies = async (_: any, sender: Runtime.MessageSender): Promise<void> => {
  if (!sender.tab?.id) {
    return;
  }
  await browser.scripting.executeScript({
    target: { tabId: sender.tab.id },
    func: () => {
      // eslint-disable-next-line no-alert
      window.alert(
        `Cookies stored by this host or domain:\n${`\n${document.cookie}`
          .replace(/; /g, ';\n')
          .replace(/\n(.{192})([^\\n]{5})/gm, '\n$1\n        $2')
          .replace(/\n(.{100})([^\\n]{5})/gm, '\n$1\n        $2')}`,
      );
    },
  });
};

const searchSel = async (message: Message, sender: Runtime.MessageSender): Promise<void> => {
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

const print = async (_: any, sender: Runtime.MessageSender): Promise<void> => {
  if (!sender.tab?.id) {
    return;
  }
  await browser.scripting.executeScript({
    target: { tabId: sender.tab.id },
    func: () => {
      window.print();
    },
  });
};

const togglePin = async (_: any, sender: Runtime.MessageSender): Promise<void> => {
  if (!sender.tab?.id) {
    return;
  }
  await browser.tabs.update(sender.tab.id, { pinned: !sender.tab.pinned });
};

const pin = async (_: any, sender: Runtime.MessageSender): Promise<void> => {
  if (!sender.tab?.id) {
    return;
  }
  await browser.tabs.update(sender.tab.id, { pinned: true });
};

const unpin = async (_: any, sender: Runtime.MessageSender): Promise<void> => {
  if (!sender.tab?.id) {
    return;
  }
  await browser.tabs.update(sender.tab.id, { pinned: false });
};

const copy = async (message: Message, sender: Runtime.MessageSender): Promise<void> => {
  if (!sender.tab?.id || !message.selection) {
    return;
  }
  await browser.scripting.executeScript({
    target: { tabId: sender.tab.id },
    args: [message.selection],
    func: async (selection: string) => {
      await navigator.clipboard.writeText(selection);
    },
  });
};

const copyLink = async (message: Message, sender: Runtime.MessageSender): Promise<void> => {
  if (!sender.tab?.id || !message.links?.length) {
    return;
  }
  await browser.scripting.executeScript({
    target: { tabId: sender.tab.id },
    args: [message.links],
    func: async (links: Link[]) => {
      await navigator.clipboard.writeText(links[0].src);
    },
  });
};

const pageNext = async (_: any, sender: Runtime.MessageSender): Promise<void> => {
  if (!sender.tab?.id) {
    return;
  }
  await browser.scripting.executeScript({
    target: { tabId: sender.tab.id },
    func: () => {
      const rel = document.querySelector<HTMLLinkElement | HTMLAnchorElement>(
        'link[rel="next"][href], a[rel="next"][href]',
      );
      if (rel) {
        window.location.href = rel.href;
        return;
      }
      const anchors = document.querySelectorAll<HTMLAnchorElement>('a[href]');
      for (let i = 0; i < anchors.length; i += 1) {
        const anchor = anchors[i];
        if (/(next|次|下一页)/i.test(anchor.innerText)) {
          window.location.href = anchor.href;
          return;
        }
      }
    },
  });
};

const pagePrev = async (_: any, sender: Runtime.MessageSender): Promise<void> => {
  if (!sender.tab?.id) {
    return;
  }
  await browser.scripting.executeScript({
    target: { tabId: sender.tab.id },
    func: () => {
      const rel = document.querySelector<HTMLLinkElement | HTMLAnchorElement>(
        'link[rel="prev"][href], a[rel="prev"][href]',
      );
      if (rel) {
        window.location.href = rel.href;
        return;
      }
      const anchors = document.querySelectorAll<HTMLAnchorElement>('a[href]');
      for (let i = 0; i < anchors.length; i += 1) {
        const anchor = anchors[i];
        if (/(prev|前|上一页)/i.test(anchor.innerText)) {
          window.location.href = anchor.href;
          return;
        }
      }
    },
  });
};

const toggleBookmark = async (_: any, sender: Runtime.MessageSender): Promise<void> => {
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

const bookmark = async (_: any, sender: Runtime.MessageSender): Promise<void> => {
  if (!sender.tab || !sender.url) {
    return;
  }
  await browser.bookmarks.create({
    parentId: '2',
    title: sender.tab.title,
    url: sender.url,
  });
};

const unbookmark = async (_: any, sender: Runtime.MessageSender): Promise<void> => {
  if (!sender.url) {
    return;
  }
  const results = await browser.bookmarks.search(sender.url);
  if (!results.length) {
    return;
  }
  await browser.bookmarks.remove(results[0].id);
};

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
  'hide-image': hideImage,
  'save-image': saveImage,
  'show-cookies': showCookies,
  'search-sel': searchSel,
  print,
  'toggle-pin': togglePin,
  pin,
  unpin,
  copy,
  'copy-link': copyLink,
  'toggle-bookmark': toggleBookmark,
  bookmark,
  unbookmark,
};
