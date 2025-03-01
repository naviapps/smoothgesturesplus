import browser from 'webextension-polyfill';
import { createActions } from './actions';

const e = {};
for (a in console) {
  e[a] = console[a];
}
if ('update_url' in chrome.runtime.getManifest()) {
  for (a in console) {
    console[a] = () => {};
  }
}
let settings = {};
let r = {};

const c = (e, t) => {
  const n = Date.now();
  for (key in e) {
    settings[key] = e[key];
  }
  if (undefined === e[key]) {
    chrome.storage.local.remove(key);
  }
  if (!key.match(/\+ts$/)) {
    settings[`${key}+ts`] = e[`${key}+ts`] = n;
  }
  chrome.storage.local.set(e, t);
};

const l = { initcount: 2 };

chrome.storage.local.get(null, (items) => {
  if (chrome.runtime.lastError) {
    if (!l.failed) {
      alert(
        "Google Chrome's storage may be corrupted. Extensions may not work properly.\n\nTry closing and restarting Chrome.\n\nIf that doesn't work, reinstall the browser to fix this problem.",
      );
    }
    l.failed = true;
    console.log('chrome.storage failure');
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
    if (l.failed) {
      alert(
        "Google Chrome's storage may be corrupted. Extensions may not work properly.\n\nTry closing and restarting Chrome.\n\nIf that doesn't work, reinstall the browser to fix this problem.",
      );
    }
    l.failed = true;
    console.log('chrome.storage failure');
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
    settings.log = { action: {} };
    settings.gestures = JSON.parse(defaults.gestures);
    const e = JSON.parse(defaults.settings);
    for (key in e) {
      settings[key] = e[key];
    }
    settings.customactions = {
      custom000000: {
        title: 'Navigate to Google (example)',
        descrip: 'Go to Google',
        code: 'location.href = "http://www.google.com/"',
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
    if (
      r.sync[key] &&
      undefined !== r[key] &&
      (r[`${key}+ts`] || 0) >= (settings[`${key}+ts`] || 0)
    ) {
      settings[key] = r[key];
      settings[`${key}+ts`] = r[`${key}+ts`] || Date.now();
    } else if (
      r.sync[key] &&
      undefined !== settings[key] &&
      (settings[`${key}+ts`] || 0) >= (r[`${key}+ts`] || 0)
    ) {
      r[key] = settings[key];
      r[`${key}+ts`] = settings[`${key}+ts`] || Date.now();
    }
  }
  settings.version = chrome.runtime.getManifest().version;
  settings.started = Date.now();
  settings.session =
    Math.floor(Math.random() * 2 ** 30).toString(32) +
    Math.floor(Math.random() * 2 ** 30).toString(32);
  o = settings.license;
  if (settings.forceInstallRightclick) {
    const t = screen.availHeight / 2 - 320 / 1.5;
    const n = screen.availWidth / 2 - 375;
    window.open('rightclick.html', 'rightclick', `width=750,height=320,top=${t},left=${n}`);
  }
  chrome.storage.sync.set(r, () => {
    chrome.storage.local.set(settings, F);
  });
};

l.localChanged = (e) => {
  if (e.gestures) {
    updateValidGestures();
  }
  e.license_expires &&
    e.license_expires.oldValue < Date.now() &&
    !e.license_expires.newValue &&
    c({ license_showexpired: true });
  if (settings.license !== o) {
    c({ license: o });
  } else if (e.license && undefined !== e.license.oldValue) {
    c(
      {
        license_showactivated: !!o,
        license_showdeactivated: !o && !settings.license_showexpired,
      },
      () => {},
    );
  }
  if (
    e.version &&
    settings.version === '2.8.1' &&
    e.version.oldValue &&
    e.version.oldValue !== '2.8.1'
  ) {
    c({ showNoteUpdated: true }, () => {
      chrome.tabs.create({
        url: chrome.runtime.getURL('/options.html#changelog'),
      });
    });
  }
};

l.syncChanged = () => {};
navigator.platform.indexOf('Win');
const d = navigator.platform.indexOf('Mac') !== -1;
const u = navigator.platform.indexOf('Linux') !== -1;
let m = null;
const contents = {};
const f = { active: null, prevActive: null, closed: [], tab: {} };
const b = {};
const w = null;
let chainGesture = null;
var o = null;
let v = Date.now() / 1000 > 1745208e3;

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
    if (e.log) {
      console.log(e.log);
    }
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
  contents[id].onMessage.addListener(
    function (id, mess) {
      console.log('content_message', JSON.stringify(mess));
      if (mess.selection && mess.selection.length > 0 && settings.gestures[`s${mess.gesture}`]) {
        mess.gesture = `s${mess.gesture}`;
      } else if (mess.links && mess.links.length > 0 && settings.gestures[`l${mess.gesture}`]) {
        mess.gesture = `l${mess.gesture}`;
      } else if (mess.images && mess.images.length > 0 && settings.gestures[`i${mess.gesture}`]) {
        mess.gesture = `i${mess.gesture}`;
      }

      if (mess.gesture && settings.gestures[mess.gesture]) {
        if (v) return void J();
        const e = settings.gestures[mess.gesture];
        console.log('gesture', mess.gesture, e);
        if (chainGesture) {
          clearTimeout(chainGesture.timeout);
        }
        chainGesture = null;
        if (mess.gesture[0] === 'r') {
          chainGesture = {
            rocker: true,
            timeout: setTimeout(() => {
              chainGesture = null;
            }, 2e3),
          };
        }

        if (mess.gesture[0] === 'w') {
          chainGesture = {
            wheel: true,
            timeout: setTimeout(() => {
              chainGesture = null;
            }, 2e3),
          };
        }

        if (chainGesture && mess.buttonDown) {
          chainGesture.buttonDown = mess.buttonDown;
        }

        if (chainGesture && mess.startPoint) {
          chainGesture.startPoint = mess.startPoint;
        }

        const call = chainGesture
          ? () => {
              chrome.tabs.query({ active: true, lastFocusedWindow: true }, (e) => {
                if (chainGesture && e.length) {
                  chainGesture.tabId = e[0].id;
                  for (id in contents) {
                    if (e[0].id === contents[id].detail.tabId) {
                      contents[id].postMessage({ chain: chainGesture });
                    }
                  }
                }
              });
            }
          : () => {};

        try {
          const actions = createActions(id, call, mess, settings);
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

        if (!settings.log.action[e]) {
          settings.log.action[e] = {};
        }

        if (!settings.log.action[e][mess.gesture]) {
          settings.log.action[e][mess.gesture] = { count: 0 };
        }

        settings.log.action[e][mess.gesture].count += 1;

        if (!settings.log.line) {
          settings.log.line = { distance: 0, segments: 0 };
        }

        if (mess.line) {
          settings.log.line.distance += mess.line.distance;
          settings.log.line.segments += mess.line.segments;
        }

        c({ log: settings.log });
      }
      if (mess.syncButton) {
        if (chainGesture) {
          if (chainGesture.buttonDown) {
            chainGesture.buttonDown = {};
          }
          chainGesture.buttonDown[mess.syncButton.id] = mess.syncButton.down;
        }

        setTimeout(() => {
          chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tab) => {
            for (id in contents) {
              if (tab[0].id === contents[id].detail.tabId) {
                contents[id].postMessage({ syncButton: mess.syncButton });
              }
            }
          });
        }, 20);
      }

      if (mess.closetab) {
        chrome.tabs.get(contents[id].detail.tabId, (tab) => {
          chrome.tabs.remove(tab.id);
        });
      }

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
        } else if (!settings.blockDoubleclickAlert && (d || u)) {
          const a = screen.availHeight / 2 - 320 / 1.5;
          const r = screen.availWidth / 2 - 375;
          window.open('rightclick.html', 'rightclick', `width=750,height=320,top=${a},left=${r}`);
        }
      }
    }.bind(null, id),
  );
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
  let i = tab.url.substr(tab.url.indexOf('//') + 2);
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
  if (f.active != e) {
    for (id in contents) {
      if (f.active == contents[id].detail.tabId) {
        contents[id].postMessage({ windowBlurred: true });
      }
    }
    f.prevActive = f.active;
    f.active = e;
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
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (e) => {
      if (e.length) {
        n(e[0].id);
      }
    });
  }
});

const z = (d, u) => {
  chrome.tabs.get(d, (e) => {
    if (!chrome.runtime.lastError) {
      if (e.url === 'https://smoothgesturesplus.com/thanks') {
        V();
      }
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
      f.tab[d] || (f.tab[d] = { history: [], titles: [] });
      const c = f.tab[d];
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
  if (f.tab[e]) {
    f.closed.push(f.tab[e]);
  }
  while (f.closed.length > 50) {
    f.closed.shift();
  }
  delete f.tab[e];
});
chrome.windows.onRemoved.addListener((e) => {
  delete b[e];
});

const updateValidGestures = () => {
  const validGestures = {};
  for (g in settings.gestures) {
    if (g[0] === 'l' || g[0] === 'i' || g[0] === 's') {
      g = g.substr(1);
    }
    if (g[0] === 'k') {
      if (!validGestures.k) {
        validGestures.k = {};
      }
      const mod = g.substr(1, 4);
      if (validGestures.k[mod]) {
        validGestures.k[mod] = [];
      }
      validGestures.k[mod].push(g.substr(6));
    } else {
      let cur = validGestures;
      for (let i = 0; i < g.length; i += 1) {
        if (!cur[g[i]]) {
          cur[g[i]] = {};
        }
        cur = cur[g[i]];
      }
      cur[''] = true;
    }
  }
  c({ validGestures });
};

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

const J = () => {
  chrome.runtime.requestUpdateCheck(() => {});
  setTimeout(() => {
    window.open(
      '/update.html',
      'sgupdate',
      `chrome,innerWidth=700,innerHeight=250,left=${(window.screen.width - 700) / 2},top=${
        (window.screen.height - 250) / 2 - 100
      }`,
    );
  }, 2e3);
};

const q = {};

const E = () => {
  for (const e in q) {
    delete q[e];
  }
  if (e === 'ping') {
    V();
  }
};

window.addEventListener('online', E, true);

const V = (t) => {
  if (navigator.onLine) {
    delete q.ping;
    $.ajax({
      url: 'https://api.s13.us/gestures/ping',
      type: 'post',
      data: JSON.stringify({
        clid: settings.id,
        time: settings.firstinstalled,
        htok: r.token ? sjcl.codec.hex.fromBits(sjcl.hash.sha1.hash(r.token)) : undefined,
        version: chrome.runtime.getManifest().version,
        lang: navigator.language,
        nat: !!m,
        storagefailed: l.failed,
      }),
    })
      .done((e) => {
        if (!e) {
          q.ping = true;
          setTimeout(E, 3e5);
          return;
        }
        if (typeof e === 'string') {
          e = JSON.parse(e);
        }
        if (e.alert) {
          alert(e.alert);
        }
        if (e.checkupdate) {
          J();
        }
        if (e.code === 3) {
          v = true;
        }
        if (e.invalidtoken && r.token) {
          r.invalidtoken = r.token;
          chrome.storage.sync.set({ invalidtoken: r.invalidtoken });
          delete r.token;
          chrome.storage.sync.remove('token');
        }
        if (e.settoken) {
          r.token = e.settoken;
          chrome.storage.sync.set({ token: r.token });
        }
        o =
          [
            'full',
            '1yrmul',
            '6mnmul',
            '1mnmul',
            '2wkmul',
            '1wkmul',
            '1yr1cl',
            '1mn1cl',
            '1wk1cl',
            'free',
          ].indexOf(e.licenseid) !== -1
            ? e.licenseid
            : null;
        c({ license: o, license_expires: e.expires });
        if (t) {
          t();
        }
      })
      .fail(() => {
        q.ping = true;
      });
  } else {
    q.ping = true;
  }
};

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
          f.tab[e.id] = {
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

const F = () => {
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
    c({ version: chrome.runtime.getManifest().version, updated: Date.now() });
  for (id in settings.externalactions) {
    delete settings.externalactions[id];
  }
  c({ externalactions: settings.externalactions });
  chrome.runtime.sendMessage(id, { getexternalactions: true });
  setTimeout(connectExistingTabs, 0);
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (e) => {
    if (e.length) {
      f.active = e[0].id;
    }
  });
  V();
};

chrome.runtime.onUpdateAvailable.addListener(() => {
  chrome.runtime.reload();
});

window.defaults = defaults;
window.categories = categories;
window.contexts = contexts;
window.continue_permissions = () => {
  setTimeout(() => {
    if (R) {
      R();
    }
    setTimeout(() => {
      chrome.runtime.reload();
    }, 500);
  }, 0);
};
window.getTabStates = getTabStates;
window.getTabStatus = getTabStatus;
window.refreshPageAction = refreshPageAction;
window.ping = V;
window.connectNative = P;
window.disconnectNative = () => {
  if (m) {
    m.disconnect();
    m = null;
  }
};
window.isNative = () => {
  return !!m && (m.version ? { loaded: true, version: m.version } : { loaded: false });
};
