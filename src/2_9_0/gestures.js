var e = {}
for (a in console) e[a] = console[a]
if ('update_url' in chrome.runtime.getManifest()) for (a in console) console[a] = () => {}

var settings = {}

chrome.storage.local.get(null, (items) => {
  settings = items
  l()
})
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local') {
    for (const key in changes) {
      settings[key] = changes[key].newValue
    }
  }
})

const SmoothGestures = () => {
  var g = this
  g.isId = (e) => {
    return id === e
  }
  var enabled = !(g.postMessage = (e, t) => {
    id === e && port && port.postMessage(t)
  })

  const localAction = (action): void => {
    if (action.id === 'page-back-close') {
      const t = window.location.href
      window.history.back()
      if (!action.has_history) {
        setTimeout(() => {
          if (t === window.location.href) {
            port.postMessage({ closetab: true })
          }
        }, 400)
      }
    } else if (action.id === 'goto-top') {
      for (
        var n = action.startPoint
          ? document.elementFromPoint(action.startPoint.x, action.startPoint.y)
          : document.documentElement;
        n !== document.documentElement &&
        n.parentNode &&
        (n.scrollHeight <= n.clientHeight ||
          n.scrollTop === 0 ||
          ['auto', 'scroll'].indexOf(document.defaultView.getComputedStyle(n)['overflow-y']) ===
            -1);

      ) {
        n = n.parentNode
      }
      if (n === document.documentElement) {
        document.body.scrollTop = 0
      }
      n.scrollTop = 0
    } else if (action.id === 'goto-bottom') {
      for (
        n = action.startPoint
          ? document.elementFromPoint(action.startPoint.x, action.startPoint.y)
          : document.documentElement;
        n !== document.documentElement &&
        n.parentNode &&
        (n.scrollHeight <= n.clientHeight ||
          n.scrollTop === n.scrollHeight - n.clientHeight ||
          ['auto', 'scroll'].indexOf(document.defaultView.getComputedStyle(n)['overflow-y']) ===
            -1);

      ) {
        n = n.parentNode
      }
      if (n === document.documentElement) {
        document.body.scrollTop = document.body.scrollHeight
      }
      n.scrollTop = n.scrollHeight
    } else if (action.id === 'page-up') {
      for (
        n = action.startPoint
          ? document.elementFromPoint(action.startPoint.x, action.startPoint.y)
          : document.documentElement;
        n !== document.documentElement &&
        n.parentNode &&
        (n.scrollHeight <= n.clientHeight ||
          n.scrollTop === 0 ||
          ['auto', 'scroll'].indexOf(document.defaultView.getComputedStyle(n)['overflow-y']) ===
            -1);

      ) {
        n = n.parentNode
      }
      if (n === document.documentElement) {
        document.body.scrollTop -=
          0.8 * Math.min(document.documentElement.clientHeight, document.body.clientHeight)
      }
      n.scrollTop -= 0.8 * Math.min(document.documentElement.clientHeight, n.clientHeight)
    } else if (action.id === 'page-down') {
      for (
        n = action.startPoint
          ? document.elementFromPoint(action.startPoint.x, action.startPoint.y)
          : document.documentElement;
        n !== document.documentElement &&
        n.parentNode &&
        (n.scrollHeight <= n.clientHeight ||
          n.scrollTop === n.scrollHeight - n.clientHeight ||
          ['auto', 'scroll'].indexOf(document.defaultView.getComputedStyle(n)['overflow-y']) ===
            -1);

      )
        n = n.parentNode
      console.log(
        'scroll',
        n,
        n.scrollTop,
        document.body.scrollTop,
        document.documentElement.clientHeight,
        document.body.clientHeight,
        n.clientHeight,
      )
      if (n === document.documentElement) {
        document.body.scrollTop +=
          0.8 * Math.min(document.documentElement.clientHeight, document.body.clientHeight)
      }
      console.log('scroll2', n.scrollTop, document.body.scrollTop)
      n.scrollTop += 0.8 * Math.min(document.documentElement.clientHeight, n.clientHeight)
      console.log('scroll3', n.scrollTop, document.body.scrollTop)
    } else if (action.id === 'zoom-in-hack') {
      var o = document.body.style.zoom ? 1.1 * document.body.style.zoom : 1.1
      document.body.style.zoom = o
      canvas.style.zoom = 1 / o
    } else if (action.id === 'zoom-out-hack') {
      o = document.body.style.zoom ? document.body.style.zoom / 1.1 : 1 / 1.1
      document.body.style.zoom = o
      canvas.style.zoom = 1 / o
    } else if (action.id === 'zoom-zero-hack') {
      document.body.style.zoom = 1
      canvas.style.zoom = 1
    } else if (action.id === 'zoom-img-in') {
      for (let i = 0; i < action.images.length; i += 1) {
        const l = $(`img[gestureid='${action.images[i].gestureid}']`)
        if (!l.attr('origsize')) {
          l.attr('origsize', `${l.width()}x${l.height()}`)
        }
        l.css({ width: 1.2 * l.width(), height: 1.2 * l.height() })
      }
    } else if (action.id === 'zoom-img-out') {
      for (let i = 0; i < action.images.length; i += 1) {
        const l = $(`img[gestureid='${action.images[i].gestureid}']`)
        if (!l.attr('origsize')) {
          l.attr('origsize', `${l.width()}x${l.height()}`)
        }
        l.css({ width: l.width() / 1.2, height: l.height() / 1.2 })
      }
    } else if (action.id === 'zoom-img-zero') {
      for (let i = 0; i < action.images.length; i += 1) {
        const l = $(`img[gestureid='${action.images[i].gestureid}']`)
        if (!l.attr('origsize')) {
          return
        }
        const r = l.attr('origsize').split('x')
        l.css({ width: `${r[0]}px`, height: `${r[1]}px` })
      }
    } else if (action.id === 'hide-image') {
      for (let i = 0; i < action.images.length; i += 1) {
        $(`img[gestureid='${action.images[i].gestureid}']`).css({
          display: 'none',
        })
      }
    }
  }
}

const l = () => {
  if (window.SG) {
    if (window.SG.enabled()) {
      window.SG.connect()
    }
  } else {
    window.SG = new SmoothGestures()
  }
}
