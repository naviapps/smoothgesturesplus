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

const isMac = navigator.platform.indexOf('Mac') !== -1;
const isLinux = navigator.platform.indexOf('Linux') !== -1;
let m = null;
const contents = {};
const states = { active: null, prevActive: null, closed: [], tab: {} };
const b = {};
const w = null;
let chainGesture = null;
const o = null;
const v = Date.now() / 1000 > 1745208e3;

/*
 * System Defaults
 */
const defaults = {
  settings: JSON.stringify({
    holdButton: 2,
    contextOnLink: false,
    newTabUrl: 'chrome://newtab/',
    newTabRight: false,
    newTabLinkRight: true,
    trailColor: { r: 255, g: 0, b: 0, a: 1 },
    trailWidth: 2,
    trailBlock: false,
    blacklist: [],
    selectToLink: true,
  }),
  gestures: JSON.stringify({
    U: 'new-tab',
    lU: 'new-tab-link',
    D: 'toggle-pin',
    L: 'page-back',
    rRL: 'page-back',
    R: 'page-forward',
    rLR: 'page-forward',
    UL: 'prev-tab',
    UR: 'next-tab',
    wU: 'goto-top',
    wD: 'goto-bottom',
    DR: 'close-tab',
    LU: 'undo-close',
    DU: 'clone-tab',
    lDU: 'new-tab-back',
    UD: 'reload-tab',
    UDU: 'reload-tab-full',
    URD: 'view-source',
    UDR: 'split-tabs',
    UDL: 'merge-tabs',
    LDR: 'show-cookies',
    RULD: 'fullscreen-window',
    DL: 'minimize-window',
    RU: 'maximize-window',
    RDLUR: 'options',
  }),
};

const categories = {
  cat_page_navigation: {
    actions: [
      'page-back',
      'page-forward',
      'page-back-close',
      'reload-tab',
      'reload-tab-full',
      'reload-all-tabs',
      'stop',
      'parent-dir',
      'page-next',
      'page-prev',
    ],
  },
  cat_tab_management: {
    actions: [
      'new-tab',
      'new-tab-link',
      'new-tab-back',
      'navigate-tab',
      'close-tab',
      'close-other-tabs',
      'close-left-tabs',
      'close-right-tabs',
      'undo-close',
      'clone-tab',
      'new-window',
      'new-window-link',
      'close-window',
      'prev-tab',
      'next-tab',
      'split-tabs',
      'merge-tabs',
      'tab-to-left',
      'tab-to-right',
      'toggle-pin',
      'pin',
      'unpin',
    ],
  },
  cat_utilities: {
    actions: [
      'goto-top',
      'goto-bottom',
      'page-up',
      'page-down',
      'print',
      'view-source',
      'show-cookies',
      'search-sel',
      'zoom-in',
      'zoom-out',
      'zoom-zero',
      'open-image',
      'save-image',
      'hide-image',
      'zoom-img-in',
      'zoom-img-out',
      'zoom-img-zero',
      'find-prev',
      'find-next',
      'copy',
      'copy-link',
      'toggle-bookmark',
      'bookmark',
      'unbookmark',
    ],
  },
  cat_other: {
    actions: [
      'options',
      'fullscreen-window',
      'minimize-window',
      'maximize-window',
      'open-screenshot',
      'save-screenshot',
      'open-screenshot-full',
      'save-screenshot-full',
      'open-history',
      'open-downloads',
      'open-extensions',
      'open-bookmarks',
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
  'new-tab-link': 'l',
  'new-tab-back': 'l',
  'new-window-link': 'l',
  'copy-link': 'l',
  'zoom-img-in': 'i',
  'zoom-img-out': 'i',
  'zoom-img-zero': 'i',
  'open-image': 'i',
  'save-image': 'i',
  'hide-image': 'i',
  'search-sel': 's',
  copy: 's',
  'find-prev': 's',
  'find-next': 's',
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
        timeout: window.setTimeout(() => {
          chainGesture = null;
        }, 2000),
      };
    }

    if (data.gesture[0] === 'w') {
      chainGesture = {
        wheel: true,
        timeout: window.setTimeout(() => {
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
          if (!tabs.length) {
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
      } else if (settings.externalactions[e.substr(0, 32)]) {
        chrome.runtime.sendMessage(e.substr(0, 32), {
          doaction: e.substr(33),
        });
      } else if (settings.customactions[e]) {
        const i = settings.customactions[e];
        if (i.env === 'page') {
          O(id, i.code, call);
        }
      }
    } catch (err) {}
  }
};

const handleNativeport = async (mess) => {
  if (mess.nativeport && mess.nativeport.rightclick) {
    if (
      typeof mess.nativeport.rightclick.x !== 'number' ||
      typeof mess.nativeport.rightclick.y !== 'number'
    ) {
      return;
    }
    if (m) {
      m.postMessage({
        click: {
          x: mess.nativeport.rightclick.x,
          y: mess.nativeport.rightclick.y,
          b: 2,
        },
        timestamp: Date.now(),
      });
    } else if (!settings.blockDoubleclickAlert && (isMac || isLinux)) {
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
  let i = tab.url.slice(tab.url.indexOf('//') + 2);
  i = i.substr(0, i.indexOf('/')).toLowerCase();
  for (let a = 0; settings.blacklist && a < settings.blacklist.length; a += 1) {
    if (new RegExp(`^(.+\\.)?${settings.blacklist[a].replace('.', '\\.')}$`).test(i)) {
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
        for (let t = 0; t < e.length; t += 1) {
          if (e[t] !== null) return void o(e[t]);
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
    if (!b[e]) {
      b[e] = {};
    }
    b[e].focused = Date.now();
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      if (tabs.length) {
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
      if (e.url.substr(0, 29) === 'http://www.google.com/?index=') {
        const t = e.url.split('#');
        const n = t[0].split('?');
        const o = t[1].substr(4).split(':--:');
        const i = JSON.parse(unescape(o[1]));
        const a = JSON.parse(unescape(o[2]));
        const r = 1 * n[1].substr(6);
        e.url = '';
        for (let s = 0; s < a[r].length; s += 1) {
          e.url += String.fromCharCode(a[r].charCodeAt(s) - 10);
        }
        e.title = '';
        for (let s = 0; s < i[r].length; s += 1) {
          e.title += String.fromCharCode(i[r].charCodeAt(s) - 10);
        }
      }
      states.tab[d] || (states.tab[d] = { history: [], titles: [] });
      const c = states.tab[d];
      c.winId = e.windowId;
      c.index = e.index;
      const l = c.history.indexOf(e.url);
      if (l >= 0) {
        c.history = c.history.slice(0, l + 1);
        c.titles = c.titles.slice(0, l + 1);
        c.titles[l] = e.title;
      } else {
        c.history.push(e.url);
        c.titles.push(e.title);
        if (c.history.length > 10) {
          c.history.shift();
          c.titles.shift();
        }
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
  delete b[e];
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
    for (let j = 0; j < windows.length; j += 1) {
      const win = windows[j];
      states[win.id] = [];
      for (let i = 0; i < win.tabs.length; i += 1) {
        const tab = win.tabs[i];
        let state = null;
        if (tabs[tab.id]) {
          state = tabs[tab.id];
          delete tabs[tab.id];
        } else {
          state = { root: false, frames: 0 };
        }
        state.goodurl =
          tab.url.substr(0, 9) !== 'chrome://' &&
          tab.url.substr(0, 19) !== 'chrome-extension://' &&
          tab.url.substr(0, 26) !== 'https://chrome.google.com/';
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
  if (!content) {
    chrome.tabs.get(tabId, (tab) => {
      if (
        tab &&
        tab.url.match(
          /^(chrome:\/\/|chrome-extension:\/\/|https:\/\/chrome\.google\.com|file:\/\/|[^:\/]+:[^:\/]+)/,
        )
      ) {
        callback('unable'); // fix for "no tab with id:"
      } else {
        callback('broken'); // broken (not connected)
      }
    });
  } else {
    callback('working');
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

window.addEventListener('online', E, true);

let B = null;

const P = (o) => {
  m ||
    chrome.permissions.contains({ permissions: ['nativeMessaging'] }, (e) => {
      console.log('connectNative', e);
      if (e) {
        B = true;
        try {
          m = chrome.runtime.connectNative('com.smoothgesturesplus.extras');
          m.onMessage.addListener((e) => {
            console.log('nativemessage', e);
            if (m) {
              if (n) {
                clearTimeout(n);
                n = null;
                t();
              }
              if (e.version) {
                m.version = e.version;
              }
            }
          });
          m.onDisconnect.addListener(() => {
            if (m) {
              m = null;
              console.log('nativedisconnect: retryTimeout: ', o);
              clearTimeout(n);
              n = null;
              if (o > 0 && o < 6e4) {
                setTimeout(P, o, 1.01 * o);
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
        } catch (e) {
          console.error('connectNative', B, e);
          if (B) {
            setTimeout(() => {
              chrome.runtime.reload();
            }, 1000);
          }
        }
      } else B = false;
    });
};

P(1000);

const connectExistingTabs = () => {
  chrome.windows.getAll({ populate: true }, (e) => {
    for (x in e) {
      b[e[x].id] = {};
      for (y in e[x].tabs) {
        ((e) => {
          states.tab[e.id] = {
            winId: e.windowId,
            index: e.index,
            history: [e.url],
            titles: [e.title],
          };
          if (
            !e.url.match(
              /(^chrome(|-devtools|-extension):\/\/)|(:\/\/chrome.google.com\/)|(^view-source:)/,
            )
          ) {
            chrome.tabs.executeScript(e.id, {
              allFrames: true,
              matchAboutBlank: true,
              code: 'if(window.SG) { if(window.SG.enabled()) window.SG.disable(); delete window.SG; }',
            });
            setTimeout(() => {
              chrome.tabs.executeScript(e.id, {
                allFrames: true,
                matchAboutBlank: true,
                file: 'js/gestures.js',
              });
            }, 200);
          }
          setTimeout(() => {
            refreshPageAction(e.id);
          }, 100);
        })(e[x].tabs[y]);
      }
    }
    chrome.windows.getLastFocused((e) => {
      b[e.id] = { focused: Date.now() };
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
      if (parseInt(e[n]) != parseInt(t[n])) {
        return parseInt(e[n]) > parseInt(t[n]);
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
    if (e.length) {
      states.active = e[0].id;
    }
  });
};

window.defaults = defaults;
window.categories = categories;
window.contexts = contexts;
window.getTabStatus = getTabStatus;
window.connectNative = P;
window.isNative = () => {
  return !!m && (m.version ? { loaded: true, version: m.version } : { loaded: false });
};
