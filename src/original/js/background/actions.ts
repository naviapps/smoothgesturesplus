import browser from 'webextension-polyfill';

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
  stop: () => void;
  'view-source': () => Promise<void>;
  'prev-tab': () => Promise<void>;
  'next-tab': () => Promise<void>;
  'page-back': () => Promise<void>;
  'page-forward': () => Promise<void>;
  'new-window': () => Promise<void>;
  'new-window-link': () => Promise<void>;
  'close-window': () => Promise<void>;
  'split-tabs': () => Promise<void>;
  'merge-tabs': () => Promise<void>;
  options: () => Promise<void>;
  'page-back-close': () => Promise<void>;
  'goto-top': () => void;
  'goto-bottom': () => void;
  'page-up': () => void;
  'page-down': () => void;
  'page-next': () => void;
  'page-prev': () => void;
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
  'zoom-img-in': () => void;
  'zoom-img-out': () => void;
  'zoom-img-zero': () => void;
  'tab-to-left': () => Promise<void>;
  'tab-to-right': () => Promise<void>;
  'parent-dir': () => Promise<void>;
  'open-history': () => Promise<void>;
  'open-downloads': () => Promise<void>;
  'open-extensions': () => Promise<void>;
  'open-bookmarks': () => Promise<void>;
  'open-image': () => Promise<void>;
  'save-image': () => Promise<void>;
  'hide-image': () => void;
  'show-cookies': () => void;
  'search-sel': () => Promise<void>;
  print: () => void;
  'toggle-pin': () => Promise<void>;
  pin: () => Promise<void>;
  unpin: () => Promise<void>;
  copy: () => void;
  'copy-link': () => void;
  'find-prev': () => void;
  'find-next': () => void;
  'toggle-bookmark': () => Promise<void>;
  bookmark: () => Promise<void>;
  unbookmark: () => Promise<void>;
};

type Message = {
  startPoint?: unknown;
  links?: [
    {
      src?: string;
    },
  ];
  images?: [
    {
      src: string;
    },
  ];
  selection?: unknown;
};

type Settings = {
  newTabUrl?: string;
  newTabRight?: unknown;
  newTabLinkRight?: unknown;
  closeLastBlock?: unknown;
};

const ZOOM_FACTORS = [
  0.25, 0.33, 0.5, 0.67, 0.75, 0.8, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4, 5,
];

export const createActions = (
  message: Message,
  settings: Settings,
  sender: browser.Runtime.MessageSender,
  sendResponse: (response: unknown) => void,
): Actions => {
  const newTab = async () => {
    if (!sender.tab || !sender.tab.id || !sender.tab.windowId) {
      return;
    }
    const createProperties: browser.Tabs.CreateCreatePropertiesType = {
      openerTabId: sender.tab.id,
      windowId: sender.tab.windowId,
    };
    if (settings.newTabUrl !== 'homepage') {
      createProperties.url = settings.newTabUrl;
    }
    if (settings.newTabRight) {
      createProperties.index = sender.tab.index + 1;
    }
    await browser.tabs.create(createProperties);
  };

  const newTabLink = async () => {
    if (!sender.tab || !sender.tab.id || !sender.tab.windowId || !message.links) {
      return;
    }
    const promises: Promise<browser.Tabs.Tab>[] = [];
    for (let i = 0; i < message.links.length; i += 1) {
      const createProperties: browser.Tabs.CreateCreatePropertiesType = {
        openerTabId: sender.tab.id,
        windowId: sender.tab.windowId,
        url: message.links[i].src,
      };
      if (settings.newTabLinkRight) {
        createProperties.index = sender.tab.index + 1 + i;
      }
      promises.push(browser.tabs.create(createProperties));
    }
    await Promise.all(promises);
  };

  const newTabBack = async () => {
    if (!sender.tab || !sender.tab.id || !sender.tab.windowId || !message.links) {
      return;
    }
    const promises: Promise<browser.Tabs.Tab>[] = [];
    for (let i = 0; i < message.links.length; i += 1) {
      const createProperties: browser.Tabs.CreateCreatePropertiesType = {
        openerTabId: sender.tab.id,
        windowId: sender.tab.windowId,
        url: message.links[i].src,
        active: false,
      };
      if (settings.newTabLinkRight) {
        createProperties.index = sender.tab.index + 1 + i;
      }
      promises.push(browser.tabs.create(createProperties));
    }
    await Promise.all(promises);
  };

  const navigateTab = async () => {
    if (!sender.tab || !sender.tab.id) {
      return;
    }
    await browser.tabs.update(sender.tab.id, {
      url: settings.newTabUrl !== 'homepage' ? settings.newTabUrl : undefined,
    });
  };

  const closeTab = async () => {
    if (!sender.tab || !sender.tab.id || sender.tab.pinned) {
      return;
    }
    if (settings.closeLastBlock) {
      const wins = await browser.windows.getAll({ populate: true });
      if (wins.length === 1 && wins[0].tabs && wins[0].tabs.length === 1) {
        await browser.tabs.update(sender.tab.id, {
          url: settings.newTabUrl !== 'homepage' ? settings.newTabUrl : undefined,
        });
        return;
      }
    }
    await browser.tabs.remove(sender.tab.id);
  };

  const closeOtherTabs = async () => {
    if (!sender.tab || !sender.tab.windowId) {
      return;
    }
    const win = await browser.windows.get(sender.tab.windowId);
    if (!win.tabs) {
      return;
    }
    const promises: Promise<void>[] = [];
    for (let i = 0; i < win.tabs.length; i += 1) {
      const tab = win.tabs[i];
      if (tab.id && tab.id !== sender.tab.id && !tab.pinned) {
        promises.push(browser.tabs.remove(tab.id));
      }
    }
    await Promise.all(promises);
  };

  const closeLeftTabs = async () => {
    if (!sender.tab || !sender.tab.windowId) {
      return;
    }
    const win = await browser.windows.get(sender.tab.windowId);
    if (!win.tabs) {
      return;
    }
    const promises: Promise<void>[] = [];
    for (let i = 0; i < win.tabs.length; i += 1) {
      const tab = win.tabs[i];
      if (tab.id && tab.index < sender.tab.index && !tab.pinned) {
        promises.push(browser.tabs.remove(tab.id));
      }
    }
    await Promise.all(promises);
  };

  const closeRightTabs = async () => {
    if (!sender.tab || !sender.tab.windowId) {
      return;
    }
    const win = await browser.windows.get(sender.tab.windowId);
    if (!win.tabs) {
      return;
    }
    const promises: Promise<void>[] = [];
    for (let i = 0; i < win.tabs.length; i += 1) {
      const tab = win.tabs[i];
      if (tab.id && tab.index > sender.tab.index && !tab.pinned) {
        promises.push(browser.tabs.remove(tab.id));
      }
    }
    await Promise.all(promises);
  };

  const undoClose = async () => {
    await browser.sessions.restore();
  };

  const reloadTab = async () => {
    if (!sender.tab || !sender.tab.id) {
      return;
    }
    await browser.tabs.reload(sender.tab.id, { bypassCache: false });
  };

  const reloadTabFull = async () => {
    if (!sender.tab || !sender.tab.id) {
      return;
    }
    await browser.tabs.reload(sender.tab.id, { bypassCache: true });
  };

  const reloadAllTabs = async () => {
    if (!sender.tab || !sender.tab.windowId) {
      return;
    }
    const win = await browser.windows.get(sender.tab.windowId);
    if (!win.tabs) {
      return;
    }
    const promises: Promise<void>[] = [];
    for (let i = 0; i < win.tabs.length; i += 1) {
      const tab = win.tabs[i];
      if (tab.id) {
        promises.push(browser.tabs.reload(tab.id));
      }
    }
    await Promise.all(promises);
  };

  const stop = () => {
    sendResponse({ action: { id: 'stop' } });
  };

  const viewSource = async () => {
    if (!sender.tab || !sender.tab.windowId || !sender.url) {
      return;
    }
    await browser.tabs.create({
      url: `view-source:${sender.url}`,
      windowId: sender.tab.windowId,
      index: sender.tab.index + 1,
    });
  };

  const prevTab = async () => {
    if (!sender.tab || !sender.tab.id || !sender.tab.windowId) {
      return;
    }
    const win = await browser.windows.get(sender.tab.windowId);
    if (!win.tabs) {
      return;
    }
    let tab: browser.Tabs.Tab | undefined;
    for (let i = win.tabs.length - 1; i >= 0; i -= 1) {
      if (win.tabs[i].index < sender.tab.index) {
        tab = win.tabs[i];
        break;
      }
    }
    if (!tab || !tab.id) {
      return;
    }
    await browser.tabs.update(tab.id, { active: true });
  };

  const nextTab = async () => {
    if (!sender.tab || !sender.tab.id || !sender.tab.windowId) {
      return;
    }
    const win = await browser.windows.get(sender.tab.windowId);
    if (!win.tabs) {
      return;
    }
    let tab: browser.Tabs.Tab | undefined;
    for (let i = 1; i <= win.tabs.length; i += 1) {
      if (win.tabs[i].index > sender.tab.index) {
        tab = win.tabs[i];
        break;
      }
    }
    if (!tab || !tab.id) {
      return;
    }
    await browser.tabs.update(tab.id, { active: true });
  };

  const pageBack = async () => {
    if (!sender.tab || !sender.tab.id) {
      return;
    }
    await browser.tabs.goBack(sender.tab.id);
  };

  const pageForward = async () => {
    if (!sender.tab || !sender.tab.id) {
      return;
    }
    await browser.tabs.goForward(sender.tab.id);
  };

  const newWindow = async () => {
    await browser.windows.create({
      url: settings.newTabUrl !== 'homepage' ? settings.newTabUrl : undefined,
    });
  };

  const newWindowLink = async () => {
    if (!message.links) {
      return;
    }
    const promises: Promise<browser.Windows.Window>[] = [];
    for (let i = 0; i < message.links.length; i += 1) {
      promises.push(browser.windows.create({ url: message.links[i].src }));
    }
    await Promise.all(promises);
  };

  const closeWindow = async () => {
    if (!sender.tab || !sender.tab.windowId) {
      return;
    }
    await browser.windows.remove(sender.tab.windowId);
  };

  const splitTabs = async () => {
    if (!sender.tab || !sender.tab.id || !sender.tab.windowId) {
      return;
    }
    const currWin = await browser.windows.get(sender.tab.windowId);
    if (!currWin.tabs) {
      return;
    }
    const nextWin = await browser.windows.create({
      tabId: sender.tab.id,
      focused: true,
      incognito: sender.tab.incognito,
    });
    if (!nextWin.id) {
      return;
    }
    const promises: Promise<browser.Tabs.Tab | browser.Tabs.Tab[]>[] = [];
    for (let i = sender.tab.index + 1; i < currWin.tabs.length; i += 1) {
      const tab = currWin.tabs[i];
      if (tab.id) {
        promises.push(
          browser.tabs.move(tab.id, {
            windowId: nextWin.id,
            index: i - sender.tab.index,
          }),
        );
      }
    }
    await Promise.all(promises);
  };

  // TODO
  const mergeTabs = async () => {
    if (!sender.tab || !sender.tab.windowId) {
      return;
    }
    const currWin = await browser.windows.get(sender.tab.windowId);
    if (!currWin.tabs) {
      return;
    }
    //
    const t = [];
    for (const n in b) {
      if (b[n].focused > 0) {
        t.push([n, b[n]]);
      }
    }
    if (!(t.length < 2)) {
      t.sort((e, t) => {
        return t.focused < e.focused ? 1 : e.focused < t.focused ? -1 : 0;
      });
      const o = parseInt(t[t.length - 2][0]);
      if (o) {
        for (let i = 0; i < tabs.length; i += 1) {
          await browser.tabs.move(tabs[i].id, { windowId: o, index: 1000000 });
        }
        await browser.tabs.update(sender.tab.id, { active: true });
        await browser.windows.update(o, { focused: true });
      }
    }
  };

  const options = async () => {
    if (!sender.tab || !sender.tab.windowId) {
      return;
    }
    await browser.tabs.create({
      url: browser.runtime.getURL('options.html'),
      windowId: sender.tab.windowId,
    });
  };

  const pageBackClose = async () => {
    if (!sender.tab || !sender.tab.id) {
      return;
    }
    await browser.tabs.goBack(sender.tab.id);
    const tab = await browser.tabs.get(sender.tab.id);
    setTimeout(async () => {
      if (tab.id && tab.url === sender.url) {
        await browser.tabs.remove(tab.id);
      }
    }, 400);
  };

  const gotoTop = () => {
    sendResponse({
      action: { id: 'goto-top', startPoint: message.startPoint },
    });
  };

  const gotoBottom = () => {
    sendResponse({
      action: { id: 'goto-bottom', startPoint: message.startPoint },
    });
  };

  const pageUp = () => {
    sendResponse({ action: { id: 'page-up', startPoint: message.startPoint } });
  };

  const pageDown = () => {
    sendResponse({
      action: { id: 'page-down', startPoint: message.startPoint },
    });
  };

  const pageNext = () => {
    sendResponse({ action: { id: 'page-next' } });
  };

  const pagePrev = () => {
    sendResponse({ action: { id: 'page-prev' } });
  };

  const fullscreenWindow = async () => {
    if (!sender.tab || !sender.tab.windowId) {
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

  const minimizeWindow = async () => {
    if (!sender.tab || !sender.tab.windowId) {
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

  const maximizeWindow = async () => {
    if (!sender.tab || !sender.tab.windowId) {
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

  const openScreenshot = async () => {
    if (!sender.tab || !sender.tab.id) {
      return;
    }
    await browser.tabs.update(sender.tab.id, { active: true });
    setTimeout(async () => {
      if (sender.tab && sender.tab.windowId) {
        const dataUrl = await browser.tabs.captureVisibleTab(sender.tab.windowId, {
          format: 'png',
        });
        await browser.tabs.create({ url: dataUrl });
      }
    }, 100);
  };

  const saveScreenshot = async () => {
    if (!sender.tab || !sender.tab.id) {
      return;
    }
    await browser.tabs.update(sender.tab.id, { active: true });
    setTimeout(async () => {
      if (sender.tab && sender.tab.windowId) {
        const dataUrl = await browser.tabs.captureVisibleTab(sender.tab.windowId, {
          format: 'png',
        });
        await browser.downloads.download({
          filename: `screenshot${sender.url ? `-${new URL(sender.url).hostname}` : ''}.png`,
          url: dataUrl,
        });
      }
    }, 100);
  };

  const D = (e, t) => {
    const n = URL.createObjectURL(e);
    T(n, t);
    URL.revokeObjectURL(n);
  };

  const T = (e, t) => {
    const n = document.createElement('a');
    n.href = e;
    n.download = t || 'download';
    const o = document.createEvent('MouseEvents');
    o.initMouseEvent(
      'click',
      true,
      false,
      window,
      0,
      0,
      0,
      0,
      0,
      false,
      false,
      false,
      false,
      0,
      null,
    );
    n.dispatchEvent(o);
  };

  const U = (c, l) => {
    chrome.tabs.update(c.id, { active: true }, () => {
      chrome.tabs.executeScript(
        c.id,
        {
          code: 'var ssfo=document.body.style.overflow;document.body.style.overflow="hidden";var ssf={top:document.body.scrollTop,left:document.body.scrollLeft,height:document.body.scrollHeight,width:document.body.scrollWidth,screenh:window.innerHeight,screenw:window.innerWidth,overflow:ssfo};ssf;',
        },
        (e) => {
          const t = e[0];
          const n = document.createElement('canvas');
          n.height = Math.min(t.height, 32768);
          n.width = Math.min(t.width, 32768);
          const o = document.createElement('img');
          const i = n.getContext('2d');
          let a = 0;
          let r = 0;
          const s = () => {
            chrome.tabs.executeScript(
              c.id,
              {
                code: `document.body.scrollTop=${a * t.screenh};document.body.scrollLeft=${
                  r * t.screenw
                };`,
              },
              () => {
                setTimeout(() => {
                  chrome.tabs.captureVisibleTab(c.windowId, { format: 'png' }, (e) => {
                    o.src = e;
                  });
                }, 80);
              },
            );
          };
          o.addEventListener('load', () => {
            i.drawImage(
              o,
              0,
              0,
              o.width,
              o.height,
              Math.min(r * o.width, t.width - t.screenw),
              Math.min(a * o.height, t.height - t.screenh),
              o.width,
              o.height,
            );
            if (a + 1 < n.height / t.screenh) {
              a += 1;
              s();
            } else if (r + 1 < n.width / t.screenw) {
              a = 0;
              r += 1;
              s();
            } else {
              chrome.tabs.executeScript(
                c.id,
                {
                  code: `document.body.scrollTop=${t.top};document.body.scrollLeft=${t.left};document.body.style.overflow="${t.overflow}"`,
                },
                () => {
                  l(S(n.toDataURL()));
                },
              );
            }
          });
          s();
        },
      );
    });
  };

  const S = (e) => {
    const t = e.indexOf(',');
    const n = e.substr(0, t).match(/^data:([^;]+)(;.*)?$/);
    let o = e.substr(t + 1);
    if (n[2] === ';base64') {
      o = ((e) => {
        const t = atob(e);
        const n = new Array(t.length);
        for (let o = 0; o < t.length; o += 1) {
          n[o] = t.charCodeAt(o);
        }
        return new Uint8Array(n);
      })(o);
    }
    return new Blob([o], { type: n[1] });
  };

  // TODO
  const openScreenshotFull = async () => {
    const result = await browser.permissions.contains({
      permissions: ['devtools'],
    });
    if (!result) {
      const granted = await browser.permissions.request({
        permissions: ['bookmarks'],
      });
      if (!granted) {
        return;
      }
    }
    U(sender.tab, (e) => {
      browser.tabs.create({ url: URL.createObjectURL(e) });
    });
  };

  // TODO
  const saveScreenshotFull = async () => {
    const result = await browser.permissions.contains({
      permissions: ['bookmarks'],
    });
    if (!result) {
      const granted = await browser.permissions.request({
        permissions: ['bookmarks'],
      });
      if (!granted) {
        return;
      }
    }
    U(sender.tab, (e) => {
      D(e, `screenshot${sender.url ? `-${new URL(sender.url).hostname}` : ''}.png`);
    });
  };

  const cloneTab = async () => {
    if (!sender.tab || !sender.tab.id) {
      return;
    }
    await browser.tabs.duplicate(sender.tab.id);
  };

  const zoomIn = async () => {
    if (!sender.tab || !sender.tab.id) {
      return;
    }
    const currZoomFactor = await browser.tabs.getZoom();
    const nextZoomFactor = ZOOM_FACTORS.find((zoomFactor) => currZoomFactor < zoomFactor);
    if (!nextZoomFactor) {
      return;
    }
    await browser.tabs.setZoom(sender.tab.id, nextZoomFactor);
  };

  const zoomOut = async () => {
    if (!sender.tab || !sender.tab.id) {
      return;
    }
    const currZoomFactor = await browser.tabs.getZoom();
    const nextZoomFactor = ZOOM_FACTORS.reverse().find((zoomFactor) => currZoomFactor < zoomFactor);
    if (!nextZoomFactor) {
      return;
    }
    await browser.tabs.setZoom(sender.tab.id, nextZoomFactor);
  };

  const zoomZero = async () => {
    if (!sender.tab || !sender.tab.id) {
      return;
    }
    await browser.tabs.setZoom(sender.tab.id, 0);
  };

  const zoomImgIn = () => {
    if (!message.images) {
      return;
    }
    sendResponse({ action: { id: 'zoom-img-in', images: message.images } });
  };

  const zoomImgOut = () => {
    if (!message.images) {
      return;
    }
    sendResponse({ action: { id: 'zoom-img-out', images: message.images } });
  };

  const zoomImgZero = () => {
    if (!message.images) {
      return;
    }
    sendResponse({ action: { id: 'zoom-img-zero', images: message.images } });
  };

  const tabToLeft = async () => {
    if (!sender.tab || !sender.tab.id) {
      return;
    }
    await browser.tabs.move(sender.tab.id, {
      index: sender.tab.index > 0 ? sender.tab.index - 1 : 0,
    });
  };

  const tabToRight = async () => {
    if (!sender.tab || !sender.tab.id) {
      return;
    }
    await browser.tabs.move(sender.tab.id, { index: sender.tab.index + 1 });
  };

  const parentDir = async () => {
    if (!sender.tab || !sender.tab.id || !sender.url) {
      return;
    }
    const url = new URL(sender.url);
    if (url.pathname === '/') {
      return;
    }
    url.pathname = url.pathname.substring(0, url.pathname.lastIndexOf('/') + 1);
    await browser.tabs.update(sender.tab.id, { url: url.href });
  };

  const openHistory = async () => {
    if (!sender.tab || !sender.tab.windowId) {
      return;
    }
    await browser.tabs.create({
      url: 'chrome://history/',
      windowId: sender.tab.windowId,
    });
  };

  const openDownloads = async () => {
    if (!sender.tab || !sender.tab.windowId) {
      return;
    }
    await browser.tabs.create({
      url: 'chrome://downloads/',
      windowId: sender.tab.windowId,
    });
  };

  const openExtensions = async () => {
    if (!sender.tab || !sender.tab.windowId) {
      return;
    }
    await browser.tabs.create({
      url: 'chrome://extensions/',
      windowId: sender.tab.windowId,
    });
  };

  const openBookmarks = async () => {
    if (!sender.tab || !sender.tab.windowId) {
      return;
    }
    await browser.tabs.create({
      url: 'chrome://bookmarks/',
      windowId: sender.tab.windowId,
    });
  };

  const openImage = async () => {
    if (!sender.tab || !sender.tab.id || !sender.tab.windowId || !message.images) {
      return;
    }
    const promises: Promise<browser.Tabs.Tab>[] = [];
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

  const saveImage = async () => {
    if (!message.images) {
      return;
    }
    const promises: Promise<number>[] = [];
    for (let i = 0; i < message.images.length; i += 1) {
      promises.push(browser.downloads.download({ url: message.images[i].src }));
    }
    await Promise.all(promises);
  };

  const hideImage = () => {
    if (!message.images) {
      return;
    }
    sendResponse({ action: { id: 'hide-image', images: message.images } });
  };

  const showCookies = () => {
    sendResponse({ action: { id: 'show-cookies' } });
  };

  const searchSel = async () => {
    if (!sender.tab || !sender.tab.id || !sender.tab.windowId || !message.selection) {
      return;
    }
    await browser.tabs.create({
      url: `https://www.google.com/search?q=${message.selection}`,
      openerTabId: sender.tab.id,
      windowId: sender.tab.windowId,
      index: sender.tab.index + 1,
    });
  };

  const print = () => {
    sendResponse({ action: { id: 'print' } });
  };

  const togglePin = async () => {
    if (!sender.tab || !sender.tab.id) {
      return;
    }
    await browser.tabs.update(sender.tab.id, { pinned: !sender.tab.pinned });
  };

  const pin = async () => {
    if (!sender.tab || !sender.tab.id) {
      return;
    }
    await browser.tabs.update(sender.tab.id, { pinned: true });
  };

  const unpin = async () => {
    if (!sender.tab || !sender.tab.id) {
      return;
    }
    await browser.tabs.update(sender.tab.id, { pinned: false });
  };

  const copy = () => {
    if (!message.selection) {
      return;
    }
    sendResponse({ action: { id: 'copy', selection: message.selection } });
  };

  const copyLink = () => {
    if (!message.links) {
      return;
    }
    sendResponse({ action: { id: 'copy-link', links: message.links } });
  };

  const findPrev = () => {
    if (!message.selection) {
      return;
    }
    sendResponse({ action: { id: 'find-prev', selection: message.selection } });
  };

  const findNext = () => {
    if (!message.selection) {
      return;
    }
    sendResponse({ action: { id: 'find-next', selection: message.selection } });
  };

  const toggleBookmark = async () => {
    if (!sender.tab || !sender.url) {
      return;
    }
    const result = await browser.permissions.contains({
      permissions: ['bookmarks'],
    });
    if (!result) {
      const granted = await browser.permissions.request({
        permissions: ['bookmarks'],
      });
      if (!granted) {
        return;
      }
    }
    const results = await browser.bookmarks.search(sender.url);
    if (!results) {
      await browser.bookmarks.create({
        parentId: '2',
        title: sender.tab.title,
        url: sender.url,
      });
    } else {
      await browser.bookmarks.remove(results[0].id);
    }
  };

  const bookmark = async () => {
    if (!sender.tab || !sender.url) {
      return;
    }
    const result = await browser.permissions.contains({
      permissions: ['bookmarks'],
    });
    if (!result) {
      const granted = await browser.permissions.request({
        permissions: ['bookmarks'],
      });
      if (!granted) {
        return;
      }
    }
    await browser.bookmarks.create({
      parentId: '2',
      title: sender.tab.title,
      url: sender.url,
    });
  };

  const unbookmark = async () => {
    if (!sender.url) {
      return;
    }
    const result = await browser.permissions.contains({
      permissions: ['bookmarks'],
    });
    if (!result) {
      const granted = await browser.permissions.request({
        permissions: ['bookmarks'],
      });
      if (!granted) {
        return;
      }
    }
    const results = await browser.bookmarks.search(sender.url);
    if (results) {
      await browser.bookmarks.remove(results[0].id);
    }
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
