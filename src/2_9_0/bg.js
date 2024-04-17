var e = {}
for (a in console) e[a] = console[a]
if ('update_url' in chrome.runtime.getManifest()) {
  for (a in console) console[a] = () => {}
}
var settings = {}
var r = {}
var c = (e, t) => {
  var n = Date.now()
  for (key in e) {
    ;(settings[key] = e[key]),
      void 0 === e[key] && chrome.storage.local.remove(key),
      key.match(/\+ts$/) || (settings[key + '+ts'] = e[key + '+ts'] = n)
  }
  chrome.storage.local.set(e, t)
}
var l = { initcount: 2 }

chrome.storage.local.get(null, (e): void => {
  if (chrome.runtime.lastError) {
    if (!l.failed) {
      alert(
        "Google Chrome's storage may be corrupted. Extensions may not work properly.\n\nTry closing and restarting Chrome.\n\nIf that doesn't work, reinstall the browser to fix this problem.",
      )
    }
    l.failed = true
    console.log('chrome.storage failure')
    settings = JSON.parse(localStorage.local)
  } else {
    settings = e
    localStorage.local = JSON.stringify(e)
  }
  if (--l.initcount === 0) {
    l.init()
  }
})

chrome.storage.sync.get(null, (e): void => {
  if (chrome.runtime.lastError) {
    l.failed ||
      alert(
        "Google Chrome's storage may be corrupted. Extensions may not work properly.\n\nTry closing and restarting Chrome.\n\nIf that doesn't work, reinstall the browser to fix this problem.",
      )
    l.failed = true
    console.log('chrome.storage failure')
    r = JSON.parse(localStorage.sync)
  } else {
    r = e
    localStorage.sync = JSON.stringify(e)
  }
  if (--l.initcount === 0) {
    l.init()
  }
})

l.changed = (e, t) => {
  if (t === 'local') {
    var n = {}
    for (key in (console.log('localchanged', e), e)) {
      ;(settings[key] = e[key].newValue),
        r.sync && r.sync[key] && (r[key] = n[key] = e[key].newValue),
        console.log('syncsync', key, r.sync && r.sync[key], n)
    }
    console.log('updatesync', Object.keys(n).length, n),
      Object.keys(n).length && chrome.storage.sync.set(n),
      l.localChanged(e)
  } else if (t == 'sync') {
    if (e.firstinstalled) {
      if (!e.firstinstalled.newValue) return void chrome.storage.sync.set(r)
      r.firstinstalled &&
        e.firstinstalled.newValue > e.firstinstalled.oldValue &&
        ((e.firstinstalled.newValue = e.firstinstalled.oldValue),
        chrome.storage.sync.set({
          firstinstalled: e.firstinstalled.oldValue,
        }))
    }
    var o = {}
    for (key in (console.log('syncchanged', e), e)) {
      ;(r[key] = e[key].newValue),
        r.sync && r.sync[key] && (settings[key] = o[key] = e[key].newValue),
        console.log('synclocal', key, r.sync && r.sync[key], o)
    }
    console.log('updatelocal', Object.keys(o).length, o),
      Object.keys(o).length && chrome.storage.local.set(o),
      l.syncChanged(e)
  }
}

chrome.storage.onChanged.addListener(l.changed)
l.init = () => {
  for (key in (r.firstinstalled ||
    ((r.firstinstalled = Date.now()), (r.sync = { firstinstalled: true })),
  JSON.parse(defaults['Smooth Gestures'].settings))) {
    r.sync[key] = true
  }
  if (
    ((r.sync.gestures = true),
    (r.sync.customactions = true),
    !settings.installed)
  ) {
    ;(settings.installed = Date.now()),
      (settings.id =
        Math.floor(Math.random() * Math.pow(2, 30)).toString(32) +
        Math.floor(Math.random() * Math.pow(2, 30)).toString(32)),
      (settings.log = { action: {} }),
      (settings.gestures = JSON.parse(defaults['Smooth Gestures'].gestures))
    var e = JSON.parse(defaults['Smooth Gestures'].settings)
    for (key in e) settings[key] = e[key]
    ;(settings.customactions = {
      custom000000: {
        title: 'Navigate to Google (example)',
        descrip: 'Go to Google',
        code: 'location.href = "http://www.google.com/"',
        env: 'page',
        share: false,
        context: '',
      },
    }),
      (settings.externalactions = {}),
      setTimeout(() => {
        chrome.tabs.create({ url: 'options.html' })
      }, 1e3)
  }
  for (key in (r.firstinstalled > settings.installed &&
    (r.firstinstalled = settings.installed),
  r.sync)) {
    r.sync[key] &&
    void 0 !== r[key] &&
    (r[key + '+ts'] || 0) >= (settings[key + '+ts'] || 0)
      ? ((settings[key] = r[key]),
        (settings[key + '+ts'] = r[key + '+ts'] || Date.now()))
      : r.sync[key] &&
        void 0 !== settings[key] &&
        (settings[key + '+ts'] || 0) >= (r[key + '+ts'] || 0) &&
        ((r[key] = settings[key]),
        (r[key + '+ts'] = settings[key + '+ts'] || Date.now()))
  }
  if (
    ((settings.version = chrome.runtime.getManifest().version),
    (settings.started = Date.now()),
    (settings.session =
      Math.floor(Math.random() * Math.pow(2, 30)).toString(32) +
      Math.floor(Math.random() * Math.pow(2, 30)).toString(32)),
    (o = settings.license),
    settings.forceInstallRightclick)
  ) {
    var t = screen.availHeight / 2 - 320 / 1.5,
      n = screen.availWidth / 2 - 375
    window.open(
      'rightclick.html',
      'rightclick',
      'width=750,height=320,top=' + t + ',left=' + n,
    )
  }
  chrome.storage.sync.set(r, () => {
    chrome.storage.local.set(settings, F)
  })
}

l.localChanged = (e) => {
  if (e.gestures) {
    updateValidGestures()
  }
  if (
    e.license_expires &&
    e.license_expires.oldValue < Date.now() &&
    !e.license_expires.newValue
  ) {
    c({ license_showexpired: true })
  }
  if (settings.license !== o) {
    c({ license: o })
  } else if (e.license && void 0 !== e.license.oldValue) {
    c(
      {
        license_showactivated: !!o,
        license_showdeactivated: !o && !settings.license_showexpired,
      },
      () => {},
    )
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
      })
    })
  }
}

l.syncChanged = () => {}
var d = navigator.userAgent.indexOf('Mac') !== -1
var u = navigator.userAgent.indexOf('Linux') !== -1
var m = null
var contents = {}
var f = { active: null, prevActive: null, closed: [], tab: {} }
var b = {}
var w = null
var p = null
var o = null
var v = Date.now() / 1e3 > 1745208e3
const defaults = {
  'Smooth Gestures': {
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
  },
  Opera: {
    settings: JSON.stringify({}),
    gestures: JSON.stringify({
      L: 'page-back',
      rRL: 'page-back',
      R: 'page-forward',
      rLR: 'page-forward',
      U: 'stop',
      UD: 'reload-tab',
      DR: 'close-tab',
      RLR: 'close-tab',
      D: 'new-tab',
      lD: 'new-tab-link',
      DU: 'clone-tab',
      lDU: 'new-tab-back',
      UL: 'parent-dir',
    }),
  },
  'All-in-One Gestures': {
    settings: JSON.stringify({}),
    gestures: JSON.stringify({
      L: 'page-back',
      rRL: 'page-back',
      R: 'page-forward',
      rLR: 'page-forward',
      UD: 'reload-tab',
      UDU: 'reload-tab-full',
      LU: 'stop',
      U: 'new-tab',
      RLR: 'new-tab-link',
      DUD: 'clone-tab',
      UL: 'prev-tab',
      UR: 'next-tab',
      DR: 'close-tab',
      D: 'new-window',
      URD: 'view-source',
      LDR: 'show-cookies',
      DRD: 'options',
    }),
  },
  FireGestures: {
    settings: JSON.stringify({}),
    gestures: JSON.stringify({
      L: 'page-back',
      R: 'page-forward',
      UD: 'reload-tab',
      UDU: 'reload-tab-full',
      DRU: 'new-window',
      URD: 'close-window',
      LR: 'new-tab',
      DR: 'close-tab',
      RL: 'undo-close',
      UL: 'prev-tab',
      UR: 'next-tab',
      LU: 'goto-top',
      LD: 'goto-bottom',
      lU: 'new-tab-link',
      lD: 'new-tab-back',
      LDRUL: 'options',
      DU: 'parent-dir',
    }),
  },
}

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
}

const actions = {
    'new-tab': (id, call): void => {
      chrome.tabs.get(
        contents[id].detail.tabId,
        (tab: chrome.tabs.Tab): void => {
          const createProperties: chrome.tabs.CreateProperties = {
            openerTabId: tab.id,
            windowId: tab.windowId,
          }
          if (settings.newTabUrl !== 'homepage') {
            createProperties.url = settings.newTabUrl
          }
          if (settings.newTabRight) {
            createProperties.index = tab.index + 1
          }
          chrome.tabs.create(createProperties, call)
        },
      )
    },
    'new-tab-link': (id, call, a) => {
      chrome.tabs.get(contents[id].detail.tabId, (tab: chrome.tabs.Tab) => {
        for (var t = 0; t < a.links.length; t++) {
          var n = {
            openerTabId: tab.id,
            windowId: tab.windowId,
            url: a.links[t].src,
          }
          settings.newTabLinkRight && (n.index = tab.index + 1 + t)
          chrome.tabs.create(n, t == a.links.length - 1 ? call : null)
        }
      })
    },
    'new-tab-back': (e, o, i) => {
      chrome.tabs.get(contents[e].detail.tabId, (e) => {
        for (var t = 0; t < i.links.length; t++) {
          var n = {
            openerTabId: e.id,
            windowId: e.windowId,
            url: i.links[t].src,
            active: false,
          }
          settings.newTabLinkRight && (n.index = e.index + 1 + t),
            chrome.tabs.create(n, t == i.links.length - 1 ? o : null)
        }
      })
    },
    'navigate-tab': (e, t) => {
      chrome.tabs.update(
        contents[e].detail.tabId,
        { url: settings.newTabUrl != 'homepage' ? settings.newTabUrl : void 0 },
        t,
      )
    },
    'close-tab': (id, callback): void => {
      chrome.tabs.get(
        contents[id].detail.tabId,
        (tab: chrome.tabs.Tab): void => {
          if (tab.pinned) {
            callback()
          } else if (settings.closeLastBlock) {
            chrome.windows.getAll(
              { populate: true },
              (windows: chrome.windows.Window[]): void => {
                if (windows.length === 1 && windows[0].tabs.length === 1) {
                  chrome.tabs.update(
                    contents[id].detail.tabId,
                    {
                      url:
                        settings.newTabUrl !== 'homepage'
                          ? settings.newTabUrl
                          : void 0,
                    },
                    callback,
                  )
                } else {
                  chrome.tabs.remove(contents[id].detail.tabId, callback)
                }
              },
            )
          } else {
            chrome.tabs.remove(contents[id].detail.tabId, callback)
          }
        },
      )
    },
    'close-other-tabs': (e, n) => {
      chrome.tabs.get(contents[e].detail.tabId, (t) => {
        chrome.tabs.query({ windowId: t.windowId }, (e) => {
          for (i = 0; i < e.length; i++) {
            e[i].id == t.id || e[i].pinned || chrome.tabs.remove(e[i].id)
          }
          n()
        })
      })
    },
    'close-left-tabs': (e, n) => {
      chrome.tabs.get(contents[e].detail.tabId, (t) => {
        chrome.tabs.query({ windowId: t.windowId }, (e) => {
          for (i = 0; i < e.length; i++) {
            e[i].index < t.index && !t.pinned && chrome.tabs.remove(e[i].id)
          }
          n()
        })
      })
    },
    'close-right-tabs': (e, n) => {
      chrome.tabs.get(contents[e].detail.tabId, (t) => {
        chrome.tabs.query({ windowId: t.windowId }, (e) => {
          for (i = 0; i < e.length; i++) {
            e[i].index > t.index && !t.pinned && chrome.tabs.remove(e[i].id)
          }
          n()
        })
      })
    },
    'undo-close': (e, t) => {
      if (f.closed.length > 0) {
        var n = f.closed.pop()
        chrome.tabs.create(
          {
            url: n.history[n.history.length - 1],
            index: n.index,
            windowId: n.winId,
            active: true,
          },
          t,
        )
      }
    },
    'reload-tab': (id, callback): void => {
      chrome.tabs.reload(
        contents[id].detail.tabId,
        { bypassCache: false },
        callback,
      )
    },
    'reload-tab-full': (id, callback): void => {
      chrome.tabs.reload(
        contents[id].detail.tabId,
        { bypassCache: true },
        callback,
      )
    },
    'reload-all-tabs': (id, callback): void => {
      chrome.tabs.get(
        contents[id].detail.tabId,
        (tab: chrome.tabs.Tab): void => {
          chrome.tabs.query(
            { windowId: tab.windowId },
            (tabs: chrome.tabs.Tab[]): void => {
              for (let i = 0; i < tabs.length; i++) {
                chrome.tabs.reload(tabs[i].id)
              }
              callback()
            },
          )
        },
      )
    },
    stop: (e, t) => {
      contents[e].postMessage({ action: { id: 'stop' } }, t)
    },
    'view-source': (t, n) => {
      chrome.tabs.get(contents[t].detail.tabId, (e) => {
        chrome.tabs.create(
          {
            url:
              'view-source:' +
              (contents[t].detail.url ? contents[t].detail.url : e.url),
            windowId: e.windowId,
            index: e.index + 1,
          },
          n,
        )
      })
    },
    'prev-tab': (e, o) => {
      chrome.tabs.get(contents[e].detail.tabId, (n) => {
        chrome.tabs.query({ windowId: n.windowId }, (e) => {
          var t = null
          for (i = e.length - 1; i >= 0; i--) {
            if (((t = e[(n.index + i) % e.length].id), C(t))) {
              return void chrome.tabs.update(t, { active: true }, o)
            }
          }
          o()
        })
      })
    },
    'next-tab': (e, o) => {
      chrome.tabs.get(contents[e].detail.tabId, (n) => {
        chrome.tabs.query({ windowId: n.windowId }, (e) => {
          var t = null
          for (i = 1; i <= e.length; i++) {
            if (((t = e[(n.index + i) % e.length].id), C(t))) {
              return void chrome.tabs.update(t, { active: true }, o)
            }
          }
          o()
        })
      })
    },
    'page-back': (e, callback) => {
      contents[e].postMessage({ action: { id: 'page-back' } }, callback)
    },
    'page-forward': (e, callback) => {
      contents[e].postMessage({ action: { id: 'page-forward' } }, callback)
    },
    'new-window'(e, callback): void {
      chrome.windows.create(
        {
          url: settings.newTabUrl !== 'homepage' ? settings.newTabUrl : void 0,
        },
        callback,
      )
    },
    'new-window-link': (e, t, n) => {
      for (var o = 0; o < n.links.length; o++) {
        chrome.windows.create(
          { url: n.links[o].src },
          o == n.links.length - 1 ? t : null,
        )
      }
    },
    'close-window': (e, callback): void => {
      chrome.windows.getCurrent((window: chrome.windows.Window): void => {
        chrome.windows.remove(window.id, callback)
      })
    },
    'split-tabs': (id, callback: () => void): void => {
      chrome.tabs.get(
        contents[id].detail.tabId,
        (tab: chrome.tabs.Tab): void => {
          chrome.tabs.query(
            { windowId: tab.windowId },
            (tabs: chrome.tabs.Tab[]): void => {
              chrome.windows.create(
                { tabId: tab.id, focused: true, incognito: tab.incognito },
                (window?: chrome.windows.Window): void => {
                  for (let i: number = tab.index + 1; i < tabs.length; i++) {
                    chrome.tabs.move(tabs[i].id, {
                      windowId: window.id,
                      index: i - tab.index,
                    })
                  }
                },
              )
            },
          )
        },
      )
    },
    'merge-tabs': (e, r) => {
      chrome.tabs.get(contents[e].detail.tabId, (a) => {
        chrome.tabs.query({ windowId: a.windowId }, (e) => {
          var t = []
          for (var n in b) b[n].focused > 0 && t.push([n, b[n]])
          if (!(t.length < 2)) {
            t.sort((e, t) => {
              return e.focused > t.focused ? 1 : e.focused < t.focused ? -1 : 0
            })
            var o = parseInt(t[t.length - 2][0])
            if (o) {
              for (i = 0; i < e.length; i++) {
                chrome.tabs.move(e[i].id, { windowId: o, index: 1e6 })
              }
              chrome.tabs.update(a.id, { active: true }, () => {
                chrome.windows.update(o, { focused: true }, r)
              })
            }
          }
        })
      })
    },
    options: (e, t) => {
      chrome.tabs.get(contents[e].detail.tabId, (e) => {
        chrome.tabs.create(
          {
            url: chrome.runtime.getURL('options.html'),
            windowId: e.windowId,
          },
          t,
        )
      })
    },
    'page-back-close': (e, t) => {
      contents[e].postMessage(
        {
          action: {
            id: 'page-back-close',
            has_history: f.tab[contents[e].detail.tabId].history.length > 1,
          },
        },
        t,
      )
    },
    'goto-top': (e, t, n) => {
      contents[e].postMessage(
        { action: { id: 'goto-top', startPoint: n.startPoint } },
        t,
      )
    },
    'goto-bottom': (e, t, n) => {
      contents[e].postMessage(
        { action: { id: 'goto-bottom', startPoint: n.startPoint } },
        t,
      )
    },
    'page-up': (e, t, n) => {
      contents[e].postMessage(
        { action: { id: 'page-up', startPoint: n.startPoint } },
        t,
      )
    },
    'page-down': (e, t, n) => {
      contents[e].postMessage(
        { action: { id: 'page-down', startPoint: n.startPoint } },
        t,
      )
    },
    'page-next': (e, t) => {
      O(
        e,
        () => {
          var e = null
          if ((e = document.querySelector('link[rel=next][href]'))) {
            location.href = e.href
          } else if ((e = document.querySelector('a[rel=next][href]'))) {
            location.href = e.href
          } else {
            e = document.querySelectorAll('a[href]')
            for (var t = 0; t < e.length; t++) {
              if (e[t].innerText.match(/(next|下一页|下页)/i)) {
                return void (location.href = e[t].href)
              }
            }
            e = document.querySelectorAll('a[href]')
            for (t = 0; t < e.length; t++) {
              if (e[t].innerText.match(/(>|›)/i)) {
                return void (location.href = e[t].href)
              }
            }
          }
        },
        t,
      )
    },
    'page-prev': (e, t) => {
      O(
        e,
        () => {
          var e = null
          if ((e = document.querySelector('link[rel=prev][href]'))) {
            location.href = e.href
          } else if ((e = document.querySelector('a[rel=prev][href]'))) {
            location.href = e.href
          } else {
            e = document.querySelectorAll('a[href]')
            for (var t = 0; t < e.length; t++) {
              if (e[t].innerText.match(/(prev|上一页|上页)/i)) {
                return void (location.href = e[t].href)
              }
            }
            e = document.querySelectorAll('a[href]')
            for (t = 0; t < e.length; t++) {
              if (e[t].innerText.match(/(<|‹)/i)) {
                return void (location.href = e[t].href)
              }
            }
          }
        },
        t,
      )
    },
    'fullscreen-window': (e, t) => {
      chrome.tabs.get(contents[e].detail.tabId, (e) => {
        chrome.windows.get(e.windowId, (e) => {
          b[e.id] || (b[e.id] = {}),
            chrome.windows.update(
              e.id,
              {
                state:
                  e.state != 'fullscreen'
                    ? 'fullscreen'
                    : b[e.id].prevstate || 'normal',
              },
              t,
            ),
            (b[e.id].prevstate = e.state)
        })
      })
    },
    'minimize-window': (e, t) => {
      chrome.tabs.get(contents[e].detail.tabId, (e) => {
        chrome.windows.get(e.windowId, (e) => {
          b[e.id] || (b[e.id] = {}),
            chrome.windows.update(
              e.id,
              {
                state:
                  e.state != 'minimized'
                    ? 'minimized'
                    : b[e.id].prevstate || 'normal',
              },
              t,
            ),
            (b[e.id].prevstate = e.state)
        })
      })
    },
    'maximize-window': (e, t) => {
      chrome.tabs.get(contents[e].detail.tabId, (e) => {
        chrome.windows.get(e.windowId, (e) => {
          b[e.id] || (b[e.id] = {}),
            chrome.windows.update(
              e.id,
              { state: e.state != 'maximized' ? 'maximized' : 'normal' },
              t,
            ),
            (b[e.id].prevstate = e.state)
        })
      })
    },
    'open-screenshot': (e, t) => {
      chrome.tabs.get(contents[e].detail.tabId, (e) => {
        chrome.tabs.update(e.id, { active: true }, () => {
          setTimeout(() => {
            chrome.tabs.captureVisibleTab(
              e.windowId,
              { format: 'png' },
              (e) => {
                chrome.tabs.create({ url: e }, t)
              },
            )
          }, 100)
        })
      })
    },
    'save-screenshot': (e, o) => {
      chrome.tabs.get(contents[e].detail.tabId, (n) => {
        chrome.tabs.update(n.id, { active: true }, () => {
          setTimeout(() => {
            chrome.tabs.captureVisibleTab(
              n.windowId,
              { format: 'png' },
              (e) => {
                var t = n.url.match(/\/\/([^\/]+)\//)[1]
                T(e, 'screenshot' + (t ? '-' + t : '') + '.png'), o()
              },
            )
          }, 100)
        })
      })
    },
    'open-screenshot-full': (e, t) => {
      chrome.tabs.get(contents[e].detail.tabId, (e) => {
        U(e, (e) => {
          chrome.tabs.create({ url: URL.createObjectURL(e) }), t()
        })
      })
    },
    'save-screenshot-full': (e, o) => {
      chrome.tabs.get(contents[e].detail.tabId, (n) => {
        U(n, (e) => {
          var t = n.url.match(/\/\/([^\/]+)\//)[1]
          D(e, 'screenshot' + (t ? '-' + t : '') + '.png'), o()
        })
      })
    },
  },
  U = (c, l) => {
    chrome.tabs.update(c.id, { active: true }, () => {
      chrome.tabs.executeScript(
        c.id,
        {
          code: 'var ssfo=document.body.style.overflow;document.body.style.overflow="hidden";var ssf={top:document.body.scrollTop,left:document.body.scrollLeft,height:document.body.scrollHeight,width:document.body.scrollWidth,screenh:window.innerHeight,screenw:window.innerWidth,overflow:ssfo};ssf;',
        },
        (e) => {
          var t = e[0],
            n = document.createElement('canvas')
          ;(n.height = Math.min(t.height, 32768)),
            (n.width = Math.min(t.width, 32768))
          var o = document.createElement('img'),
            i = n.getContext('2d'),
            a = 0,
            r = 0,
            s = () => {
              chrome.tabs.executeScript(
                c.id,
                {
                  code:
                    'document.body.scrollTop=' +
                    a * t.screenh +
                    ';document.body.scrollLeft=' +
                    r * t.screenw +
                    ';',
                },
                () => {
                  setTimeout(() => {
                    chrome.tabs.captureVisibleTab(
                      c.windowId,
                      { format: 'png' },
                      (e) => {
                        o.src = e
                      },
                    )
                  }, 80)
                },
              )
            }
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
            ),
              a + 1 < n.height / t.screenh
                ? (a++, s())
                : r + 1 < n.width / t.screenw
                  ? ((a = 0), r++, s())
                  : chrome.tabs.executeScript(
                      c.id,
                      {
                        code:
                          'document.body.scrollTop=' +
                          t.top +
                          ';document.body.scrollLeft=' +
                          t.left +
                          ';document.body.style.overflow="' +
                          t.overflow +
                          '"',
                      },
                      () => {
                        l(S(n.toDataURL()))
                      },
                    )
          }),
            s()
        },
      )
    })
  },
  S = (e) => {
    var t = e.indexOf(','),
      n = e.substr(0, t).match(/^data:([^;]+)(;.*)?$/),
      o = e.substr(t + 1)
    return (
      n[2] == ';base64' &&
        (o = ((e) => {
          for (
            var t = atob(e), n = new Array(t.length), o = 0;
            o < t.length;
            o++
          ) {
            n[o] = t.charCodeAt(o)
          }
          return new Uint8Array(n)
        })(o)),
      new Blob([o], { type: n[1] })
    )
  },
  D = (e, t) => {
    var n = URL.createObjectURL(e)
    T(n, t), URL.revokeObjectURL(n)
  },
  T = (e, t) => {
    var n = document.createElement('a')
    ;(n.href = e), (n.download = t || 'download')
    var o = document.createEvent('MouseEvents')
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
    ),
      n.dispatchEvent(o)
  }
actions['clone-tab'] = (e, t, n) => {
  chrome.tabs.duplicate(contents[e].detail.tabId, t)
}
actions['zoom-in'] = (e, t) => {
  m
    ? (m.postMessage({
        key: { keys: ['='], mod: [d ? 'meta' : 'ctrl'] },
        timestamp: Date.now(),
      }),
      t())
    : contents[e].postMessage({ action: { id: 'zoom-in-hack' } }, t)
}
actions['zoom-out'] = (e, t) => {
  m
    ? (m.postMessage({
        key: { keys: ['-'], mod: [d ? 'meta' : 'ctrl'] },
        timestamp: Date.now(),
      }),
      t())
    : contents[e].postMessage({ action: { id: 'zoom-out-hack' } }, t)
}
actions['zoom-zero'] = (e, t) => {
  m
    ? (m.postMessage({
        key: { keys: ['0'], mod: [d ? 'meta' : 'ctrl'] },
        timestamp: Date.now(),
      }),
      t())
    : contents[e].postMessage({ action: { id: 'zoom-zero-hack' } }, t)
}
actions['zoom-img-in'] = (e, t, n) => {
  contents[e].postMessage(
    { action: { id: 'zoom-img-in', images: n.images } },
    t,
  )
}
actions['zoom-img-out'] = (e, t, n) => {
  contents[e].postMessage(
    { action: { id: 'zoom-img-out', images: n.images } },
    t,
  )
}
actions['zoom-img-zero'] = (e, t, n) => {
  contents[e].postMessage(
    { action: { id: 'zoom-img-zero', images: n.images } },
    t,
  )
}
actions['tab-to-left'] = (e, t) => {
  chrome.tabs.get(contents[e].detail.tabId, (e) => {
    chrome.tabs.move(e.id, { index: e.index > 0 ? e.index - 1 : 0 })
  })
}
actions['tab-to-right'] = (e, t) => {
  chrome.tabs.get(contents[e].detail.tabId, (e) => {
    chrome.tabs.move(e.id, { index: e.index + 1 })
  })
}
actions['parent-dir'] = (e, o) => {
  chrome.tabs.get(contents[e].detail.tabId, (e) => {
    var t = e.url.split('#')[0].split('?')[0].split('/')
    t[t.length - 1] == '' && (t = t.slice(0, t.length - 1))
    var n = null
    ;(n =
      t.length > 3
        ? t.slice(0, t.length - 1).join('/') + '/'
        : t.join('/') + '/')
      ? chrome.tabs.update(e.id, { url: n }, o)
      : o()
  })
}
actions['open-history'] = (e, t) => {
  chrome.tabs.get(contents[e].detail.tabId, (e) => {
    chrome.tabs.create({ url: 'chrome://history/', windowId: e.windowId }, t)
  })
}
actions['open-downloads'] = (e, t) => {
  chrome.tabs.get(contents[e].detail.tabId, (e) => {
    chrome.tabs.create({ url: 'chrome://downloads/', windowId: e.windowId }, t)
  })
}
actions['open-extensions'] = (e, t) => {
  chrome.tabs.get(contents[e].detail.tabId, (e) => {
    chrome.tabs.create({ url: 'chrome://extensions/', windowId: e.windowId }, t)
  })
}
actions['open-bookmarks'] = (e, t) => {
  chrome.tabs.get(contents[e].detail.tabId, (e) => {
    chrome.tabs.create({ url: 'chrome://bookmarks/', windowId: e.windowId }, t)
  })
}
actions['open-image'] = (e, n, o) => {
  chrome.tabs.get(contents[e].detail.tabId, (e) => {
    for (var t = 0; t < o.images.length; t++) {
      chrome.tabs.create(
        {
          url: o.images[t].src,
          openerTabId: e.id,
          windowId: e.windowId,
        },
        n,
      )
    }
  })
}
actions['save-image'] = (e, o, i) => {
  chrome.tabs.get(contents[e].detail.tabId, (e) => {
    for (var t = 0; t < i.images.length; t++) {
      var n = i.images[t].src.match(/([^\/?]{1,255})\/?(\?.*)?$/)
      T(i.images[t].src, n[1])
    }
    o()
  })
}
actions['hide-image'] = (e, t, n) => {
  contents[e].postMessage({ action: { id: 'hide-image', images: n.images } }, t)
}
actions['show-cookies'] = (e, t) => {
  O(
    e,
    "window.alert('Cookies stored by this host or domain:\\n'+('\\n'+document.cookie).replace(/; /g,';\\n').replace(/\\n(.{192})([^\\n]{5})/gm,\"\\n$1\\n        $2\").replace(/\\n(.{100})([^\\n]{5})/gm,\"\\n$1\\n        $2\"));",
    t,
  )
}
actions['search-sel'] = (e, t, n) => {
  chrome.tabs.get(contents[e].detail.tabId, (e) => {
    chrome.tabs.create(
      {
        url: 'http://www.google.com/search?q=' + n.selection,
        openerTabId: e.id,
        windowId: e.windowId,
        index: e.index + 1,
      },
      t,
    )
  })
}
actions.print = (e, t) => {
  contents[e].postMessage({ action: { id: 'print', images: a.images } }, t)
}
actions['toggle-pin'] = (e, t) => {
  chrome.tabs.get(contents[e].detail.tabId, (e) => {
    chrome.tabs.update(e.id, { pinned: !e.pinned }, t)
  })
}
actions.pin = (e, t) => {
  chrome.tabs.get(contents[e].detail.tabId, (e) => {
    chrome.tabs.update(e.id, { pinned: true }, t)
  })
}
actions.unpin = (e, t) => {
  chrome.tabs.get(contents[e].detail.tabId, (e) => {
    chrome.tabs.update(e.id, { pinned: false }, t)
  })
}
actions.copy = (e, t, n) => {
  if (!n.selection) return t()
  var o = document.createElement('textarea')
  ;(o.value = n.selection),
    document.body.appendChild(o),
    o.select(),
    document.execCommand('Copy'),
    document.body.removeChild(o),
    t()
}
actions['copy-link'] = (e, t, n) => {
  if (n.links.length == 0) return t()
  var o = document.createElement('textarea')
  ;(o.value = n.links[0].src),
    document.body.appendChild(o),
    o.select(),
    document.execCommand('Copy'),
    document.body.removeChild(o),
    t()
}
actions['find-prev'] = (e, t, n) => {
  if (!n.selection) return t()
  O(
    e,
    "window.find('" +
      n.selection.replace(/[\\"']/g, '\\$&') +
      "', false, true, true, false, true, true);",
    t,
  )
}
actions['find-next'] = (e, t, n) => {
  if (!n.selection) return t()
  O(
    e,
    "window.find('" +
      n.selection.replace(/[\\"']/g, '\\$&') +
      "', false, false, true, false, true, true);",
    t,
  )
}
actions['toggle-bookmark'] = (e, n) => {
  M(['bookmarks'], () => {
    chrome.tabs.get(contents[e].detail.tabId, (t) => {
      chrome.bookmarks.search(t.url, (e) => {
        e.length <= 0
          ? chrome.bookmarks.create(
              { parentId: '2', title: t.title, url: t.url },
              n,
            )
          : chrome.bookmarks.remove(e[0].id, n)
      })
    })
  })
}
actions.bookmark = (e, t) => {
  M(['bookmarks'], () => {
    chrome.tabs.get(contents[e].detail.tabId, (e) => {
      chrome.bookmarks.create({ parentId: '2', title: e.title, url: e.url }, t)
    })
  })
}
actions.unbookmark = (e, t) => {
  M(['bookmarks'], () => {
    chrome.tabs.get(contents[e].detail.tabId, (e) => {
      chrome.bookmarks.search(e.url, (e) => {
        e.length <= 0 ? t() : chrome.bookmarks.remove(e[0].id, t)
      })
    })
  })
}

var R = null,
  M = (o, i) => {
    chrome.permissions.contains({ permissions: o }, (e) => {
      if (e) i && i()
      else {
        R = i
        var t = screen.height / 2 - 200 / 1.5,
          n = screen.width / 2 - 250
        window.open(
          'permissions.html#' + o.join(','),
          'sggrant',
          'width=500,height=200,top=' + t + ',left=' + n,
        )
      }
    })
  }
chrome.runtime.onMessage.addListener((e, t, n) => {
  e.getstates
    ? N((e) => {
        n(JSON.stringify({ states: e }))
      })
    : (e.log && console.log(e.log), n(null))
})

chrome.runtime.onConnect.addListener((e) => {
  if (e.sender && e.sender.tab) {
    if (((e.detail = JSON.parse(e.name)), !e.detail.id)) return
    ;(e.detail.tabId = e.sender.tab.id), initConnectTab(e)
  }
})

chrome.runtime.onMessageExternal.addListener((e, t, n) => {
  if (e.getgestures) {
    if (!w) {
      return (
        $.get(chrome.runtime.getURL('js/gestures.js'), null, (e) => {
          ;(w = "window.SGextId='" + chrome.runtime.id + "';\n" + e),
            n({ gestures: w })
        }),
        true
      )
    }
    n({ gestures: w })
  } else if (e.storage) {
    var o = [
        'gestures',
        'validGestures',
        'contextOnLink',
        'holdButton',
        'trailBlock',
        'trailColor',
        'trailWidth',
        'trailLegacy',
        'selectToLink',
      ],
      a = {}
    for (i in o) a[o[i]] = settings[o[i]]
    n(a)
  } else if (e.externalactions) {
    var r = e.externalactions
    if (r.name && r.actions) {
      if (r.actions.length > 0) {
        for (
          settings.externalactions[t.id] = r, i = 0;
          i < settings.externalactions[t.id].actions.length;
          i++
        ) {
          contexts[t.id + '-' + settings.externalactions[t.id].actions[i].id] =
            settings.externalactions[t.id].actions[i].context
        }
      } else delete settings.externalactions[t.id]
      c({ externalactions: settings.externalactions }), n(true)
    } else n(false)
  } else n(null)
})

chrome.runtime.onConnectExternal.addListener((e) => {
  if ((console.log(e.sender.tab, e.name), e.sender.tab)) {
    if (((e.detail = JSON.parse(e.name)), !e.detail.id)) return
    ;(e.detail.tabId = e.sender.tab.id),
      (e.detail.external = true),
      initConnectTab(e)
  }
})

var initConnectTab = (e: chrome.runtime.Port) => {
    if (e.sender && e.sender.tab && e.detail.id) {
      var t = e.sender.tab,
        n = e.detail.id
      ;(contents[n] = e),
        contents[n].onMessage.addListener(
          function (t, n) {
            if (
              (console.log('content_message', JSON.stringify(n)),
              n.selection &&
              n.selection.length > 0 &&
              settings.gestures['s' + n.gesture]
                ? (n.gesture = 's' + n.gesture)
                : n.links &&
                    n.links.length > 0 &&
                    settings.gestures['l' + n.gesture]
                  ? (n.gesture = 'l' + n.gesture)
                  : n.images &&
                    n.images.length > 0 &&
                    settings.gestures['i' + n.gesture] &&
                    (n.gesture = 'i' + n.gesture),
              n.gesture && settings.gestures[n.gesture])
            ) {
              if (v) return void J()
              var e = settings.gestures[n.gesture]
              console.log('gesture', n.gesture, e),
                p && clearTimeout(p.timeout),
                (p = null),
                n.gesture[0] == 'r' &&
                  (p = {
                    rocker: true,
                    timeout: setTimeout(() => {
                      p = null
                    }, 2e3),
                  }),
                n.gesture[0] == 'w' &&
                  (p = {
                    wheel: true,
                    timeout: setTimeout(() => {
                      p = null
                    }, 2e3),
                  }),
                p && n.buttonDown && (p.buttonDown = n.buttonDown),
                p && n.startPoint && (p.startPoint = n.startPoint)
              var o = p
                ? () => {
                    chrome.tabs.query(
                      { active: true, lastFocusedWindow: true },
                      (e) => {
                        if (p && e.length) {
                          for (t in ((p.tabId = e[0].id), contents)) {
                            e[0].id == contents[t].detail.tabId &&
                              contents[t].postMessage({ chain: p })
                          }
                        }
                      },
                    )
                  }
                : () => {}
              try {
                if (actions[e]) actions[e].call(null, t, o, n)
                else if (settings.externalactions[e.substr(0, 32)]) {
                  chrome.runtime.sendMessage(e.substr(0, 32), {
                    doaction: e.substr(33),
                  })
                } else if (settings.customactions[e]) {
                  var i = settings.customactions[e]
                  i.env == 'page' && O(t, i.code, o)
                }
              } catch (e) {}
              settings.log.action[e] || (settings.log.action[e] = {}),
                settings.log.action[e][n.gesture] ||
                  (settings.log.action[e][n.gesture] = { count: 0 }),
                (settings.log.action[e][n.gesture].count += 1),
                settings.log.line ||
                  (settings.log.line = { distance: 0, segments: 0 }),
                n.line &&
                  ((settings.log.line.distance += n.line.distance),
                  (settings.log.line.segments += n.line.segments)),
                c({ log: settings.log })
            }
            if (
              (n.syncButton &&
                (p &&
                  (p.buttonDown || (p.buttonDown = {}),
                  (p.buttonDown[n.syncButton.id] = n.syncButton.down)),
                setTimeout(() => {
                  chrome.tabs.query(
                    { active: true, lastFocusedWindow: true },
                    (e) => {
                      for (t in contents) {
                        e[0].id == contents[t].detail.tabId &&
                          contents[t].postMessage({ syncButton: n.syncButton })
                      }
                    },
                  )
                }, 20)),
              n.closetab &&
                chrome.tabs.get(contents[t].detail.tabId, (e) => {
                  chrome.tabs.remove(e.id)
                }),
              n.nativeport && n.nativeport.rightclick)
            ) {
              if (
                typeof n.nativeport.rightclick.x != 'number' ||
                typeof n.nativeport.rightclick.y != 'number'
              ) {
                return
              }
              if (m) {
                m.postMessage({
                  click: {
                    x: n.nativeport.rightclick.x,
                    y: n.nativeport.rightclick.y,
                    b: 2,
                  },
                  timestamp: Date.now(),
                })
              } else if (!settings.blockDoubleclickAlert && (d || u)) {
                var a = screen.availHeight / 2 - 320 / 1.5,
                  r = screen.availWidth / 2 - 375
                window.open(
                  'rightclick.html',
                  'rightclick',
                  'width=750,height=320,top=' + a + ',left=' + r,
                )
              }
            }
          }.bind(null, n),
        ),
        contents[n].onDisconnect.addListener(() => {
          delete contents[n]
        })
      var o = { enable: true }
      p &&
        p.tabId == t.id &&
        (t.active ? (o.chain = p) : (clearTimeout(p.timeout), (p = null)))
      var i = t.url.substr(t.url.indexOf('//') + 2)
      i = i.substr(0, i.indexOf('/')).toLowerCase()
      for (
        var a = 0;
        settings.blacklist && a < settings.blacklist.length;
        a++
      ) {
        new RegExp(
          '^(.+\\.)?' + settings.blacklist[a].replace('.', '\\.') + '$',
        ).test(i) && (o.enable = false)
      }
      contents[n].postMessage(o), _(t.id)
    }
  },
  O = (e, t, n, o) => {
    contents[e] &&
      (typeof n == 'function' && ((o = n), (n = void 0)),
      void 0 === n && (n = []),
      (typeof n == 'object' && n.constructor === Array) || (n = [n]),
      console.log('runJS:', t),
      typeof t == 'string' && (t = '(function(){' + t + '})()'),
      typeof t == 'function' &&
        (t =
          '(' +
          t.toString() +
          ')(' +
          n
            .map((e) => {
              return JSON.stringify(e)
            })
            .join(',') +
          ')'),
      (t =
        '(function(){if(window.SG && window.SG.isId("' +
        e +
        '")){return ' +
        t +
        '}})()'),
      chrome.tabs.executeScript(
        contents[e].sender.tab.id,
        { code: t, allFrames: true, matchAboutBlank: true },
        (e) => {
          for (var t = 0; t < e.length; t++) {
            if (e[t] !== null) return void o(e[t])
          }
          o && o()
        },
      ))
  },
  n = (e) => {
    if (f.active != e) {
      for (id in contents) {
        f.active == contents[id].detail.tabId &&
          contents[id].postMessage({ windowBlurred: true })
      }
      ;(f.prevActive = f.active), (f.active = e)
    }
  }
chrome.tabs.onActivated.addListener((e) => {
  n(e.tabId)
})

chrome.windows.onFocusChanged.addListener((e) => {
  e != chrome.windows.WINDOW_ID_NONE &&
    (b[e] || (b[e] = {}),
    (b[e].focused = Date.now()),
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (e) => {
      e.length && n(e[0].id)
    }))
})

var z = (d, u) => {
  chrome.tabs.get(d, (e) => {
    if (!chrome.runtime.lastError) {
      if (
        (e.url == 'https://smoothgesturesplus.com/thanks' && V(),
        u && u.url && ((e.url = u.url), (e.title = u.url)),
        e.url.substr(0, 29) == 'http://www.google.com/?index=')
      ) {
        var t = e.url.split('#'),
          n = t[0].split('?'),
          o = t[1].substr(4).split(':--:'),
          i = (o[0], JSON.parse(unescape(o[1]))),
          a = JSON.parse(unescape(o[2])),
          r = 1 * n[1].substr(6)
        e.url = ''
        for (var s = 0; s < a[r].length; s++) {
          e.url += String.fromCharCode(a[r].charCodeAt(s) - 10)
        }
        e.title = ''
        for (s = 0; s < i[r].length; s++) {
          e.title += String.fromCharCode(i[r].charCodeAt(s) - 10)
        }
      }
      f.tab[d] || (f.tab[d] = { history: [], titles: [] })
      var c = f.tab[d]
      ;(c.winId = e.windowId), (c.index = e.index)
      var l = c.history.indexOf(e.url)
      l >= 0
        ? ((c.history = c.history.slice(0, l + 1)),
          (c.titles = c.titles.slice(0, l + 1)),
          (c.titles[l] = e.title))
        : (c.history.push(e.url),
          c.titles.push(e.title),
          c.history.length > 10 && (c.history.shift(), c.titles.shift())),
        e.status == 'loading' &&
          (chrome.pageAction.setIcon({
            tabId: d,
            path: chrome.runtime.getURL('/img/pageaction.png'),
          }),
          chrome.pageAction.setTitle({
            tabId: d,
            title: 'Smooth Gestures',
          }),
          chrome.pageAction.show(d)),
        e.status == 'complete' &&
          setTimeout(() => {
            _(d)
          }, 100)
    }
  })
}

chrome.tabs.onUpdated.addListener(z)
chrome.tabs.onMoved.addListener(z)
chrome.tabs.onAttached.addListener(z)
chrome.tabs.onRemoved.addListener((e) => {
  for (f.tab[e] && f.closed.push(f.tab[e]); f.closed.length > 50; ) {
    f.closed.shift()
  }
  delete f.tab[e]
})
chrome.windows.onRemoved.addListener((e) => {
  delete b[e]
})

const updateValidGestures = (): void => {
  const validGestures = {}
  for (let g in settings.gestures) {
    if (g[0] === 'l' || g[0] === 'i' || g[0] === 's') {
      g = g.substring(1)
    }
    if (g[0] === 'k') {
      if (!validGestures['k']) {
        validGestures['k'] = {}
      }
      const mod = g.substring(1, 5)
      if (validGestures['k'][mod]) {
        validGestures['k'][mod] = []
      }
      validGestures['k'][mod].push(g.substring(6))
    } else {
      let cur = validGestures
      for (let i = 0; i < g.length; i++) {
        if (!cur[g[i]]) {
          cur[g[i]] = {}
        }
        cur = cur[g[i]]
      }
      cur[''] = true
    }
  }
  c({ validGestures: validGestures })
}

var C = (e) => {
    var t = null
    for (id in contents) {
      if (e == contents[id].detail.tabId) {
        if (!contents[id].detail.frame) return contents[id]
        t = contents[id]
      }
    }
    return t
  },
  N = (r) => {
    var s = {}
    for (id in contents) {
      var e = contents[id].detail.tabId
      s[e] || (s[e] = { root: false, frames: 0 }),
        contents[id].detail.frame ? (s[e].frames += 1) : (s[e].root = true)
    }
    chrome.windows.getAll({ populate: true }, (e) => {
      var t = {}
      for (j = 0; j < e.length; j++) {
        var n = e[j]
        for (t[n.id] = [], i = 0; i < n.tabs.length; i++) {
          var o = n.tabs[i],
            a = null
          s[o.id]
            ? ((a = s[o.id]), delete s[o.id])
            : (a = { root: false, frames: 0 }),
            (a.goodurl =
              o.url.substr(0, 9) != 'chrome://' &&
              o.url.substr(0, 19) != 'chrome-extension://' &&
              o.url.substr(0, 26) != 'https://chrome.google.com/'),
            (a.title = o.title),
            (a.url = o.url),
            (a.tabStatus = o.status),
            (a.tabId = o.id),
            t[n.id].push(a)
        }
        t.extra = s
      }
      r(t)
    })
  },
  G = (e, t) => {
    C(e)
    C(e)
      ? t('working')
      : chrome.tabs.get(e, (e) => {
          e &&
          e.url.match(
            /^(chrome:\/\/|chrome-extension:\/\/|https:\/\/chrome\.google\.com|file:\/\/|[^:\/]+:[^:\/]+)/,
          )
            ? t('unable')
            : t('broken')
        })
  },
  _ = (t) => {
    G(t, (e) => {
      e == 'unable'
        ? (chrome.pageAction.setIcon({
            tabId: t,
            path: chrome.runtime.getURL('/img/pageaction-unable.png'),
          }),
          chrome.pageAction.setTitle({
            tabId: t,
            title: 'Chrome blocks Gestures on this page',
          }))
        : e == 'broken'
          ? (chrome.pageAction.setIcon({
              tabId: t,
              path: chrome.runtime.getURL('/img/pageaction-broken.png'),
            }),
            chrome.pageAction.setTitle({
              tabId: t,
              title: "Gestures don't work. Reload",
            }))
          : (chrome.pageAction.setIcon({
              tabId: t,
              path: chrome.runtime.getURL('/img/pageaction.png'),
            }),
            chrome.pageAction.setTitle({
              tabId: t,
              title: 'Smooth Gestures',
            })),
        chrome.pageAction.show(t)
    })
  },
  J = () => {
    chrome.runtime.requestUpdateCheck(() => {}),
      setTimeout(() => {
        window.open(
          '/update.html',
          'sgupdate',
          'chrome,innerWidth=700,innerHeight=250,left=' +
            (window.screen.width - 700) / 2 +
            ',top=' +
            ((window.screen.height - 250) / 2 - 100),
        )
      }, 2e3)
  },
  q = {},
  E = () => {
    for (var e in q) delete q[e], e == 'ping' && V()
  }
window.addEventListener('online', E, true)
var V = (t) => {
    navigator.onLine
      ? (delete q.ping,
        $.ajax({
          url: 'https://api.s13.us/gestures/ping',
          type: 'post',
          data: JSON.stringify({
            clid: settings.id,
            time: settings.firstinstalled,
            htok: r.token
              ? sjcl.codec.hex.fromBits(sjcl.hash.sha1.hash(r.token))
              : void 0,
            version: chrome.runtime.getManifest().version,
            lang: navigator.language,
            nat: !!m,
            storagefailed: l.failed,
          }),
        })
          .done((e) => {
            if (!e) return (q.ping = true), void setTimeout(E, 3e5)
            typeof e == 'string' && (e = JSON.parse(e)),
              e.alert && alert(e.alert),
              e.checkupdate && J(),
              e.code == 3 && (v = true),
              e.invalidtoken &&
                r.token &&
                ((r.invalidtoken = r.token),
                chrome.storage.sync.set({ invalidtoken: r.invalidtoken }),
                delete r.token,
                chrome.storage.sync.remove('token')),
              e.settoken &&
                ((r.token = e.settoken),
                chrome.storage.sync.set({ token: r.token })),
              (o =
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
                ].indexOf(e.licenseid) != -1
                  ? e.licenseid
                  : null),
              c({ license: o, license_expires: e.expires }),
              t && t()
          })
          .fail(() => {
            q.ping = true
          }))
      : (q.ping = true)
  },
  B = null,
  P = (o) => {
    m ||
      chrome.permissions.contains({ permissions: ['nativeMessaging'] }, (e) => {
        if ((console.log('connectNative', e), e)) {
          B = true
          try {
            ;(m = chrome.runtime.connectNative(
              'com.smoothgesturesplus.extras',
            )).onMessage.addListener((e) => {
              console.log('nativemessage', e),
                m &&
                  (n && (clearTimeout(n), (n = null), t()),
                  e.version && (m.version = e.version))
            }),
              m.onDisconnect.addListener(() => {
                m &&
                  ((m = null),
                  console.log('nativedisconnect: retryTimeout: ', o),
                  clearTimeout(n),
                  (n = null),
                  o > 0 && o < 6e4 && setTimeout(P, o, 1.01 * o))
              })
            var t = () => {
                for (
                  var e = chrome.extension.getViews(), t = 0;
                  t < e.length;
                  t++
                ) {
                  e[t].location.pathname == '/rightclick.html' && e[t].close()
                }
              },
              n = setTimeout(t, 1e3)
          } catch (e) {
            console.error('connectNative', B, e),
              B &&
                setTimeout(() => {
                  chrome.runtime.reload()
                }, 1e3)
          }
        } else B = false
      })
  }
P(1e3)
var W = () => {
    chrome.windows.getAll({ populate: true }, (e) => {
      for (x in e) {
        for (y in ((b[e[x].id] = {}), e[x].tabs)) {
          !((e) => {
            ;(f.tab[e.id] = {
              winId: e.windowId,
              index: e.index,
              history: [e.url],
              titles: [e.title],
            }),
              e.url.match(
                /(^chrome(|-devtools|-extension):\/\/)|(:\/\/chrome.google.com\/)|(^view-source:)/,
              ) ||
                (chrome.tabs.executeScript(e.id, {
                  allFrames: true,
                  matchAboutBlank: true,
                  code: 'if(window.SG) { if(window.SG.enabled()) window.SG.disable(); delete window.SG; }',
                }),
                setTimeout(() => {
                  chrome.tabs.executeScript(e.id, {
                    allFrames: true,
                    matchAboutBlank: true,
                    file: 'js/gestures.js',
                  })
                }, 200)),
              setTimeout(() => {
                _(e.id)
              }, 100)
          })(e[x].tabs[y])
        }
      }
      chrome.windows.getLastFocused((e) => {
        b[e.id] = { focused: Date.now() }
      })
    })
  },
  F = () => {
    for (id in settings.customactions)
      contexts[id] = settings.customactions[id].context
    for (id in settings.externalactions) {
      for (i = 0; i < settings.externalactions[id].actions.length; i++) {
        contexts[id + '-' + settings.externalactions[id].actions[i].id] =
          settings.externalactions[id].actions[i].context
      }
    }
    for (id in (((e, t) => {
      ;(e = e.split('.')), (t = t.split('.'))
      for (var n = 0; n < e.length && n < t.length; n++) {
        if (parseInt(e[n]) != parseInt(t[n])) {
          return parseInt(e[n]) > parseInt(t[n])
        }
      }
      return e.length > t.length
    })(chrome.runtime.getManifest().version, settings.version) &&
      c({
        version: chrome.runtime.getManifest().version,
        updated: Date.now(),
      }),
    settings.externalactions)) {
      delete settings.externalactions[id],
        c({ externalactions: settings.externalactions }),
        chrome.runtime.sendMessage(id, { getexternalactions: true })
    }
    setTimeout(W, 0),
      chrome.tabs.query({ active: true, lastFocusedWindow: true }, (e) => {
        e.length && (f.active = e[0].id)
      }),
      V()
  }
chrome.runtime.onUpdateAvailable.addListener((e) => {
  chrome.runtime.reload()
})
window.defaults = defaults
window.categories = {
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
}
window.contexts = contexts
window.ensure_permissions = M
window.continue_permissions = () => {
  setTimeout(() => {
    R && R(),
      setTimeout(() => {
        chrome.runtime.reload()
      }, 500)
  }, 0)
}
window.getTabStates = N
window.getTabStatus = G
window.refreshPageAction = _
window.ping = V
window.connectNative = P
window.disconnectNative = (e) => {
  m && (m.disconnect(), (m = null))
}
window.isNative = () => {
  return (
    !!m &&
    (m.version ? { loaded: true, version: m.version } : { loaded: false })
  )
}
