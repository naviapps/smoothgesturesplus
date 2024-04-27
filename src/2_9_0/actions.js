import browser from 'webextension-polyfill'

const undoClose = async (id): Promise<void> => {
  if (activeTabs.closed.length > 0) {
    var n = activeTabs.closed.pop()
    await browser.tabs.create({
      url: n.history[n.history.length - 1],
      index: n.index,
      windowId: n.winId,
      active: true,
    })
  }
}

const prevTab = async (id): Promise<void> => {
  let tabId = null
  for (let i = tabs.length - 1; i >= 0; i -= 1) {
    tabId = tabs[(n.index + i) % tabs.length].id
    if (contentForTab(tabId)) {
      await browser.tabs.update(tabId, { active: true })
      return
    }
  }
}

const nextTab = async (id): Promise<void> => {
  var tabId = null
  for (let i = 1; i <= tabs.length; i += 1) {
    tabId = tabs[(tab.index + i) % tabs.length].id
    if (contentForTab(tabId)) {
      await browser.tabs.update(tabId, { active: true })
      return
    }
  }
}

const mergeTabs = async (id, call): Promise<void> => {
  const currentTab = await browser.tabs.get(contents[id].detail.tabId)
  const tabs = await browser.tabs.query({ windowId: currentTab.windowId })

  var t = []
  for (var n in b) b[n].focused > 0 && t.push([n, b[n]])
  if (!(t.length < 2)) {
    t.sort((e, t) => {
      return e.focused > t.focused ? 1 : e.focused < t.focused ? -1 : 0
    })
    var o = parseInt(t[t.length - 2][0])
    if (o) {
      for (i = 0; i < tabs.length; i += 1) {
        browser.tabs.move(tabs[i].id, { windowId: o, index: 1e6 })
      }
      await browser.tabs.update(currentTab.id, { active: true }, () => {
        await browser.windows.update(o, { focused: true }, call)
      })
    }
  }
}

const pageBackClose = async (id, call): Promise<void> => {
  contents[id].postMessage(
    {
      action: {
        id: 'page-back-close',
        has_history: activeTabs.tab[contents[id].detail.tabId].history.length > 1,
      },
    },
    call,
  )
}

const fullscreenWindow = async (id, call): Promise<void> => {
  const tab = await browser.tabs.get(contents[id].detail.tabId)
  const win = await browser.windows.get(e.windowId)
  b[e.id] || (b[e.id] = {})
  browser.windows.update(e.id, {
    state: win.state !== 'fullscreen' ? 'fullscreen' : b[e.id].prevstate || 'normal',
  }),
    (b[e.id].prevstate = e.state)
}

const minimizeWindow = async (id, call): Promise<void> => {
  browser.tabs.get(contents[id].detail.tabId, (e) => {
    browser.windows.get(e.windowId, (e) => {
      b[e.id] || (b[e.id] = {}),
        browser.windows.update(
          e.id,
          {
            state: e.state != 'minimized' ? 'minimized' : b[e.id].prevstate || 'normal',
          },
          call,
        ),
        (b[e.id].prevstate = e.state)
    })
  })
}

const maximizeWindow = async (id, call): Promise<void> => {
  browser.tabs.get(contents[id].detail.tabId, (e) => {
    browser.windows.get(e.windowId, (e) => {
      b[e.id] || (b[e.id] = {}),
        browser.windows.update(
          e.id,
          { state: e.state != 'maximized' ? 'maximized' : 'normal' },
          call,
        ),
        (b[e.id].prevstate = e.state)
    })
  })
}

const saveScreenshot = async (id, call): Promise<void> => {
  var t = tab.url.match(/\/\/([^\/]+)\//)[1]
  T(dataUrl, `screenshot${t ? `-${t}` : ''}.png`)
  call()
}

const openScreenshotFull = async (id, call): Promise<void> => {
  browser.tabs.get(contents[id].detail.tabId, (e) => {
    U(e, (e) => {
      browser.tabs.create({ url: URL.createObjectURL(e) }), call()
    })
  })
}

const saveScreenshotFull = async (id, call): Promise<void> => {
  browser.tabs.get(contents[id].detail.tabId, (n) => {
    U(n, (e) => {
      var t = n.url.match(/\/\/([^\/]+)\//)[1]
      D(e, 'screenshot' + (t ? '-' + t : '') + '.png'), call()
    })
  })
}

const zoomIn = async (): Promise<void> => {
  if (pluginport) {
    pluginport.postMessage({
      key: { keys: ['='], mod: [d ? 'meta' : 'ctrl'] },
      timestamp: Date.now(),
    })
  } else {
    port.postMessage({ action: { id: 'zoom-in' } })
  }
}

const zoomOut = async (): Promise<void> => {
  if (pluginport) {
    pluginport.postMessage({
      key: { keys: ['-'], mod: [d ? 'meta' : 'ctrl'] },
      timestamp: Date.now(),
    })
  } else {
    port.postMessage({ action: { id: 'zoom-out' } })
  }
}

const zoomZero = async (): Promise<void> => {
  if (pluginport) {
    pluginport.postMessage({
      key: { keys: ['0'], mod: [d ? 'meta' : 'ctrl'] },
      timestamp: Date.now(),
    })
  } else {
    port.postMessage({ action: { id: 'zoom-zero' } })
  }
}

const sageImage = async (id, call, message): Promise<void> => {
  const tab = await browser.tabs.get(contents[id].detail.tabId)
  for (let i = 0; i < message.images.length; i += 1) {
    var n = message.images[i].src.match(/([^\/?]{1,255})\/?(\?.*)?$/)
    T(message.images[i].src, n[1])
  }
}
