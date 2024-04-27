var e = {}
for (a in console) e[a] = console[a]
if ('update_url' in chrome.runtime.getManifest()) {
  for (a in console) console[a] = () => {}
}
var settings = {}
var r = {}
var c = (e, t) => {
  let n = Date.now()
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

chrome.storage.sync.get(null, (items): void => {
  if (chrome.runtime.lastError) {
    l.failed ||
      alert(
        "Google Chrome's storage may be corrupted. Extensions may not work properly.\n\nTry closing and restarting Chrome.\n\nIf that doesn't work, reinstall the browser to fix this problem.",
      )
    l.failed = true
    console.log('chrome.storage failure')
    r = JSON.parse(localStorage.sync)
  } else {
    r = items
    localStorage.sync = JSON.stringify(items)
  }
  if (--l.initcount === 0) {
    l.init()
  }
})

l.changed = (e, t) => {
  if (t === 'local') {
    var n = {}
    for (key in (console.log('localchanged', e), e)) {
      settings[key] = e[key].newValue
      if (r.sync && r.sync[key]) {
        r[key] = n[key] = e[key].newValue
      }
      console.log('syncsync', key, r.sync && r.sync[key], n)
    }
    console.log('updatesync', Object.keys(n).length, n)
    Object.keys(n).length && chrome.storage.sync.set(n)
    l.localChanged(e)
  } else if (t === 'sync') {
    if (e.firstinstalled) {
      if (!e.firstinstalled.newValue) {
        chrome.storage.sync.set(r)
        return
      }
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
  if (((r.sync.gestures = true), (r.sync.customactions = true), !settings.installed)) {
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
  for (key in (r.firstinstalled > settings.installed && (r.firstinstalled = settings.installed),
  r.sync)) {
    r.sync[key] && void 0 !== r[key] && (r[key + '+ts'] || 0) >= (settings[key + '+ts'] || 0)
      ? ((settings[key] = r[key]), (settings[key + '+ts'] = r[key + '+ts'] || Date.now()))
      : r.sync[key] &&
        void 0 !== settings[key] &&
        (settings[key + '+ts'] || 0) >= (r[key + '+ts'] || 0) &&
        ((r[key] = settings[key]), (r[key + '+ts'] = settings[key + '+ts'] || Date.now()))
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
    window.open('rightclick.html', 'rightclick', 'width=750,height=320,top=' + t + ',left=' + n)
  }
  chrome.storage.sync.set(r, () => {
    chrome.storage.local.set(settings, F)
  })
}

l.localChanged = (e) => {
  if (e.gestures) {
    updateValidGestures()
  }
  if (e.license_expires && e.license_expires.oldValue < Date.now() && !e.license_expires.newValue) {
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
var pluginport = null
var contents = {}
var activeTabs = { active: null, prevActive: null, closed: [], tab: {} }
var b = {}
var w = null
var chainGesture = null
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

const U = (c, l) => {
  chrome.tabs.update(c.id, { active: true }, () => {
    chrome.tabs.executeScript(
      c.id,
      {
        code: 'var ssfo=document.body.style.overflow;document.body.style.overflow="hidden";var ssf={top:document.body.scrollTop,left:document.body.scrollLeft,height:document.body.scrollHeight,width:document.body.scrollWidth,screenh:window.innerHeight,screenw:window.innerWidth,overflow:ssfo};ssf;',
      },
      (e) => {
        var t = e[0],
          n = document.createElement('canvas')
        ;(n.height = Math.min(t.height, 32768)), (n.width = Math.min(t.width, 32768))
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
                  chrome.tabs.captureVisibleTab(c.windowId, { format: 'png' }, (e) => {
                    o.src = e
                  })
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
              ? ((a += 1), s())
              : r + 1 < n.width / t.screenw
                ? ((a = 0), (r += 1), s())
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
}

const S = (e) => {
  var t = e.indexOf(','),
    n = e.substr(0, t).match(/^data:([^;]+)(;.*)?$/),
    o = e.substr(t + 1)
  return (
    n[2] == ';base64' &&
      (o = ((e) => {
        for (var t = atob(e), n = new Array(t.length), o = 0; o < t.length; o += 1) {
          n[o] = t.charCodeAt(o)
        }
        return new Uint8Array(n)
      })(o)),
    new Blob([o], { type: n[1] })
  )
}

const D = (e, t) => {
  var n = URL.createObjectURL(e)
  T(n, t), URL.revokeObjectURL(n)
}

const T = (e, t) => {
  var n = document.createElement('a')
  ;(n.href = e), (n.download = t || 'download')
  var o = document.createEvent('MouseEvents')
  o.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
  n.dispatchEvent(o)
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.getstates) {
    N((e2) => {
      sendResponse(JSON.stringify({ states: e2 }))
    })
  } else {
    if (message.log) {
      console.log(message.log)
    }
    sendResponse(null)
  }
})

chrome.runtime.onConnect.addListener((port: chrome.runtime.Port): void => {
  if (port.sender && port.sender.tab) {
    port.detail = JSON.parse(port.name)
    if (!port.detail.id) return
    port.detail.tabId = port.sender.tab.id
    initConnectTab(port)
  }
})

chrome.runtime.onMessageExternal.addListener((request, sender, n) => {
  if (request.getgestures) {
    if (!w) {
      return (
        $.get(chrome.runtime.getURL('js/gestures.js'), null, (e) => {
          ;(w = "window.SGextId='" + chrome.runtime.id + "';\n" + e), n({ gestures: w })
        }),
        true
      )
    }
    n({ gestures: w })
  } else if (request.storage) {
    var o = [
        'gestures',
        'validGestures',
        'contextOnLink',
        'holdButton',
        'trailBlock',
        'trailColor',
        'trailWidth',
        'selectToLink',
      ],
      a = {}
    for (i in o) a[o[i]] = settings[o[i]]
    n(a)
  } else if (request.externalactions) {
    var r = request.externalactions
    if (r.name && r.actions) {
      if (r.actions.length > 0) {
        for (
          settings.externalactions[sender.id] = r, i = 0;
          i < settings.externalactions[sender.id].actions.length;
          i += 1
        ) {
          contexts[sender.id + '-' + settings.externalactions[sender.id].actions[i].id] =
            settings.externalactions[sender.id].actions[i].context
        }
      } else delete settings.externalactions[sender.id]
      c({ externalactions: settings.externalactions }), n(true)
    } else n(false)
  } else n(null)
})

chrome.runtime.onConnectExternal.addListener((e) => {
  console.log(e.sender.tab, e.name)
  if (e.sender.tab) {
    e.detail = JSON.parse(e.name)
    if (!e.detail.id) return
    e.detail.tabId = e.sender.tab.id
    e.detail.external = true
    initConnectTab(e)
  }
})

const initConnectTab = (port: chrome.runtime.Port) => {
  if (!port.sender || !port.sender.tab || !port.detail.id) return
  const tab = port.sender.tab
  const id = port.detail.id
  contents[id] = port
  contents[id].onMessage.addListener((message, sender) => {
    console.log('content_message', JSON.stringify(sender))
    if (
      message.selection &&
      message.selection.length > 0 &&
      settings.gestures[`s${message.gesture}`]
    ) {
      message.gesture = `s${message.gesture}`
    } else if (
      sender.links &&
      message.links.length > 0 &&
      settings.gestures[`l${message.gesture}`]
    ) {
      message.gesture = `l${message.gesture}`
    } else if (
      message.images &&
      message.images.length > 0 &&
      settings.gestures[`i${sender.gesture}`]
    ) {
      message.gesture = `i${sender.gesture}`
    }
    if (message.gesture && settings.gestures[sender.gesture]) {
      if (v) {
        J()
        return
      }
      const gesture = settings.gestures[message.gesture]
      console.log('gesture', message.gesture, gesture)
      if (chainGesture) {
        clearTimeout(chainGesture.timeout)
      }
      chainGesture = null
      if (message.gesture[0] === 'r') {
        chainGesture = {
          rocker: true,
          timeout: setTimeout(() => {
            chainGesture = null
          }, 2e3),
        }
      }
      if (message.gesture[0] === 'w') {
        chainGesture = {
          wheel: true,
          timeout: setTimeout(() => {
            chainGesture = null
          }, 2e3),
        }
      }
      if (chainGesture && message.buttonDown) {
        chainGesture.buttonDown = message.buttonDown
      }
      if (chainGesture && message.startPoint) {
        chainGesture.startPoint = message.startPoint
      }
      var o = chainGesture
        ? () => {
            chrome.tabs.query({ active: true, lastFocusedWindow: true }, (e) => {
              if (chainGesture && e.length) {
                for (message in ((chainGesture.tabId = e[0].id), contents)) {
                  e[0].id === contents[message].detail.tabId &&
                    contents[message].postMessage({ chain: chainGesture })
                }
              }
            })
          }
        : () => {}
      try {
        if (actions[gesture]) {
          actions[gesture].call(null, message, o, sender)
        } else if (settings.externalactions[gesture.substring(0, 32)]) {
          chrome.runtime.sendMessage(gesture.substring(0, 32), {
            doaction: gesture.substring(33),
          })
        } else if (settings.customactions[gesture]) {
          const i = settings.customactions[gesture]
          if (i.env === 'page') {
            runJS(message, i.code, o)
          }
        }
      } catch (ex) {
        /* empty */
      }
      if (!settings.log.action[gesture]) {
        settings.log.action[gesture] = {}
      }
      if (!settings.log.action[gesture][sender.gesture]) {
        settings.log.action[gesture][sender.gesture] = { count: 0 }
      }
      settings.log.action[gesture][sender.gesture].count += 1
      if (!settings.log.line) {
        settings.log.line = { distance: 0, segments: 0 }
      }
      if (sender.line) {
        settings.log.line.distance += sender.line.distance
        settings.log.line.segments += sender.line.segments
      }
      c({ log: settings.log })
    }
    if (
      (sender.syncButton &&
        (chainGesture &&
          (chainGesture.buttonDown || (chainGesture.buttonDown = {}),
          (chainGesture.buttonDown[sender.syncButton.id] = sender.syncButton.down)),
        setTimeout(() => {
          chrome.tabs.query({ active: true, lastFocusedWindow: true }, (e) => {
            for (message in contents) {
              e[0].id == contents[message].detail.tabId &&
                contents[message].postMessage({ syncButton: sender.syncButton })
            }
          })
        }, 20)),
      sender.closetab &&
        chrome.tabs.get(contents[message].detail.tabId, (e) => {
          chrome.tabs.remove(e.id)
        }),
      sender.nativeport && sender.nativeport.rightclick)
    ) {
      if (
        typeof sender.nativeport.rightclick.x !== 'number' ||
        typeof sender.nativeport.rightclick.y !== 'number'
      ) {
        return
      }
      if (pluginport) {
        pluginport.postMessage({
          click: {
            x: sender.nativeport.rightclick.x,
            y: sender.nativeport.rightclick.y,
            b: 2,
          },
          timestamp: Date.now(),
        })
      } else if (!settings.blockDoubleclickAlert && (d || u)) {
        const a2 = window.screen.availHeight / 2 - 320 / 1.5
        const r2 = window.screen.availWidth / 2 - 375
        window.open('rightclick.html', 'rightclick', `width=750,height=320,top=${a2},left=${r2}`)
      }
    }
  })
  contents[id].onDisconnect.addListener(() => {
    delete contents[id]
  })
  const message = { enable: true }
  if (chainGesture && chainGesture.tabId === tab.id) {
    if (tab.active) {
      message.chain = chainGesture
    } else {
      clearTimeout(chainGesture.timeout)
      chainGesture = null
    }
  }
  let domain = tab.url.substring(tab.url.indexOf('//') + 2)
  domain = domain.substring(0, domain.indexOf('/')).toLowerCase()
  for (let i = 0; settings.blacklist && i < settings.blacklist.length; i += 1) {
    if (new RegExp(`^(.+\\.)?${settings.blacklist[i].replace('.', '\\.')}$`).test(domain)) {
      message.enable = false
    }
  }
  contents[id].postMessage(message)

  refreshPageAction(tab.id)
}

const runJS = (id, JS, call, o) => {
  if (contents[id]) {
    if (typeof call === 'function') {
      o = call
      call = undefined
    }
    if (undefined === call) {
      call = []
    }
    if (typeof call !== 'object' || call.constructor !== Array) {
      call = [call]
    }
    console.log('runJS:', JS)
    if (typeof JS == 'string') {
      JS = `(function(){${JS}})()`
    }
    if (typeof JS === 'function') {
      JS = `(${JS.toString()})(${call
        .map((e) => {
          return JSON.stringify(e)
        })
        .join(',')})`
    }
    JS = `(function(){if(window.SG && window.SG.isId("${id}")){return ${JS}}})()`

    chrome.tabs.executeScript(
      contents[id].sender.tab.id,
      { code: JS, allFrames: true, matchAboutBlank: true },
      (e) => {
        for (let t = 0; t < e.length; t += 1) {
          if (e[t] !== null) return void o(e[t])
        }
        o && o()
      },
    )
  }
}

const n = (e) => {
  if (activeTabs.active !== e) {
    for (id in contents) {
      activeTabs.active === contents[id].detail.tabId &&
        contents[id].postMessage({ windowBlurred: true })
    }
    ;(activeTabs.prevActive = activeTabs.active), (activeTabs.active = e)
  }
}

chrome.tabs.onActivated.addListener((activeInfo) => {
  n(activeInfo.tabId)
})

chrome.windows.onFocusChanged.addListener((windowId) => {
  windowId !== chrome.windows.WINDOW_ID_NONE &&
    (b[windowId] || (b[windowId] = {}),
    (b[windowId].focused = Date.now()),
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (e) => {
      e.length && n(e[0].id)
    }))
})

const updateActiveTab = (d, u) => {
  chrome.tabs.get(d, (e) => {
    if (!chrome.runtime.lastError) {
      if (
        (e.url === 'https://smoothgesturesplus.com/thanks' && V(),
        u && u.url && ((e.url = u.url), (e.title = u.url)),
        e.url.substr(0, 29) === 'http://www.google.com/?index=')
      ) {
        var t = e.url.split('#'),
          n = t[0].split('?'),
          o = t[1].substr(4).split(':--:'),
          i = (o[0], JSON.parse(unescape(o[1]))),
          a = JSON.parse(unescape(o[2])),
          r = 1 * n[1].substr(6)
        e.url = ''
        for (var s = 0; s < a[r].length; s += 1) {
          e.url += String.fromCharCode(a[r].charCodeAt(s) - 10)
        }
        e.title = ''
        for (s = 0; s < i[r].length; s += 1) {
          e.title += String.fromCharCode(i[r].charCodeAt(s) - 10)
        }
      }
      activeTabs.tab[d] || (activeTabs.tab[d] = { history: [], titles: [] })
      var c = activeTabs.tab[d]
      ;(c.winId = e.windowId), (c.index = e.index)
      var l = c.history.indexOf(e.url)
      l >= 0
        ? ((c.history = c.history.slice(0, l + 1)),
          (c.titles = c.titles.slice(0, l + 1)),
          (c.titles[l] = e.title))
        : (c.history.push(e.url),
          c.titles.push(e.title),
          c.history.length > 10 && (c.history.shift(), c.titles.shift())),
        e.status === 'loading' &&
          (chrome.pageAction.setIcon({
            tabId: d,
            path: chrome.runtime.getURL('/img/pageaction.png'),
          }),
          chrome.pageAction.setTitle({
            tabId: d,
            title: 'Smooth Gestures',
          }),
          chrome.pageAction.show(d)),
        e.status === 'complete' &&
          setTimeout(() => {
            refreshPageAction(d)
          }, 100)
    }
  })
}

chrome.tabs.onUpdated.addListener(updateActiveTab)
chrome.tabs.onMoved.addListener(updateActiveTab)
chrome.tabs.onAttached.addListener(updateActiveTab)

/*
 * Tab Removal
 */
chrome.tabs.onRemoved.addListener((tabId) => {
  for (
    activeTabs.tab[tabId] && activeTabs.closed.push(activeTabs.tab[tabId]);
    activeTabs.closed.length > 50;

  ) {
    activeTabs.closed.shift()
  }
  delete activeTabs.tab[tabId]
})
chrome.windows.onRemoved.addListener((winId) => {
  delete b[winId]
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
      for (let i = 0; i < g.length; i += 1) {
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

const contentForTab = (tabId) => {
  let frameContent = null
  for (const id in contents) {
    if (tabId === contents[id].detail.tabId) {
      if (!contents[id].detail.frame) return contents[id]
      frameContent = contents[id]
    }
  }
  return frameContent
}

const N = (r) => {
  var s = {}
  for (id in contents) {
    var e = contents[id].detail.tabId
    s[e] || (s[e] = { root: false, frames: 0 }),
      contents[id].detail.frame ? (s[e].frames += 1) : (s[e].root = true)
  }
  chrome.windows.getAll({ populate: true }, (e) => {
    var t = {}
    for (j = 0; j < e.length; j += 1) {
      var n = e[j]
      for (t[n.id] = [], i = 0; i < n.tabs.length; i += 1) {
        var o = n.tabs[i],
          a = null
        s[o.id] ? ((a = s[o.id]), delete s[o.id]) : (a = { root: false, frames: 0 }),
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
}

const G = (e, t) => {
  contentForTab(e)
  contentForTab(e)
    ? t('working')
    : chrome.tabs.get(e, (e) => {
        e &&
        e.url.match(
          /^(chrome:\/\/|chrome-extension:\/\/|https:\/\/chrome\.google\.com|file:\/\/|[^:\/]+:[^:\/]+)/,
        )
          ? t('unable')
          : t('broken')
      })
}

const refreshPageAction = (t) => {
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
}

const J = () => {
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
}

var q = {}

var E = () => {
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
          htok: r.token ? sjcl.codec.hex.fromBits(sjcl.hash.sha1.hash(r.token)) : void 0,
          version: chrome.runtime.getManifest().version,
          lang: navigator.language,
          nat: !!pluginport,
          storagefailed: l.failed,
        }),
      })
        .done((e) => {
          if (!e) return (q.ping = true), void setTimeout(E, 3e5)
          if (typeof e == 'string') {
            e = JSON.parse(e)
          }
          if (e.alert) alert(e.alert)
          if (e.checkupdate) J()
          if (e.code === 3) {
            v = true
          }
          if (e.invalidtoken && r.token) {
            r.invalidtoken = r.token
            chrome.storage.sync.set({ invalidtoken: r.invalidtoken })
            delete r.token
            chrome.storage.sync.remove('token')
          }
          if (e.settoken) {
            r.token = e.settoken
            chrome.storage.sync.set({ token: r.token })
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
              : null
          c({ license: o, license_expires: e.expires })
          if (t) t()
        })
        .fail(() => {
          q.ping = true
        }))
    : (q.ping = true)
}
var B = null
var P = (o) => {
  pluginport ||
    chrome.permissions.contains({ permissions: ['nativeMessaging'] }, (e) => {
      if ((console.log('connectNative', e), e)) {
        B = true
        try {
          ;(pluginport = chrome.runtime.connectNative(
            'com.smoothgesturesplus.extras',
          )).onMessage.addListener((e) => {
            console.log('nativemessage', e)
            if (pluginport) {
              if (n) {
                clearTimeout(n)
                n = null
                t()
              }
              if (e.version) {
                pluginport.version = e.version
              }
            }
          }),
            pluginport.onDisconnect.addListener(() => {
              pluginport &&
                ((pluginport = null),
                console.log('nativedisconnect: retryTimeout: ', o),
                clearTimeout(n),
                (n = null),
                o > 0 && o < 6e4 && setTimeout(P, o, 1.01 * o))
            })
          var t = () => {
              for (var e = chrome.extension.getViews(), t = 0; t < e.length; t += 1) {
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

const W = () => {
  chrome.windows.getAll({ populate: true }, (e) => {
    for (x in e) {
      for (y in ((b[e[x].id] = {}), e[x].tabs)) {
        !((e) => {
          ;(activeTabs.tab[e.id] = {
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
              refreshPageAction(e.id)
            }, 100)
        })(e[x].tabs[y])
      }
    }
    chrome.windows.getLastFocused((win) => {
      b[win.id] = { focused: Date.now() }
    })
  })
}

const F = () => {
  for (id in settings.customactions) {
    contexts[id] = settings.customactions[id].context
  }
  for (id in settings.externalactions) {
    for (i = 0; i < settings.externalactions[id].actions.length; i += 1) {
      contexts[id + '-' + settings.externalactions[id].actions[i].id] =
        settings.externalactions[id].actions[i].context
    }
  }
  for (id in (((e, t) => {
    ;(e = e.split('.')), (t = t.split('.'))
    for (var n = 0; n < e.length && n < t.length; n += 1) {
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
  setTimeout(W, 0)
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (e) => {
    e.length && (activeTabs.active = e[0].id)
  })
  V()
}

chrome.runtime.onUpdateAvailable.addListener((): void => {
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
window.getTabStates = N
window.getTabStatus = G
window.refreshPageAction = refreshPageAction
window.ping = V
window.connectNative = P
window.disconnectNative = (): void => {
  if (pluginport) {
    pluginport.disconnect()
    pluginport = null
  }
}
window.isNative = () => {
  return (
    !!pluginport &&
    (pluginport.version ? { loaded: true, version: pluginport.version } : { loaded: false })
  )
}
