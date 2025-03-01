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
  'merge-tabs': () => Promise<void>;
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
  print: () => Promise<void>;
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

export const createActions = (id, call, message, settings): Actions => {
  const tabId = id;

  const newTab = async () => {
    const tab = await browser.tabs.get(tabId);
    const createProperties: browser.Tabs.CreateCreatePropertiesType = {
      openerTabId: tab.id,
    };
    if (settings.newTabUrl !== 'homepage') {
      createProperties.url = settings.newTabUrl;
    }
    if (settings.newTabRight) {
      createProperties.index = tab.index + 1;
    }
    await browser.tabs.create(createProperties);
  };

  const newTabLink = async () => {
    const tab = await browser.tabs.get(tabId);
    const promises: Promise<browser.Tabs.Tab>[] = [];
    for (let i = 0; i < message.links.length; i += 1) {
      const createProperties: browser.Tabs.CreateCreatePropertiesType = {
        openerTabId: tab.id,
        windowId: tab.windowId,
        url: message.links[i].src,
      };
      if (settings.newTabLinkRight) {
        createProperties.index = tab.index + 1 + i;
      }
      promises.push(browser.tabs.create(createProperties));
    }
    await Promise.all(promises);
  };

  const newTabBack = async () => {
    const tab = await browser.tabs.get(tabId);
    const promises: Promise<browser.Tabs.Tab>[] = [];
    for (let i = 0; i < message.links.length; i += 1) {
      const createProperties: browser.Tabs.CreateCreatePropertiesType = {
        openerTabId: tab.id,
        windowId: tab.windowId,
        url: message.links[i].src,
        active: false,
      };
      if (settings.newTabLinkRight) {
        createProperties.index = tab.index + 1 + i;
      }
      promises.push(browser.tabs.create(createProperties));
    }
    await Promise.all(promises);
  };

  const navigateTab = async () => {
    await browser.tabs.update(tabId, {
      url: settings.newTabUrl !== 'homepage' ? settings.newTabUrl : undefined,
    });
  };

  const closeTab = async () => {
    const tab = await browser.tabs.get(tabId);
    if (tab.pinned) {
      return;
    }
    if (settings.closeLastBlock) {
      const wins = await browser.windows.getAll({ populate: true });
      if (wins.length === 1 && wins[0].tabs?.length === 1) {
        await browser.tabs.update(tabId, {
          url: settings.newTabUrl !== 'homepage' ? settings.newTabUrl : undefined,
        });
        return;
      }
    }
    await browser.tabs.remove(tabId);
  };

  const closeOtherTabs = async () => {
    const tab = await browser.tabs.get(tabId);
    browser.tabs.query({ windowId: tab.windowId }, (e) => {
      for (let i = 0; i < e.length; i += 1) {
        e[i].id == tab.id || e[i].pinned || browser.tabs.remove(e[i].id);
      }
    });
  };

  const closeLeftTabs = async () => {
    const tab = await browser.tabs.get(tabId);
    browser.tabs.query({ windowId: tab.windowId }, (e) => {
      for (let i = 0; i < e.length; i += 1) {
        e[i].index < tab.index && !tab.pinned && browser.tabs.remove(e[i].id);
      }
    });
  };

  const closeRightTabs = async () => {
    const tab = await browser.tabs.get(tabId);
    browser.tabs.query({ windowId: tab.windowId }, (e) => {
      for (let i = 0; i < e.length; i += 1) {
        e[i].index > tab.index && !tab.pinned && browser.tabs.remove(e[i].id);
      }
    });
  };

  const undoClose = async () => {
    if (f.closed.length > 0) {
      const n = f.closed.pop();
      browser.tabs.create(
        {
          url: n.history[n.history.length - 1],
          index: n.index,
          windowId: n.winId,
          active: true,
        },
        call,
      );
    }
  };

  const reloadTab = async () => {
    await browser.tabs.reload(tabId, { bypassCache: false });
  };

  const reloadTabFull = async () => {
    await browser.tabs.reload(tabId, { bypassCache: true });
  };

  const reloadAllTabs = async () => {
    const tab = await browser.tabs.get(tabId);
    browser.tabs.query({ windowId: tab.windowId }, (e) => {
      for (i = 0; i < e.length; i += 1) browser.tabs.reload(e[i].id);
      call();
    });
  };

  const stop = async () => {
    contents[id].postMessage({ action: { id: 'stop' } }, call);
  };

  const viewSource = async () => {
    const tab = await browser.tabs.get(tabId);
    await browser.tabs.create({
      url: `view-source:${contents[id].detail.url ? contents[id].detail.url : tab.url}`,
      windowId: tab.windowId,
      index: tab.index + 1,
    });
  };

  const prevTab = async () => {
    const tab = await browser.tabs.get(tabId);
    browser.tabs.query({ windowId: tab.windowId }, (e) => {
      let t = null;
      for (i = e.length - 1; i >= 0; i -= 1)
        if (((t = e[(tab.index + i) % e.length].id), contentForTab(t)))
          return void browser.tabs.update(t, { active: true }, call);
      call();
    });
  };

  const nextTab = async () => {
    const tab = await browser.tabs.get(tabId);
    browser.tabs.query({ windowId: tab.windowId }, (e) => {
      let t = null;
      for (i = 1; i <= e.length; i += 1)
        if (((t = e[(tab.index + i) % e.length].id), contentForTab(t)))
          return void browser.tabs.update(t, { active: true }, call);
      call();
    });
  };

  const pageBack = async () => {
    await browser.tabs.goBack(tabId);
  };

  const pageForward = async () => {
    await browser.tabs.goForward(tabId);
  };

  const newWindow = async () => {
    await browser.windows.create({
      url: settings.newTabUrl !== 'homepage' ? settings.newTabUrl : undefined,
    });
  };

  const newWindowLink = async () => {
    const promises: Promise<browser.Windows.Window>[] = [];
    for (let i = 0; i < message.links.length; i += 1) {
      promises.push(browser.windows.create({ url: message.links[i].src }));
    }
    await Promise.all(promises);
  };

  const closeWindow = async () => {
    browser.windows.getCurrent((e) => {
      browser.windows.remove(e.id, call);
    });
  };

  const splitTabs = async () => {
    const tab = await browser.tabs.get(tabId);
    browser.tabs.query({ windowId: tab.windowId }, (t) => {
      browser.windows.create({ tabId: tab.id, focused: true, incognito: tab.incognito }, (e) => {
        for (i = tab.index + 1; i < t.length; i += 1)
          browser.tabs.move(t[i].id, { windowId: e.id, index: i - tab.index });
      });
    });
  };

  const mergeTabs = async () => {
    const tab = await browser.tabs.get(tabId);
    browser.tabs.query({ windowId: tab.windowId }, (e) => {
      const t = [];
      for (const n in b) b[n].focused > 0 && t.push([n, b[n]]);
      if (!(t.length < 2)) {
        t.sort((e, t) => {
          return e.focused > t.focused ? 1 : e.focused < t.focused ? -1 : 0;
        });
        const o = parseInt(t[t.length - 2][0]);
        if (o) {
          for (i = 0; i < e.length; i += 1)
            browser.tabs.move(e[i].id, { windowId: o, index: 1000000 });
          browser.tabs.update(tab.id, { active: true }, () => {
            browser.windows.update(o, { focused: true }, call);
          });
        }
      }
    });
  };

  const options = async () => {
    const tab = await browser.tabs.get(tabId);
    browser.tabs.create(
      { url: browser.runtime.getURL('options.html'), windowId: tab.windowId },
      call,
    );
  };

  const pageBackClose = async () => {
    contents[id].postMessage(
      {
        action: {
          id: 'page-back-close',
          has_history: f.tab[tabId].history.length > 1,
        },
      },
      call,
    );
  };

  const gotoTop = async () => {
    contents[id].postMessage({ action: { id: 'goto-top', startPoint: message.startPoint } }, call);
  };

  const gotoBottom = async () => {
    contents[id].postMessage(
      { action: { id: 'goto-bottom', startPoint: message.startPoint } },
      call,
    );
  };

  const pageUp = async () => {
    contents[id].postMessage({ action: { id: 'page-up', startPoint: message.startPoint } }, call);
  };

  const pageDown = async () => {
    contents[id].postMessage({ action: { id: 'page-down', startPoint: message.startPoint } }, call);
  };

  const pageNext = async () => {
    O(
      id,
      () => {
        let e = null;
        if ((e = document.querySelector('link[rel=next][href]'))) window.location.href = e.href;
        else if ((e = document.querySelector('a[rel=next][href]'))) window.location.href = e.href;
        else {
          e = document.querySelectorAll('a[href]');
          for (var t = 0; t < e.length; t += 1)
            if (e[t].innerText.match(/(next|下一页|下页)/i))
              return void (window.location.href = e[t].href);
          e = document.querySelectorAll('a[href]');
          for (t = 0; t < e.length; t += 1)
            if (e[t].innerText.match(/(>|›)/i)) return void (window.location.href = e[t].href);
        }
      },
      call,
    );
  };

  const pagePrev = async () => {
    O(
      id,
      () => {
        let e = null;
        if ((e = document.querySelector('link[rel=prev][href]'))) window.location.href = e.href;
        else if ((e = document.querySelector('a[rel=prev][href]'))) window.location.href = e.href;
        else {
          e = document.querySelectorAll('a[href]');
          for (var t = 0; t < e.length; t += 1)
            if (e[t].innerText.match(/(prev|上一页|上页)/i))
              return void (window.location.href = e[t].href);
          e = document.querySelectorAll('a[href]');
          for (t = 0; t < e.length; t += 1)
            if (e[t].innerText.match(/(<|‹)/i)) return void (window.location.href = e[t].href);
        }
      },
      call,
    );
  };

  const fullscreenWindow = async () => {
    const tab = await browser.tabs.get(tabId);
    browser.windows.get(tab.windowId, (e) => {
      b[e.id] || (b[e.id] = {}),
        browser.windows.update(
          e.id,
          {
            state: e.state !== 'fullscreen' ? 'fullscreen' : b[e.id].prevstate || 'normal',
          },
          call,
        ),
        (b[e.id].prevstate = e.state);
    });
  };

  const minimizeWindow = async () => {
    const tab = await browser.tabs.get(tabId);
    browser.windows.get(tab.windowId, (e) => {
      b[e.id] || (b[e.id] = {});
      browser.windows.update(
        e.id,
        { state: e.state !== 'minimized' ? 'minimized' : b[e.id].prevstate || 'normal' },
        call,
      );
      b[e.id].prevstate = e.state;
    });
  };

  const maximizeWindow = async () => {
    const tab = await browser.tabs.get(tabId);
    browser.windows.get(tab.windowId, (e) => {
      b[e.id] || (b[e.id] = {});
      browser.windows.update(
        e.id,
        { state: e.state !== 'maximized' ? 'maximized' : 'normal' },
        call,
      );
      b[e.id].prevstate = e.state;
    });
  };

  const openScreenshot = async () => {
    const tab = await browser.tabs.get(tabId);
    browser.tabs.update(tab.id, { active: true }, () => {
      setTimeout(() => {
        browser.tabs.captureVisibleTab(tab.windowId, { format: 'png' }, (e) => {
          browser.tabs.create({ url: e }, call);
        });
      }, 100);
    });
  };

  const saveScreenshot = async () => {
    const tab = await browser.tabs.get(tabId);
    browser.tabs.update(tab.id, { active: true }, () => {
      setTimeout(() => {
        browser.tabs.captureVisibleTab(tab.windowId, { format: 'png' }, (e) => {
          const t = tab.url.match(/\/\/([^\/]+)\//)[1];
          T(e, `screenshot${t ? `-${t}` : ''}.png`), call();
        });
      }, 100);
    });
  };

  const openScreenshotFull = async () => {
    const tab = await browser.tabs.get(tabId);
    U(tab, (e) => {
      browser.tabs.create({ url: URL.createObjectURL(e) }), call();
    });
  };

  const saveScreenshotFull = async () => {
    const tab = await browser.tabs.get(tabId);
    U(tab, (e) => {
      const t = tab.url.match(/\/\/([^\/]+)\//)[1];
      D(e, `screenshot${t ? `-${t}` : ''}.png`), call();
    });
  };

  const cloneTab = async () => {
    browser.tabs.duplicate(tabId, call);
  };

  const zoomIn = async () => {
    m
      ? (m.postMessage({
          key: { keys: ['='], mod: [d ? 'meta' : 'ctrl'] },
          timestamp: Date.now(),
        }),
        call())
      : contents[id].postMessage({ action: { id: 'zoom-in-hack' } }, call);
  };

  const zoomOut = async () => {
    m
      ? (m.postMessage({
          key: { keys: ['-'], mod: [d ? 'meta' : 'ctrl'] },
          timestamp: Date.now(),
        }),
        call())
      : contents[id].postMessage({ action: { id: 'zoom-out-hack' } }, call);
  };

  const zoomZero = async () => {
    m
      ? (m.postMessage({
          key: { keys: ['0'], mod: [d ? 'meta' : 'ctrl'] },
          timestamp: Date.now(),
        }),
        call())
      : contents[id].postMessage({ action: { id: 'zoom-zero-hack' } }, call);
  };

  const zoomImgIn = async () => {
    contents[id].postMessage({ action: { id: 'zoom-img-in', images: message.images } }, call);
  };

  const zoomImgOut = async () => {
    contents[id].postMessage({ action: { id: 'zoom-img-out', images: message.images } }, call);
  };

  const zoomImgZero = async () => {
    contents[id].postMessage({ action: { id: 'zoom-img-zero', images: message.images } }, call);
  };

  const tabToLeft = async () => {
    const tab = await browser.tabs.get(tabId);
    browser.tabs.move(tab.id, { index: tab.index > 0 ? tab.index - 1 : 0 });
  };

  const tabToRight = async () => {
    const tab = await browser.tabs.get(tabId);
    browser.tabs.move(tab.id, { index: tab.index + 1 });
  };

  const parentDir = async () => {
    const tab = await browser.tabs.get(tabId);
    let t = tab.url.split('#')[0].split('?')[0].split('/');
    t[t.length - 1] === '' && (t = t.slice(0, t.length - 1));
    let n = null;
    (n = t.length > 3 ? `${t.slice(0, t.length - 1).join('/')}/` : `${t.join('/')}/`)
      ? browser.tabs.update(tab.id, { url: n }, call)
      : call();
  };

  const openHistory = async () => {
    const tab = await browser.tabs.get(tabId);
    browser.tabs.create({ url: 'browser://history/', windowId: tab.windowId }, call);
  };

  const openDownloads = async () => {
    const tab = await browser.tabs.get(tabId);
    browser.tabs.create({ url: 'browser://downloads/', windowId: tab.windowId }, call);
  };

  const openExtensions = async () => {
    const tab = await browser.tabs.get(tabId);
    browser.tabs.create({ url: 'browser://extensions/', windowId: tab.windowId }, call);
  };

  const openBookmarks = async () => {
    const tab = await browser.tabs.get(tabId);
    browser.tabs.create({ url: 'browser://bookmarks/', windowId: tab.windowId }, call);
  };

  const openImage = async () => {
    const tab = await browser.tabs.get(tabId);
    for (let t = 0; t < message.images.length; t += 1) {
      browser.tabs.create(
        { url: message.images[t].src, openerTabId: tab.id, windowId: tab.windowId },
        call,
      );
    }
  };

  const saveImage = async () => {
    const tab = await browser.tabs.get(tabId);
    for (let t = 0; t < message.images.length; t += 1) {
      const n = message.images[t].src.match(/([^\/?]{1,255})\/?(\?.*)?$/);
      T(message.images[t].src, n[1]);
    }
    call();
  };

  const hideImage = async () => {
    contents[id].postMessage({ action: { id: 'hide-image', images: message.images } }, call);
  };

  const showCookies = async () => {
    O(
      id,
      "window.alert('Cookies stored by this host or domain:\\n'+('\\n'+document.cookie).replace(/; /g,';\\n').replace(/\\n(.{192})([^\\n]{5})/gm,\"\\n$1\\n        $2\").replace(/\\n(.{100})([^\\n]{5})/gm,\"\\n$1\\n        $2\"));",
      call,
    );
  };

  const searchSel = async () => {
    const tab = await browser.tabs.get(tabId);
    browser.tabs.create(
      {
        url: `http://www.google.com/search?q=${message.selection}`,
        openerTabId: tab.id,
        windowId: tab.windowId,
        index: tab.index + 1,
      },
      call,
    );
  };

  const print = async () => {
    contents[id].postMessage({ action: { id: 'print', images: message.images } }, call);
  };

  const togglePin = async () => {
    const tab = await browser.tabs.get(tabId);
    await browser.tabs.update(tab.id, { pinned: !tab.pinned });
  };

  const pin = async () => {
    const tab = await browser.tabs.get(tabId);
    await browser.tabs.update(tab.id, { pinned: true });
  };

  const unpin = async () => {
    const tab = await browser.tabs.get(tabId);
    await browser.tabs.update(tab.id, { pinned: false });
  };

  const copy = async () => {
    if (!message.selection) return call();
    const o = document.createElement('textarea');
    o.value = message.selection;
    document.body.appendChild(o);
    o.select();
    document.execCommand('Copy');
    document.body.removeChild(o);
    call();
  };

  const copyLink = async () => {
    if (message.links.length == 0) return call();
    const o = document.createElement('textarea');
    o.value = message.links[0].src;
    document.body.appendChild(o);
    o.select();
    document.execCommand('Copy');
    document.body.removeChild(o);
    call();
  };

  const findPrev = async () => {
    if (!message.selection) return call();
    O(
      id,
      `window.find('${message.selection.replace(
        /[\\"']/g,
        '\\$&',
      )}', false, true, true, false, true, true);`,
      call,
    );
  };

  const findNext = async () => {
    if (!message.selection) return call();
    O(
      id,
      `window.find('${message.selection.replace(
        /[\\"']/g,
        '\\$&',
      )}', false, false, true, false, true, true);`,
      call,
    );
  };

  const toggleBookmark = async () => {
    M(['bookmarks'], async () => {
      const tab = await browser.tabs.get(tabId);
      browser.bookmarks.search(tab.url, (e) => {
        e.length <= 0
          ? browser.bookmarks.create({ parentId: '2', title: tab.title, url: tab.url }, call)
          : browser.bookmarks.remove(e[0].id, call);
      });
    });
  };

  const bookmark = async () => {
    M(['bookmarks'], async () => {
      const tab = await browser.tabs.get(tabId);
      await browser.bookmarks.create({ parentId: '2', title: tab.title, url: tab.url });
    });
  };

  const unbookmark = async () => {
    M(['bookmarks'], async () => {
      const tab = await browser.tabs.get(tabId);
      await browser.bookmarks.search(tab.url, (e) => {
        e.length <= 0 ? call() : browser.bookmarks.remove(e[0].id, call);
      });
    });
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
