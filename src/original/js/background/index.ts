import { createActions } from './actions';

let settings = {};
let r = {};

const updateSettings = (e, t) => {
  for (key in e) {
    settings[key] = e[key];
  }
  if (undefined === e[key]) {
    chrome.storage.local.remove(key);
  }
  chrome.storage.local.set(e, t);
};

const l = { initcount: 2 };

chrome.storage.local.get(null, (items) => {
  if (chrome.runtime.lastError) {
    l.failed = true;
    settings = JSON.parse(localStorage.local);
  } else {
    settings = items;
    localStorage.local = JSON.stringify(items);
  }
  if (--l.initcount === 0) {
    l.init();
  }
});

chrome.storage.sync.get(null, (items) => {
  if (chrome.runtime.lastError) {
    l.failed = true;
    r = JSON.parse(localStorage.sync);
  } else {
    r = items;
    localStorage.sync = JSON.stringify(items);
  }
  if (--l.initcount === 0) {
    l.init();
  }
});

l.changed = (e, t) => {
  if (t === 'local') {
    const n = {};
    console.log('localchanged', e);
    for (key in e) {
      settings[key] = e[key].newValue;
    }
    if (r.sync && r.sync[key]) {
      r[key] = n[key] = e[key].newValue;
    }
    console.log('syncsync', key, r.sync && r.sync[key], n);
    console.log('updatesync', Object.keys(n).length, n);
    Object.keys(n).length && chrome.storage.sync.set(n);
    l.localChanged(e);
  } else if (t === 'sync') {
    if (e.firstinstalled) {
      if (!e.firstinstalled.newValue) return void chrome.storage.sync.set(r);
      if (r.firstinstalled && e.firstinstalled.newValue > e.firstinstalled.oldValue) {
        e.firstinstalled.newValue = e.firstinstalled.oldValue;
        chrome.storage.sync.set({ firstinstalled: e.firstinstalled.oldValue });
      }
    }
    const o = {};
    console.log('syncchanged', e);
    for (key in e) {
      r[key] = e[key].newValue;
    }
    if (r.sync && r.sync[key]) {
      settings[key] = o[key] = e[key].newValue;
    }
    console.log('synclocal', key, r.sync && r.sync[key], o);
    console.log('updatelocal', Object.keys(o).length, o);
    Object.keys(o).length && chrome.storage.local.set(o);
    l.syncChanged(e);
  }
};

chrome.storage.onChanged.addListener(l.changed);

l.init = () => {
  if (!r.firstinstalled) {
    r.firstinstalled = Date.now();
    r.sync = { firstinstalled: true };
  }
  for (key in JSON.parse(defaults.settings)) {
    r.sync[key] = true;
  }
  r.sync.gestures = true;
  r.sync.customactions = true;
  if (!settings.installed) {
    settings.installed = Date.now();
    settings.id =
      Math.floor(Math.random() * 2 ** 30).toString(32) +
      Math.floor(Math.random() * 2 ** 30).toString(32);
    settings.gestures = JSON.parse(defaults.gestures);
    const e = JSON.parse(defaults.settings);
    for (key in e) {
      settings[key] = e[key];
    }
    settings.customactions = {
      custom000000: {
        title: 'Navigate to Google (example)',
        descrip: 'Go to Google',
        code: 'location.href = "https://www.google.com/"',
        env: 'page',
        share: false,
        context: '',
      },
    };
    settings.externalactions = {};
    setTimeout(() => {
      chrome.tabs.create({ url: 'options.html' });
    }, 1000);
  }
  if (r.firstinstalled > settings.installed) {
    r.firstinstalled = settings.installed;
  }
  for (key in r.sync) {
    if (r.sync[key] && undefined !== r[key]) {
      settings[key] = r[key];
    } else if (r.sync[key] && undefined !== settings[key]) {
      r[key] = settings[key];
    }
  }
  settings.version = chrome.runtime.getManifest().version;
  settings.started = Date.now();
  settings.session =
    Math.floor(Math.random() * 2 ** 30).toString(32) +
    Math.floor(Math.random() * 2 ** 30).toString(32);
  if (settings.forceInstallRightclick) {
    const t = screen.availHeight / 2 - 320 / 1.5;
    const n = screen.availWidth / 2 - 375;
    window.open('rightclick.html', 'rightclick', `width=750,height=320,top=${t},left=${n}`);
  }
  chrome.storage.sync.set(r, () => {
    chrome.storage.local.set(settings, initialize);
  });
};

l.localChanged = (e) => {
  if (e.gestures) {
    updateValidGestures();
  }
};

const navMac = navigator.userAgent.includes('Mac');
const navLinux = navigator.userAgent.includes('Linux');
let nativePort = null;
const contents = {};
const states = { active: null, prevActive: null, closed: [], tab: {} };
const focusWindows = {};
const w = null;
let chainGesture = null;
const o = null;
const v = Date.now() / 1000 > 1_745_208e3;

/*
 * System Defaults
 */
const defaults = {
  settings: {
    holdButton: 2,
    contextOnLink: false,
    newTabUrl: 'chrome://newtab/',
    newTabRight: false,
    newTabLinkRight: true,
    stroke: { r: 255, g: 0, b: 0, a: 1 },
    strokeWidth: 2,
    blacklists: [],
    selectToLink: true,
  },
  gestures: {
    U: 'newTab',
    lU: 'newTabLink',
    D: 'togglePin',
    L: 'pageBack',
    rRL: 'pageBack',
    R: 'pageForward',
    rLR: 'pageForward',
    UL: 'previousTab',
    UR: 'nextTab',
    wU: 'gotoTop',
    wD: 'gotoBottom',
    DR: 'closeTab',
    LU: 'undoClose',
    DU: 'cloneTab',
    lDU: 'newTabBack',
    UD: 'reloadTab',
    UDU: 'reloadTabFull',
    URD: 'viewSource',
    UDR: 'splitTabs',
    UDL: 'mergeTabs',
    LDR: 'showCookies',
    RULD: 'fullscreenWindow',
    DL: 'minimizeWindow',
    RU: 'maximizeWindow',
    RDLUR: 'options',
  },
};

const categories = {
  cat_page_navigation: {
    actions: [
      'pageBack',
      'pageForward',
      'pageBackClose',
      'reloadTab',
      'reloadTabFull',
      'reloadAllTabs',
      'stop',
      'parentDirectory',
      'pageNext',
      'pagePrevious',
    ],
  },
  cat_tab_management: {
    actions: [
      'newTab',
      'newTabLink',
      'newTabBack',
      'navigateTab',
      'closeTab',
      'closeOtherTabs',
      'closeLeftTabs',
      'closeRightTabs',
      'undoClose',
      'cloneTab',
      'newWindow',
      'newWindowLink',
      'closeWindow',
      'previousTab',
      'nextTab',
      'splitTabs',
      'mergeTabs',
      'tabToLeft',
      'tabToRight',
      'togglePin',
      'pin',
      'unpin',
    ],
  },
  cat_utilities: {
    actions: [
      'gotoTop',
      'gotoBottom',
      'pageUp',
      'pageDown',
      'print',
      'viewSource',
      'showCookies',
      'searchSel',
      'zoomIn',
      'zoomOut',
      'zoomZero',
      'openImage',
      'saveImage',
      'hideImage',
      'zoomImgIn',
      'zoomImgOut',
      'zoomImgZero',
      'findPrevious',
      'findNext',
      'copy',
      'copyLink',
      'toggleBookmark',
      'bookmark',
      'unbookmark',
    ],
  },
  cat_other: {
    actions: [
      'options',
      'fullscreenWindow',
      'minimizeWindow',
      'maximizeWindow',
      'openScreenshot',
      'saveScreenshot',
      'openScreenshotFull',
      'saveScreenshotFull',
      'openHistory',
      'openDownloads',
      'openExtensions',
      'openBookmarks',
    ],
  },
  cat_custom: { customActions: true },
  cat_external: { externalActions: true },
  cat_settings: { settings: true },
};

/*
 * Action Functions
 */
const contexts = {
  newTabLink: 'l',
  newTabBack: 'l',
  newWindowLink: 'l',
  copyLink: 'l',
  zoomImgIn: 'i',
  zoomImgOut: 'i',
  zoomImgZero: 'i',
  openImage: 'i',
  saveImage: 'i',
  hideImage: 'i',
  searchSel: 's',
  copy: 's',
  findPrevious: 's',
  findNext: 's',
};

const R = null;

browser.runtime.onMessage.addListener((e, t, n) => {
  if (e.getstates) {
    getTabStates((e) => {
      n(JSON.stringify({ states: e }));
    });
  } else {
    n(null);
  }
});

chrome.runtime.onConnect.addListener((e) => {
  if (e.sender && e.sender.tab) {
    e.detail = JSON.parse(e.name);
    if (!e.detail.id) {
      return;
    }
    e.detail.tabId = e.sender.tab.id;
    initConnectTab(e);
  }
});

const handleMessage = function (id, data) {
  if (data.selection && settings.gestures[`s${data.gesture}`]) {
    data.gesture = `s${data.gesture}`;
  } else if (data.links && data.links.length > 0 && settings.gestures[`l${data.gesture}`]) {
    data.gesture = `l${data.gesture}`;
  } else if (data.images && data.images.length > 0 && settings.gestures[`i${data.gesture}`]) {
    data.gesture = `i${data.gesture}`;
  }

  if (data.gesture && settings.gestures[data.gesture]) {
    const e = settings.gestures[data.gesture];
    if (chainGesture) {
      clearTimeout(chainGesture.timeout);
    }
    chainGesture = null;
    if (data.gesture[0] === 'r') {
      chainGesture = {
        rocker: true,
        timeout: globalThis.setTimeout(() => {
          chainGesture = null;
        }, 2000),
      };
    }

    if (data.gesture[0] === 'w') {
      chainGesture = {
        wheel: true,
        timeout: globalThis.setTimeout(() => {
          chainGesture = null;
        }, 2000),
      };
    }

    if (chainGesture && data.buttonDown) {
      chainGesture.buttonDown = data.buttonDown;
    }

    if (chainGesture && data.startPoint) {
      chainGesture.startPoint = data.startPoint;
    }

    const call = chainGesture
      ? async () => {
          if (!chainGesture) {
            return;
          }
          const tabs = await browser.tabs.query({ active: true, lastFocusedWindow: true });
          if (tabs.length === 0) {
            return;
          }
          chainGesture.tabId = tabs[0].id;
          for (id in contents) {
            if (tabs[0].id === contents[id].detail.tabId) {
              contents[id].postMessage({ chain: chainGesture });
            }
          }
        }
      : () => {};

    try {
      const actions = createActions(id, call, data, settings);
      if (actions[e]) {
        actions[e]();
      } else if (settings.externalactions[e.slice(0, 32)]) {
        chrome.runtime.sendMessage(e.slice(0, 32), {
          doaction: e.slice(33),
        });
      } else if (settings.customactions[e]) {
        const index = settings.customactions[e];
        if (index.env === 'page') {
          O(id, index.code, call);
        }
      }
    } catch {}
  }
};

const handleNativeport = async (mess) => {
  if (mess && mess.rightclick) {
    if (typeof mess.rightclick.x !== 'number' || typeof mess.rightclick.y !== 'number') {
      return;
    }
    if (nativePort) {
      nativePort.postMessage({
        click: {
          x: mess.rightclick.x,
          y: mess.rightclick.y,
          b: 2,
        },
        timestamp: Date.now(),
      });
    } else if (!settings.blockDoubleclickAlert && (navMac || navLinux)) {
      const a = screen.availHeight / 2 - 320 / 1.5;
      const r = screen.availWidth / 2 - 375;
      window.open('rightclick.html', 'rightclick', `width=750,height=320,top=${a},left=${r}`);
    }
  }
};

/*
 * Connect Tabs
 */
const initConnectTab = (port) => {
  if (!port.sender || !port.sender.tab || !port.detail.id) {
    return;
  }
  const { tab } = port.sender;
  const { id } = port.detail;
  contents[id] = port;
  contents[id].onMessage.addListener(handleMessage.bind(null, id));
  contents[id].onDisconnect.addListener(() => {
    delete contents[id];
  });
  const o = { enable: true };
  if (chainGesture && chainGesture.tabId === tab.id) {
    if (tab.active) {
      o.chain = chainGesture;
    } else {
      clearTimeout(chainGesture.timeout);
      chainGesture = null;
    }
  }
  let index = tab.url.slice(tab.url.indexOf('//') + 2);
  index = index.slice(0, Math.max(0, index.indexOf('/'))).toLowerCase();
  for (let a = 0; settings.blacklist && a < settings.blacklist.length; a += 1) {
    if (new RegExp(`^(.+\\.)?${settings.blacklist[a].replace('.', String.raw`\.`)}$`).test(index)) {
      o.enable = false;
    }
  }
  contents[id].postMessage(o);
  refreshPageAction(tab.id);
};

const O = (e, t, n, o) => {
  if (contents[e]) {
    if (typeof n === 'function') {
      o = n;
      n = undefined;
    }
    if (undefined === n) {
      n = [];
    }
    if (typeof n !== 'object' || n.constructor !== Array) {
      n = [n];
    }
    console.log('runJS:', t);
    if (typeof t === 'string') {
      t = `(function(){${t}})()`;
    }
    if (typeof t === 'function') {
      t = `(${t.toString()})(${n
        .map((e) => {
          return JSON.stringify(e);
        })
        .join(',')})`;
    }
    t = `(function(){if(window.SG && window.SG.isId("${e}")){return ${t}}})()`;
    chrome.tabs.executeScript(
      contents[e].sender.tab.id,
      { code: t, allFrames: true, matchAboutBlank: true },
      (e) => {
        for (const element of e) {
          if (element !== null) return void o(element);
        }
        if (o) {
          o();
        }
      },
    );
  }
};

const n = (e) => {
  if (states.active != e) {
    for (id in contents) {
      if (states.active == contents[id].detail.tabId) {
        contents[id].postMessage({ windowBlurred: true });
      }
    }
    states.prevActive = states.active;
    states.active = e;
  }
};

chrome.tabs.onActivated.addListener((e) => {
  n(e.tabId);
});

chrome.windows.onFocusChanged.addListener((e) => {
  if (e !== chrome.windows.WINDOW_ID_NONE) {
    if (!focusWindows[e]) {
      focusWindows[e] = {};
    }
    focusWindows[e].focused = Date.now();
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        n(tabs[0].id);
      }
    });
  }
});

const z = (d, u) => {
  chrome.tabs.get(d, (e) => {
    if (!chrome.runtime.lastError) {
      if (u && u.url) {
        e.url = u.url;
        e.title = u.url;
      }
      if (e.url.slice(0, 29) === 'http://www.google.com/?index=') {
        const t = e.url.split('#');
        const n = t[0].split('?');
        const o = t[1].slice(4).split(':--:');
        const index = JSON.parse(unescape(o[1]));
        const a = JSON.parse(unescape(o[2]));
        const r = 1 * n[1].slice(6);
        e.url = '';
        for (let s = 0; s < a[r].length; s += 1) {
          e.url += String.fromCharCode(a[r].charCodeAt(s) - 10);
        }
        e.title = '';
        for (let s = 0; s < index[r].length; s += 1) {
          e.title += String.fromCharCode(index[r].charCodeAt(s) - 10);
        }
      }
      states.tab[d] || (states.tab[d] = { history: [], titles: [] });
      const c = states.tab[d];
      c.winId = e.windowId;
      c.index = e.index;
      const l = c.history.indexOf(e.url);
      if (l === -1) {
        c.history.push(e.url);
        c.titles.push(e.title);
        if (c.history.length > 10) {
          c.history.shift();
          c.titles.shift();
        }
      } else {
        c.history = c.history.slice(0, l + 1);
        c.titles = c.titles.slice(0, l + 1);
        c.titles[l] = e.title;
      }
      if (e.status === 'loading') {
        chrome.pageAction.setIcon({
          tabId: d,
          path: chrome.runtime.getURL('/img/pageaction.png'),
        });
        chrome.pageAction.setTitle({ tabId: d, title: 'Smooth Gestures' });
        chrome.pageAction.show(d);
      }
      if (e.status === 'complete') {
        setTimeout(() => {
          refreshPageAction(d);
        }, 100);
      }
    }
  });
};

chrome.tabs.onUpdated.addListener(z);
chrome.tabs.onMoved.addListener(z);
chrome.tabs.onAttached.addListener(z);
chrome.tabs.onRemoved.addListener((e) => {
  if (states.tab[e]) {
    states.closed.push(states.tab[e]);
  }
  while (states.closed.length > 50) {
    states.closed.shift();
  }
  delete states.tab[e];
});
chrome.windows.onRemoved.addListener((e) => {
  delete focusWindows[e];
});

const contentForTab = (tabId) => {
  let frameContent = null;
  for (id in contents) {
    if (tabId === contents[id].detail.tabId) {
      if (!contents[id].detail.frame) {
        return contents[id];
      }
      frameContent = contents[id];
    }
  }
  return frameContent;
};

/*
 * Tab Status
 */
const getTabStates = (callback) => {
  const tabs = {};
  for (id in contents) {
    const { tabId } = contents[id].detail;
    if (!tabs[tabId]) {
      tabs[tabId] = { root: false, frames: 0 };
    }
    if (contents[id].detail.frame) {
      tabs[tabId].frames += 1;
    } else {
      tabs[tabId].root = true;
    }
  }
  chrome.windows.getAll({ populate: true }, (windows) => {
    const states = {};
    for (const win of windows) {
      states[win.id] = [];
      for (let index = 0; index < win.tabs.length; index += 1) {
        const tab = win.tabs[index];
        let state = null;
        if (tabs[tab.id]) {
          state = tabs[tab.id];
          delete tabs[tab.id];
        } else {
          state = { root: false, frames: 0 };
        }
        state.goodurl =
          tab.url.slice(0, 9) !== 'chrome://' &&
          tab.url.slice(0, 19) !== 'chrome-extension://' &&
          tab.url.slice(0, 26) !== 'https://chrome.google.com/';
        state.title = tab.title;
        state.url = tab.url;
        state.tabStatus = tab.status;
        state.tabId = tab.id;
        states[win.id].push(state);
      }
      states.extra = tabs;
    }
    callback(states);
  });
};

const getTabStatus = (tabId, callback) => {
  const content = contentForTab(tabId);
  if (content) {
    callback('working');
  } else {
    chrome.tabs.get(tabId, (tab) => {
      if (
        tab &&
        /^(chrome:\/\/|chrome-extension:\/\/|https:\/\/chrome\.google\.com|file:\/\/|[^:\/]+:[^:\/]+)/.test(
          tab.url,
        )
      ) {
        callback('unable'); // fix for "no tab with id:"
      } else {
        callback('broken'); // broken (not connected)
      }
    });
  }
};

const refreshPageAction = (tabId) => {
  getTabStatus(tabId, (stat) => {
    if (stat === 'unable') {
      chrome.pageAction.setIcon({
        tabId,
        path: chrome.runtime.getURL('/img/pageaction-unable.png'),
      });
      chrome.pageAction.setTitle({
        tabId,
        title: 'Chrome blocks Gestures on this page',
      });
    } else if (stat === 'broken') {
      chrome.pageAction.setIcon({
        tabId,
        path: chrome.runtime.getURL('/img/pageaction-broken.png'),
      });
      chrome.pageAction.setTitle({
        tabId,
        title: "Gestures don't work. Reload",
      });
    } else {
      chrome.pageAction.setIcon({
        tabId,
        path: chrome.runtime.getURL('/img/pageaction.png'),
      });
      chrome.pageAction.setTitle({ tabId, title: 'Smooth Gestures' });
    }
    chrome.pageAction.show(tabId);
  });
};

const q = {};

const E = () => {
  for (const e in q) {
    delete q[e];
  }
};

globalThis.addEventListener('online', E, true);

let B = null;

const connectNative = (o) => {
  nativePort ||
    chrome.permissions.contains({ permissions: ['nativeMessaging'] }, (e) => {
      console.log('connectNative', e);
      if (e) {
        B = true;
        try {
          nativePort = chrome.runtime.connectNative('com.smoothgesturesplus.extras');
          nativePort.onMessage.addListener((e) => {
            console.log('nativemessage', e);
            if (nativePort) {
              if (n) {
                clearTimeout(n);
                n = null;
                t();
              }
              if (e.version) {
                nativePort.version = e.version;
              }
            }
          });
          nativePort.onDisconnect.addListener(() => {
            if (nativePort) {
              nativePort = null;
              console.log('nativedisconnect: retryTimeout:', o);
              clearTimeout(n);
              n = null;
              if (o > 0 && o < 6e4) {
                setTimeout(connectNative, o, 1.01 * o);
              }
            }
          });
          var t = () => {
            for (let e = chrome.extension.getViews(), t = 0; t < e.length; t += 1) {
              if (e[t].location.pathname === '/rightclick.html') {
                e[t].close();
              }
            }
          };
          var n = setTimeout(t, 1000);
        } catch (error) {
          console.error('connectNative', B, error);
          if (B) {
            setTimeout(() => {
              chrome.runtime.reload();
            }, 1000);
          }
        }
      } else B = false;
    });
};

connectNative(1000);

const connectExistingTabs = () => {
  chrome.windows.getAll({ populate: true }, (wins) => {
    for (const x in wins) {
      focusWindows[wins[x].id] = {};
      for (const y in wins[x].tabs) {
        ((tab) => {
          states.tab[tab.id] = {
            winId: tab.windowId,
            index: tab.index,
            history: [tab.url],
            titles: [tab.title],
          };
          if (
            !/(^chrome(|-devtools|-extension):\/\/)|(:\/\/chrome.google.com\/)|(^view-source:)/.test(
              tab.url,
            )
          ) {
            chrome.tabs.executeScript(tab.id, {
              allFrames: true,
              matchAboutBlank: true,
              code: 'if(window.SG) { if(window.SG.enabled()) window.SG.disable(); delete window.SG; }',
            });
            setTimeout(() => {
              chrome.tabs.executeScript(tab.id, {
                allFrames: true,
                matchAboutBlank: true,
                file: 'js/gestures.js',
              });
            }, 200);
          }
          setTimeout(() => {
            refreshPageAction(tab.id);
          }, 100);
        })(wins[x].tabs[y]);
      }
    }
    chrome.windows.getLastFocused((win) => {
      focusWindows[win.id] = { focused: Date.now() };
    });
  });
};

const initialize = () => {
  for (id in settings.customactions) {
    contexts[id] = settings.customactions[id].context;
  }
  for (id in settings.externalactions) {
    for (i = 0; i < settings.externalactions[id].actions.length; i += 1) {
      contexts[`${id}-${settings.externalactions[id].actions[i].id}`] =
        settings.externalactions[id].actions[i].context;
    }
  }
  ((e, t) => {
    e = e.split('.');
    t = t.split('.');
    for (let n = 0; n < e.length && n < t.length; n += 1) {
      if (Number.parseInt(e[n]) != Number.parseInt(t[n])) {
        return Number.parseInt(e[n]) > Number.parseInt(t[n]);
      }
    }
    return e.length > t.length;
  })(chrome.runtime.getManifest().version, settings.version) &&
    updateSettings({ version: chrome.runtime.getManifest().version, updated: Date.now() });
  for (id in settings.externalactions) {
    delete settings.externalactions[id];
  }
  updateSettings({ externalactions: settings.externalactions });
  chrome.runtime.sendMessage(id, { getexternalactions: true });
  setTimeout(connectExistingTabs, 0);
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (e) => {
    if (e.length > 0) {
      states.active = e[0].id;
    }
  });
};

globalThis.defaults = defaults;
globalThis.categories = categories;
globalThis.contexts = contexts;
globalThis.getTabStatus = getTabStatus;
globalThis.connectNative = connectNative;
globalThis.isNative = () => {
  return (
    !!nativePort &&
    (nativePort.version ? { loaded: true, version: nativePort.version } : { loaded: false })
  );
};
