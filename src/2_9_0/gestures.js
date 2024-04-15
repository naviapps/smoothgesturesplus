var e = {}
for (a in console) e[a] = console[a]
if ('update_url' in chrome.runtime.getManifest())
  for (a in console) console[a] = () => {}
var A = chrome.runtime.getManifest().short_name != 'Smooth Gestures Plus',
  B =
    'update_url' in chrome.runtime.getManifest()
      ? 'kdcjmllhmhnnadianfhhnoefgcdbpdap'
      : (chrome.runtime.id, 'ijgdgeacmjiigjjepffiijkleklaapfl'),
  settings = {}
if (A)
  chrome.extension.sendMessage(B, { storage: true }, (e) => {
    e && e.gestures && e.validGestures && ((settings = e), l())
  })
else {
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
}
chrome.runtime.onMessage.addListener((e, t, n) => {
  e.ping && n({ pong: true })
})

type SmoothGesturesDir = 'U' | 'R' | 'D' | 'L' | '1' | '3' | '7' | '9'

const SmoothGestures = () => {
  var g = this
  g.isId = (e) => {
    return id === e
  }
  var enabled = !(g.postMessage = (e, t) => {
    id === e && port && port.postMessage(t)
  })

  g.connect = () => {
    const connectInfo: chrome.runtime.ConnectInfo = {
      name: JSON.stringify({
        name: 'smoothgestures.tab',
        frame: !parent,
        id: id,
        url: location.href,
      }),
    }
    window.SGextId &&
      (port = chrome.runtime.connect(window.SGextId, connectInfo)),
      (port = A
        ? chrome.runtime.connect(B, connectInfo)
        : chrome.runtime.connect(connectInfo)) &&
        (port.onMessage.addListener(receiveMessage),
        port.onDisconnect.addListener(g.disable))
  }

  const receiveMessage = (mess) => {
    'enable' in mess && (mess.enable ? enable() : g.disable()),
      mess.disable && g.disable(),
      mess.action && localAction(mess.action),
      mess.windowBlurred &&
        ((buttonDown = {}),
        (blockClick = {}),
        (blockContext = true),
        endGesture()),
      mess.chain &&
        (startGesture(
          mess.chain.startPoint,
          mess.chain.startPoint
            ? document.elementFromPoint(
                mess.chain.startPoint.x,
                mess.chain.startPoint.y,
              )
            : null,
          mess.chain.line,
          mess.chain.rocker,
          mess.chain.wheel,
          1e4,
        ),
        (blockContext = true),
        mess.chain.buttonDown &&
          (mess.chain.buttonDown[0] && (blockClick[0] = true),
          mess.chain.buttonDown[1] && (blockClick[1] = true),
          mess.chain.buttonDown[2] && (blockClick[2] = true),
          buttonDown[0] == null && (buttonDown[0] = mess.chain.buttonDown[0]),
          buttonDown[1] == null && (buttonDown[1] = mess.chain.buttonDown[1]),
          buttonDown[2] == null && (buttonDown[2] = mess.chain.buttonDown[2]))),
      mess.syncButton &&
        (buttonDown[mess.syncButton.id] = mess.syncButton.down),
      mess.displayAlert && alert(mess.displayAlert)
  }

  const localAction = (e) => {
    if (e.id === 'page-back') history.back()
    else if (e.id === 'page-forward') history.forward()
    else if (e.id === 'page-back-close') {
      var t = location.href
      history.back(),
        e.has_history ||
          setTimeout(() => {
            t == location.href && port.postMessage({ closetab: true })
          }, 400)
    } else if (e.id === 'stop') window.stop()
    else if (e.id === 'print') window.print()
    else if (e.id === 'goto-top') {
      for (
        var n = e.startPoint
          ? document.elementFromPoint(e.startPoint.x, e.startPoint.y)
          : document.documentElement;
        n !== document.documentElement &&
        n.parentNode &&
        (n.scrollHeight <= n.clientHeight ||
          n.scrollTop === 0 ||
          ['auto', 'scroll'].indexOf(
            document.defaultView.getComputedStyle(n)['overflow-y'],
          ) === -1);

      )
        n = n.parentNode
      n === document.documentElement && (document.body.scrollTop = 0),
        (n.scrollTop = 0)
    } else if (e.id === 'goto-bottom') {
      for (
        n = e.startPoint
          ? document.elementFromPoint(e.startPoint.x, e.startPoint.y)
          : document.documentElement;
        n !== document.documentElement &&
        n.parentNode &&
        (n.scrollHeight <= n.clientHeight ||
          n.scrollTop === n.scrollHeight - n.clientHeight ||
          ['auto', 'scroll'].indexOf(
            document.defaultView.getComputedStyle(n)['overflow-y'],
          ) === -1);

      )
        n = n.parentNode
      n === document.documentElement &&
        (document.body.scrollTop = document.body.scrollHeight),
        (n.scrollTop = n.scrollHeight)
    } else if (e.id === 'page-up') {
      for (
        n = e.startPoint
          ? document.elementFromPoint(e.startPoint.x, e.startPoint.y)
          : document.documentElement;
        n !== document.documentElement &&
        n.parentNode &&
        (n.scrollHeight <= n.clientHeight ||
          n.scrollTop === 0 ||
          ['auto', 'scroll'].indexOf(
            document.defaultView.getComputedStyle(n)['overflow-y'],
          ) === -1);

      )
        n = n.parentNode
      n === document.documentElement &&
        (document.body.scrollTop -=
          0.8 *
          Math.min(
            document.documentElement.clientHeight,
            document.body.clientHeight,
          )),
        (n.scrollTop -=
          0.8 * Math.min(document.documentElement.clientHeight, n.clientHeight))
    } else if (e.id === 'page-down') {
      for (
        n = e.startPoint
          ? document.elementFromPoint(e.startPoint.x, e.startPoint.y)
          : document.documentElement;
        n !== document.documentElement &&
        n.parentNode &&
        (n.scrollHeight <= n.clientHeight ||
          n.scrollTop === n.scrollHeight - n.clientHeight ||
          ['auto', 'scroll'].indexOf(
            document.defaultView.getComputedStyle(n)['overflow-y'],
          ) === -1);

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
      ),
        n === document.documentElement &&
          (document.body.scrollTop +=
            0.8 *
            Math.min(
              document.documentElement.clientHeight,
              document.body.clientHeight,
            )),
        console.log('scroll2', n.scrollTop, document.body.scrollTop),
        (n.scrollTop +=
          0.8 *
          Math.min(document.documentElement.clientHeight, n.clientHeight)),
        console.log('scroll3', n.scrollTop, document.body.scrollTop)
    } else if (e.id === 'zoom-in-hack') {
      var o = document.body.style.zoom ? 1.1 * document.body.style.zoom : 1.1
      ;(document.body.style.zoom = o), (canvas.style.zoom = 1 / o)
    } else if (e.id === 'zoom-out-hack') {
      o = document.body.style.zoom ? document.body.style.zoom / 1.1 : 1 / 1.1
      ;(document.body.style.zoom = o), (canvas.style.zoom = 1 / o)
    } else if (e.id === 'zoom-zero-hack') {
      ;(document.body.style.zoom = 1), (canvas.style.zoom = 1)
    } else if (e.id === 'zoom-img-in') {
      for (var i = 0; i < e.images.length; i++) {
        ;(l = $("img[gestureid='" + e.images[i].gestureid + "']")).attr(
          'origsize',
        ) || l.attr('origsize', l.width() + 'x' + l.height()),
          l.css({ width: 1.2 * l.width(), height: 1.2 * l.height() })
      }
    } else if (e.id === 'zoom-img-out') {
      for (i = 0; i < e.images.length; i++) {
        ;(l = $("img[gestureid='" + e.images[i].gestureid + "']")).attr(
          'origsize',
        ) || l.attr('origsize', l.width() + 'x' + l.height()),
          l.css({ width: l.width() / 1.2, height: l.height() / 1.2 })
      }
    } else if (e.id === 'zoom-img-zero') {
      for (i = 0; i < e.images.length; i++) {
        var l
        if (
          !(l = $("img[gestureid='" + e.images[i].gestureid + "']")).attr(
            'origsize',
          )
        ) {
          return
        }
        var r = l.attr('origsize').split('x')
        l.css({ width: r[0] + 'px', height: r[1] + 'px' })
      }
    } else if (e.id === 'hide-image') {
      for (i = 0; i < e.images.length; i++)
        $("img[gestureid='" + e.images[i].gestureid + "']").css({
          display: 'none',
        })
    }
  }

  const handleKeyDown = (event: KeyboardEvent): void => {
    if (event.keyCode == 27) {
      endGesture(), (keyEscape = true)
      var t = (e) => {
        ;(keyEscape = false), window.removeEventListener('keyup', t, true)
      }
      window.addEventListener('keyup', t, true)
    }
    var n =
      (event.ctrlKey ? '1' : '0') +
      (event.altKey ? '1' : '0') +
      (event.shiftKey ? '1' : '0') +
      (event.metaKey ? '1' : '0')
    if (
      event.keyCode === 16 ||
      event.keyCode === 17 ||
      event.keyCode === 18 ||
      event.keyCode === 0 ||
      event.keyCode === 91 ||
      event.keyCode === 92 ||
      event.keyCode === 93
    ) {
      var o: number | null =
        event.keyCode === 16
          ? 2
          : event.keyCode === 17
            ? 0
            : event.keyCode === 18
              ? 1
              : null
      if (o != null) {
        n = n.substr(0, o) + '1' + n.substr(o + 1)
        t = (e) => {
          ;(keyMod = keyMod.substr(0, o) + '0' + keyMod.substr(o + 1)),
            window.removeEventListener('keyup', t, true)
        }
        window.addEventListener('keyup', t, true)
      }
      keyMod = n
    } else
      (g.callback ||
        ((n != '0000' ||
          focus == null ||
          (focus.nodeName != 'INPUT' && focus.nodeName != 'TEXTAREA')) &&
          settings.validGestures.k &&
          settings.validGestures.k[n] &&
          settings.validGestures.k[n].indexOf(
            event.keyIdentifier + ':' + event.keyCode,
          ) >= 0)) &&
        (startGesture(null, null, false, false, false),
        sendGesture('k' + n + ':' + event.keyIdentifier + ':' + event.keyCode),
        event.preventDefault(),
        event.stopPropagation())
  }

  const moveGesture = (event, diagonal): void => {
    if (!gesture.startPoint) {
      gesture.startPoint = { x: event.clientX, y: event.clientY }
    }

    if (gesture.rocker || gesture.wheel) {
      if (
        Math.abs(event.clientX - gesture.startPoint.x) > 0 ||
        Math.abs(event.clientY - gesture.startPoint.y) > 2
      ) {
        gesture.rocker = null
        gesture.wheel = null
      }
    }

    if (gesture.line) {
      const next: { x: number, y: number } = {
        x: event.clientX,
        y: event.clientY,
      }
      const prev: { x: number, y: number } =
        gesture.line.points[gesture.line.points.length - 1]
      gesture.line.points.push(next)
      gesture.line.distance += Math.sqrt(
        Math.pow(next.x - prev.x, 2) + Math.pow(next.y - prev.y, 2),
      )

      const diffx: number =
        next.x - gesture.line.dirPoints[gesture.line.dirPoints.length - 1].x
      const diffy: number =
        next.y - gesture.line.dirPoints[gesture.line.dirPoints.length - 1].y

      if (!settings.trailBlock && canvas.getContext) {
        refreshLineAsync()
        if (
          !canvas.parentNode &&
          (Math.abs(diffx) > 10 || Math.abs(diffy) > 10)
        ) {
          document.body.appendChild(canvas)
        }
      }

      const ldir: string =
        gesture.line.code === '' ? 'X' : gesture.line.code.slice(-1)
      const ndir: string = C(
        gesture.line.dirPoints[gesture.line.dirPoints.length - 1],
        next,
      )
      if (ndir === ldir) {
        gesture.line.dirPoints[gesture.line.dirPoints.length - 1] = next
      } else if (
        (Math.abs(diffx) > 25 || Math.abs(diffy) > 25) &&
        (diagonal || ndir.match(/^[RLUD]$/))
      ) {
        if (gesture.line.possibleDirs) {
          gesture.line.possibleDirs = gesture.line.possibleDirs[ndir]
        }
        if (gesture.line.possibleDirs || g.callback) {
          gesture.line.code += ndir
          gesture.line.dirPoints.push(next)
        } else {
          endGesture()
          blockContext = true
        }
      }
    }
  }

  const C = (e, t): string => {
    const diffx: number = t.x - e.x
    const diffy: number = t.y - e.y
    if (Math.abs(diffx) > 2 * Math.abs(diffy)) {
      if (diffx > 0) {
        return 'R'
      } else {
        return 'L'
      }
    } else if (Math.abs(diffy) > 2 * Math.abs(diffx)) {
      if (diffy > 0) {
        return 'D'
      } else {
        return 'U'
      }
    } else if (diffy < 0) {
      if (diffx < 0) {
        return '7'
      } else {
        return '9'
      }
    } else {
      if (diffx < 0) {
        return '1'
      } else {
        return '3'
      }
    }
  }

  const refreshLineAsync = (): void => {
    if (!refreshLineAsync.timeout) {
      const e: number = Date.now() - refreshLine.lasttime
      const t: number = Math.min(500, 4 * refreshLine.runtime)
      if (t < e) {
        refreshLine()
      } else {
        refreshLineAsync.timeout = setTimeout((): void => {
          refreshLine()
          refreshLineAsync.timeout = null
        }, t - e)
      }
    }
  }

  const refreshLine = (): void => {
    const e: number = Date.now()
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (gesture.line) {
      ctx.strokeStyle =
        'rgba(' +
        settings.trailColor.r +
        ',' +
        settings.trailColor.g +
        ',' +
        settings.trailColor.b +
        ',' +
        settings.trailColor.a +
        ')'
      ctx.lineWidth = settings.trailWidth
      ctx.lineCap = 'butt'
      ctx.lineJoin = 'round'
      ctx.shadowBlur = settings.trailWidth
      ctx.shadowColor = 'rgba(255,255,255,.3)'
      if (settings.trailLegacy) {
        ctx.beginPath()
        ctx.moveTo(gesture.line.points[0].x, gesture.line.points[0].y)
        for (let i = 1; i < gesture.line.points.length; i++) {
          ctx.lineTo(gesture.line.points[i].x, gesture.line.points[i].y)
        }
        ctx.stroke()
      } else {
        let nPoint: { x: number, y: number } = {
          x: gesture.line.dirPoints[0].x,
          y: gesture.line.dirPoints[0].y,
        }
        const oPoint: { x: number, y: number } =
          gesture.line.points[gesture.line.points.length - 1]
        const iPoint: { x: number, y: number } =
          gesture.line.dirPoints[gesture.line.dirPoints.length - 1]
        const lDir: string = C(iPoint, oPoint)
        ctx.beginPath()
        if (gesture.line.code.length > 0) {
          if (gesture.line.code[0] === 'L' || gesture.line.code[0] === 'R') {
            nPoint.y = gesture.line.dirPoints[1].y
          } else {
            nPoint.x = gesture.line.dirPoints[1].x
          }
        }
        ctx.moveTo(nPoint.x, nPoint.y)
        for (let i: number = 1; i < gesture.line.code.length; i++) {
          const sDir: string = gesture.line.code[i - 1]
          const aDir: string = gesture.line.code[i]
          const dPoint: { x: number, y: number } = gesture.line.dirPoints[i]
          const cPoint: { x: number, y: number } = gesture.line.dirPoints[i + 1]
          let uMin: number
          if (sDir === 'L' || sDir === 'R') {
            if (aDir === 'L' || aDir === 'R') {
              uMin = Math.min(
                Math.abs(dPoint.x - nPoint.x),
                Math.abs(cPoint.y - nPoint.y) / 2,
              )
              ctx.arcTo(dPoint.x, nPoint.y, dPoint.x, cPoint.y, uMin)
              uMin = Math.min(
                Math.abs(cPoint.x - dPoint.x),
                Math.abs(cPoint.y - nPoint.y) - uMin,
              )
              ctx.arcTo(dPoint.x, cPoint.y, cPoint.x, cPoint.y, uMin)
              nPoint.x = (dPoint.x + cPoint.x) / 2
              nPoint.y = cPoint.y
              ctx.lineTo(nPoint.x, nPoint.y)
            } else {
              let mY: number = cPoint.y
              if (
                gesture.line.code[i + 1] === 'L' ||
                gesture.line.code[i + 1] === 'R'
              ) {
                mY = gesture.line.dirPoints[i + 2].y
              }
              uMin = Math.min(
                Math.abs(cPoint.x - nPoint.x),
                Math.abs(mY - nPoint.y) / 2,
              )
              ctx.arcTo(cPoint.x, nPoint.y, cPoint.x, cPoint.y, 0.8 * uMin)
              nPoint.x = cPoint.x
              nPoint.y = (nPoint.y + mY) / 2
              ctx.lineTo(nPoint.x, nPoint.y)
            }
          } else if (aDir === 'L' || aDir === 'R') {
            let hX: number = cPoint.x
            if (
              gesture.line.code[i + 1] === 'U' ||
              gesture.line.code[i + 1] === 'D'
            ) {
              hX = gesture.line.dirPoints[i + 2].x
            }
            uMin = Math.min(
              Math.abs(hX - nPoint.x) / 2,
              Math.abs(cPoint.y - nPoint.y),
            )
            ctx.arcTo(nPoint.x, cPoint.y, cPoint.x, cPoint.y, 0.8 * uMin)
            nPoint.x = (nPoint.x + hX) / 2
            nPoint.y = cPoint.y
            ctx.lineTo(nPoint.x, nPoint.y)
          } else {
            uMin = Math.min(
              Math.abs(cPoint.x - nPoint.x) / 2,
              Math.abs(dPoint.y - nPoint.y),
            )
            ctx.arcTo(nPoint.x, dPoint.y, cPoint.x, dPoint.y, uMin)
            uMin = Math.min(
              Math.abs(cPoint.x - nPoint.x) - uMin,
              Math.abs(cPoint.y - dPoint.y),
            )
            ctx.arcTo(cPoint.x, dPoint.y, cPoint.x, cPoint.y, uMin)
            nPoint.x = cPoint.x
            nPoint.y = (dPoint.y + cPoint.y) / 2
            ctx.lineTo(nPoint.x, nPoint.y)
          }
        }
        if (gesture.line.code.length > 0) {
          nPoint = gesture.line.dirPoints[gesture.line.dirPoints.length - 1]
          ctx.lineTo(nPoint.x, nPoint.y)
        }
        ctx.stroke()
        if (
          (gesture.line.possibleDirs && gesture.line.possibleDirs[lDir]) ||
          g.callback
        ) {
          if (lDir === '3' || lDir === '7') {
            ctx.lineTo(
              (nPoint.x - nPoint.y + oPoint.x + oPoint.y) / 2,
              (-nPoint.x + nPoint.y + oPoint.x + oPoint.y) / 2,
            )
          } else if (lDir === '1' || lDir === '9') {
            ctx.lineTo(
              (nPoint.x + nPoint.y + oPoint.x - oPoint.y) / 2,
              (nPoint.x + nPoint.y - oPoint.x + oPoint.y) / 2,
            )
          }
          ctx.stroke()
        }
      }
      refreshLine.lasttime = Date.now()
      refreshLine.runtime =
        0.9 * (refreshLine.runtime || 10) + 0.1 * (refreshLine.lasttime - e)
    }
  }
}

if (
  window.SGinjectscript &&
  window.SGinjectscript.constructor === HTMLScriptElement
) {
  const match = window.SGinjectscript.src.match(
    /([^a-p]|^)([a-p]{32})([^a-p]|$)/,
  )
  if (match) {
    window.SGextId = match[2]
  }
  const scripts = document.querySelectorAll(
    'script[src^=chrome-extension\\:\\/\\/]',
  )
  for (let i = 0; i < scripts.length; i++) {
    scripts[i].parentNode.removeChild(scripts[i])
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
