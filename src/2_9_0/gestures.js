!((n) => {
  var o = {}
  const i = (e) => {
    if (o[e]) return o[e].exports
    var t = (o[e] = { i: e, l: false, exports: {} })
    return n[e].call(t.exports, t, t.exports, i), (t.l = true), t.exports
  }
  ;(i.m = n),
    (i.c = o),
    (i.i = (e) => {
      return e
    }),
    (i.d = (e, t, n) => {
      i.o(e, t) ||
        Object.defineProperty(e, t, {
          configurable: false,
          enumerable: true,
          get: n,
        })
    }),
    (i.n = (e) => {
      var t =
        e && e.__esModule
          ? () => {
              return e.default
            }
          : () => {
              return e
            }
      return i.d(t, 'a', t), t
    }),
    (i.o = (e, t) => {
      return Object.prototype.hasOwnProperty.call(e, t)
    }),
    (i.p = ''),
    i((i.s = 1))
})([
  ,
  (e, t) => {
    !(() => {
      var e = {}
      for (a in console) e[a] = console[a]
      if ('update_url' in chrome.runtime.getManifest())
        for (a in console) console[a] = () => {}
      var A = chrome.runtime.getManifest().short_name != 'Smooth Gestures Plus',
        B =
          'update_url' in chrome.runtime.getManifest()
            ? 'kdcjmllhmhnnadianfhhnoefgcdbpdap'
            : (chrome.runtime.id, 'ijgdgeacmjiigjjepffiijkleklaapfl'),
        O = {}
      if (A)
        chrome.extension.sendMessage(B, { storage: true }, (e) => {
          e && e.gestures && e.validGestures && ((O = e), l())
        })
      else {
        chrome.storage.local.get(null, (e) => {
          ;(O = e), l()
        })
        chrome.storage.onChanged.addListener((e, t) => {
          if (t == 'local') for (key in e) O[key] = e[key].newValue
        })
      }
      chrome.runtime.onMessage.addListener((e, t, n) => {
        e.ping && n({ pong: true })
      })
      var t = () => {
        var g = this
        g.callback = null
        var n =
          Math.floor(Math.random() * Math.pow(2, 30)).toString(32) +
          Math.floor(Math.random() * Math.pow(2, 30)).toString(32)
        g.isId = (e) => {
          return n == e
        }
        var enabled = !(g.postMessage = (e, t) => {
            n == e && port && port.postMessage(t)
          }),
          port = null,
          w = null,
          c = null,
          f = {},
          r = false,
          a = {},
          o = {},
          d = true,
          i = false,
          l = '0000',
          u = false,
          m = null
        g.connect = () => {
          var e = {
            name: JSON.stringify({
              name: 'smoothgestures.tab',
              frame: !parent,
              id: n,
              url: location.href,
            }),
          }
          window.SGextId && (port = chrome.runtime.connect(window.SGextId, e)),
            (port = A
              ? chrome.runtime.connect(B, e)
              : chrome.runtime.connect(e)) &&
              (port.onMessage.addListener(t),
              port.onDisconnect.addListener(g.disable))
        }
        var t = (e) => {
          'enable' in e && (e.enable ? enable() : g.disable()),
            e.disable && g.disable(),
            e.action && localAction(e.action),
            e.windowBlurred && ((a = {}), (o = {}), (d = true), H()),
            e.chain &&
              (L(
                e.chain.startPoint,
                e.chain.startPoint
                  ? document.elementFromPoint(
                      e.chain.startPoint.x,
                      e.chain.startPoint.y,
                    )
                  : null,
                e.chain.line,
                e.chain.rocker,
                e.chain.wheel,
                1e4,
              ),
              (d = true),
              e.chain.buttonDown &&
                (e.chain.buttonDown[0] && (o[0] = true),
                e.chain.buttonDown[1] && (o[1] = true),
                e.chain.buttonDown[2] && (o[2] = true),
                a[0] == null && (a[0] = e.chain.buttonDown[0]),
                a[1] == null && (a[1] = e.chain.buttonDown[1]),
                a[2] == null && (a[2] = e.chain.buttonDown[2]))),
            e.syncButton && (a[e.syncButton.id] = e.syncButton.down),
            e.displayAlert && alert(e.displayAlert)
        }
        localAction = (e) => {
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
                0.8 *
                Math.min(document.documentElement.clientHeight, n.clientHeight))
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
                Math.min(
                  document.documentElement.clientHeight,
                  n.clientHeight,
                )),
              console.log('scroll3', n.scrollTop, document.body.scrollTop)
          } else if (e.id === 'zoom-in-hack') {
            var o = document.body.style.zoom
              ? 1.1 * document.body.style.zoom
              : 1.1
            ;(document.body.style.zoom = o), (w.style.zoom = 1 / o)
          } else if (e.id === 'zoom-out-hack') {
            o = document.body.style.zoom
              ? document.body.style.zoom / 1.1
              : 1 / 1.1
            ;(document.body.style.zoom = o), (w.style.zoom = 1 / o)
          } else if (e.id === 'zoom-zero-hack') {
            ;(document.body.style.zoom = 1), (w.style.zoom = 1)
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
        var mouseDownCapture = (e) => {
            if (
              ((o[e.button] = false),
              (d = e.button != 2),
              e.target &&
                e.target.nodeName == 'HTML' &&
                ((document.height > window.innerHeight &&
                  e.clientX > window.innerWidth - 17) ||
                  (document.width > window.innerWidth &&
                    e.clientY > window.innerHeight - 17)))
            )
              H()
            else {
              if (
                (r &&
                  port.postMessage({
                    syncButton: { id: e.button, down: true },
                  }),
                (a[e.button] = true),
                i)
              ) {
                if (e.button == 2) return void H()
                i = false
              }
              var t, n
              if (
                (T(e),
                f.rocker &&
                  (a[0] ? 1 : 0) + (a[1] ? 1 : 0) + (a[2] ? 1 : 0) == 2)
              )
                if (
                  (a[0] && (e.button == 0 ? (n = 'L') : (t = 'L')),
                  a[1] && (e.button == 1 ? (n = 'M') : (t = 'M')),
                  a[2] && (e.button == 2 ? (n = 'R') : (t = 'R')),
                  g.callback ||
                    (O.validGestures.r[t] && O.validGestures.r[t][n]))
                )
                  return (
                    (r = {
                      timeout: setTimeout(() => {
                        r = false
                      }, 500),
                    }),
                    S('r' + t + n),
                    window.getSelection().removeAllRanges(),
                    (d = true),
                    (o[0] = true),
                    (o[1] = true),
                    (o[2] = true),
                    e.preventDefault(),
                    void e.stopPropagation()
                  )
              ;(O.contextOnLink && e.button == 2 && N(e.target)) ||
                (O.holdButton == 0 &&
                  e.button == 0 &&
                  e.target.nodeName == 'SELECT') ||
                ((O.holdButton != 0 ||
                  (l[0] == '0' && l[1] == '0' && l[2] == '0' && !u)) &&
                  (O.holdButton == 0 &&
                    e.button == 0 &&
                    e.target.nodeName == 'IMG' &&
                    e.preventDefault(),
                  e.button == 1 &&
                    (O.validGestures.r.M || window.SG.callback) &&
                    navigator.platform.indexOf('Win') != -1 &&
                    e.preventDefault(),
                  L(
                    { x: e.clientX, y: e.clientY },
                    e.target,
                    e.button == O.holdButton,
                    (a[0] ? 1 : 0) + (a[1] ? 1 : 0) + (a[2] ? 1 : 0) == 1 &&
                      (g.callback ||
                        (O.validGestures.r &&
                          ((a[0] && O.validGestures.r.L) ||
                            (a[1] && O.validGestures.r.M) ||
                            (a[2] && O.validGestures.r.R)))),
                    e.button == O.holdButton &&
                      (g.callback || O.validGestures.w),
                  )))
            }
          },
          mouseUpCapture = (e) => {
            if (
              (e.button == O.holdButton &&
                (f.line && T(e, true),
                f.line &&
                  f.line.code != '' &&
                  (S(f.line.code),
                  e.preventDefault(),
                  e.button == 0 && window.getSelection().removeAllRanges(),
                  e.button == 2 && (d = true),
                  (o[e.button] = true))),
              (f.line = null),
              (f.wheel = null),
              e.button != 2 && (d = true),
              !(
                e.button != 2 ||
                i ||
                d ||
                a[0] ||
                a[1] ||
                navigator.platform.indexOf('Win') != -1
              ))
            ) {
              ;(i = true),
                setTimeout(() => {
                  i = false
                }, 600)
              var t = { x: e.screenX, y: e.screenY }
              navigator.userAgent.match(/linux/i) &&
                (e.screenX <
                  window.screenLeft +
                    Math.round(e.clientX * window.devicePixelRatio) ||
                  (window.screenLeft == 0 &&
                    e.screenY <
                      55 +
                        window.screenTop +
                        Math.round(e.clientY * window.devicePixelRatio))) &&
                ((t.x += window.screenLeft), (t.y += window.screenTop)),
                console.log('SEND NATIVE', t),
                port.postMessage({ nativeport: { rightclick: t } })
            }
            o[e.button] && e.preventDefault(),
              (a[e.button] = false),
              r &&
                port.postMessage({ syncButton: { id: e.button, down: false } }),
              a[0] || a[2] || (f.rocker = null),
              f.rocker || H()
          },
          p = (e) => {
            a = {}
          },
          mouseClickCapture = (e) => {
            o[e.button] && (e.preventDefault(), e.stopPropagation()),
              (o[e.button] = false)
          },
          doContextMenu = (e) => {
            ;(d || (a[2] && (f.line || f.rocker || f.wheel))) && !i
              ? (e.preventDefault(), e.stopPropagation(), (d = false))
              : (H(), (a = {}))
          },
          doSelectStart = (e) => {
            O.holdButton != 0 ||
              l[0] != '0' ||
              l[1] != '0' ||
              l[2] != '0' ||
              u ||
              window.getSelection().removeAllRanges()
          },
          canvasResize = () => {
            ;(w.width = window.innerWidth), (w.height = window.innerHeight)
          },
          keyDownCapture = (e) => {
            if (e.keyCode == 27) {
              H(), (u = true)
              var t = (e) => {
                ;(u = false), window.removeEventListener('keyup', t, true)
              }
              window.addEventListener('keyup', t, true)
            }
            var n =
              (e.ctrlKey ? '1' : '0') +
              (e.altKey ? '1' : '0') +
              (e.shiftKey ? '1' : '0') +
              (e.metaKey ? '1' : '0')
            if (
              e.keyCode == 16 ||
              e.keyCode == 17 ||
              e.keyCode == 18 ||
              e.keyCode == 0 ||
              e.keyCode == 91 ||
              e.keyCode == 92 ||
              e.keyCode == 93
            ) {
              var o =
                e.keyCode == 16
                  ? 2
                  : e.keyCode == 17
                    ? 0
                    : e.keyCode == 18
                      ? 1
                      : (e.keyCode == 0 ||
                          e.keyCode == 91 ||
                          e.keyCode == 92 ||
                          e.keyCode,
                        null)
              if (o != null) {
                n = n.substr(0, o) + '1' + n.substr(o + 1)
                t = (e) => {
                  ;(l = l.substr(0, o) + '0' + l.substr(o + 1)),
                    window.removeEventListener('keyup', t, true)
                }
                window.addEventListener('keyup', t, true)
              }
              l = n
            } else
              (g.callback ||
                ((n != '0000' ||
                  m == null ||
                  (m.nodeName != 'INPUT' && m.nodeName != 'TEXTAREA')) &&
                  O.validGestures.k &&
                  O.validGestures.k[n] &&
                  O.validGestures.k[n].indexOf(
                    e.keyIdentifier + ':' + e.keyCode,
                  ) >= 0)) &&
                (L(null, null, false, false, false),
                S('k' + n + ':' + e.keyIdentifier + ':' + e.keyCode),
                e.preventDefault(),
                e.stopPropagation())
          },
          P = (e) => {
            e.target.nodeName && (m = e.target)
          },
          E = (e) => {
            e.target.nodeName && (m = null)
          },
          L = (e, t, n, o, i, l) => {
            if (
              (H(),
              f.events ||
                (window.addEventListener('mousemove', T, true),
                window.addEventListener('mousewheel', D, true),
                (f.events = true)),
              location.hostname == 'mail.google.com')
            ) {
              var r = document.body.children[1],
                s = () => {
                  H(), r.removeEventListener('DOMSubtreeModified', s, true)
                }
              r.addEventListener('DOMSubtreeModified', s, true)
            }
            ;(f.startPoint = e ? { x: e.x, y: e.y } : null),
              (f.targets = t ? [t] : [])
            var a = window.getSelection()
            ;(f.selection = a.toString()), (f.ranges = [])
            for (var d = 0; d < a.rangeCount; d++)
              f.ranges.push(a.getRangeAt(d))
            ;(f.timeout = null),
              (f.line =
                n && e
                  ? {
                      code: '',
                      points: [{ x: e.x, y: e.y }],
                      dirPoints: [{ x: e.x, y: e.y }],
                      possibleDirs: O.validGestures,
                      distance: 0,
                    }
                  : null),
              (f.rocker = o),
              (f.wheel = i),
              document.documentElement.offsetHeight <
                document.documentElement.scrollHeight &&
                (f.line || f.wheel) &&
                !c.parentNode &&
                document.body.appendChild(c)
          },
          T = (e, t) => {
            if (
              (f.startPoint || (f.startPoint = { x: e.clientX, y: e.clientY }),
              (f.rocker || f.wheel) &&
                (Math.abs(e.clientX - f.startPoint.x) > 0 ||
                  Math.abs(e.clientY - f.startPoint.y) > 2) &&
                ((f.rocker = null), (f.wheel = null)),
              f.line)
            ) {
              var n = { x: e.clientX, y: e.clientY },
                o = f.line.points[f.line.points.length - 1]
              f.line.points.push(n),
                (f.line.distance += Math.sqrt(
                  Math.pow(n.x - o.x, 2) + Math.pow(n.y - o.y, 2),
                ))
              var i = n.x - f.line.dirPoints[f.line.dirPoints.length - 1].x,
                l = n.y - f.line.dirPoints[f.line.dirPoints.length - 1].y
              !O.trailBlock &&
                w.getContext &&
                (G(),
                !w.parentNode &&
                  (Math.abs(i) > 10 || Math.abs(l) > 10) &&
                  document.body.appendChild(w))
              var r = f.line.code == '' ? 'X' : f.line.code.substr(-1, 1),
                s = C(f.line.dirPoints[f.line.dirPoints.length - 1], n)
              s == r
                ? (f.line.dirPoints[f.line.dirPoints.length - 1] = n)
                : (Math.abs(i) > 25 || Math.abs(l) > 25) &&
                  (t || s.match(/^[RLUD]$/)) &&
                  (f.line.possibleDirs &&
                    (f.line.possibleDirs = f.line.possibleDirs[s]),
                  f.line.possibleDirs || g.callback
                    ? ((f.line.code += s), f.line.dirPoints.push(n))
                    : (H(), (d = true)))
            }
          },
          C = (e, t) => {
            var n = t.x - e.x,
              o = t.y - e.y
            return Math.abs(n) > 2 * Math.abs(o)
              ? n > 0
                ? 'R'
                : 'L'
              : Math.abs(o) > 2 * Math.abs(n)
                ? o > 0
                  ? 'D'
                  : 'U'
                : o < 0
                  ? n > 0
                    ? '9'
                    : '7'
                  : n > 0
                    ? '3'
                    : '1'
          },
          D = (e) => {
            if (
              ((e.target.nodeName != 'IFRAME' &&
                e.target.nodeName != 'FRAME') ||
                H(),
              T(e),
              f.wheel && e.wheelDelta != 0)
            ) {
              var t = e.wheelDelta > 0 ? 'U' : 'D'
              ;(g.callback || O.validGestures.w[t]) &&
                ((r = {
                  timeout: setTimeout(() => {
                    r = false
                  }, 500),
                }),
                S('w' + t),
                O.holdButton == 2 && (d = true),
                O.holdButton == 0 && window.getSelection().removeAllRanges(),
                (o[O.holdButton] = true),
                e.preventDefault(),
                e.stopPropagation())
            }
          },
          S = (e) => {
            if (e)
              if (g.callback) g.callback(e), (g.callback = null)
              else {
                var t = {
                  gesture: e,
                  startPoint: f.startPoint,
                  targets: [],
                  links: [],
                  images: [],
                  selection: f.selection,
                }
                if (
                  (f.line &&
                    e[0] != 'w' &&
                    e[0] != 'r' &&
                    (t.line = {
                      distance: f.line.distance,
                      segments: e.length,
                    }),
                  O.selectToLink && f.selection)
                ) {
                  parts = f.selection.split('http')
                  for (var n = 1; n < parts.length; n++) {
                    ;(o = (o = 'http' + parts[n]).split(/[\s"']/)[0]).match(
                      /\/\/.+\..+/,
                    ) && t.links.push({ src: o })
                  }
                }
                for (n = 0; n < f.targets.length; n++) {
                  var o,
                    i = Math.floor(Math.random() * Math.pow(2, 30)).toString(32)
                  f.targets[n].setAttribute('gestureid', i),
                    t.targets.push({ gestureid: i }),
                    (o = N(f.targets[n])) &&
                      t.links.push({ src: o, gestureid: i }),
                    f.targets[n].nodeName == 'IMG' &&
                      t.images.push({ src: f.targets[n].src, gestureid: i })
                }
                r && (t.buttonDown = a), port.postMessage(t)
                f.targets
              }
            if (e[0] == 'w') (f.line = null), (f.rocker = null)
            else if (e[0] == 'r') (f.line = null), (f.wheel = null)
            else {
              if (f.ranges && f.ranges.length > 0) {
                var l = window.getSelection()
                l.removeAllRanges()
                for (n = 0; n < f.ranges.length; n++) l.addRange(f.ranges[n])
              }
              H()
            }
          },
          H = () => {
            f.events &&
              (window.removeEventListener('mousemove', T, true),
              window.removeEventListener('mousewheel', D, true),
              (f.events = false)),
              w.parentNode && w.parentNode.removeChild(w),
              w.getContext &&
                w.getContext('2d').clearRect(0, 0, w.width, w.height),
              c.parentNode && c.parentNode.removeChild(c),
              clearTimeout(f.timeout),
              (f.timeout = null),
              (f.selection = null),
              (f.ranges = null),
              (f.line = null),
              (f.rocker = null),
              (f.wheel = null)
          },
          N = (e) => {
            for (; e; ) {
              if (e.href) return e.href
              e = e.parentNode
            }
            return null
          },
          G = () => {
            if (!G.timeout) {
              var e = Date.now() - z.lasttime,
                t = Math.min(500, 4 * z.runtime)
              t < e
                ? z()
                : (G.timeout = setTimeout(() => {
                    z(), (G.timeout = null)
                  }, t - e))
            }
          },
          z = () => {
            if (w.getContext) {
              var e = Date.now(),
                t = w.getContext('2d')
              if ((t.clearRect(0, 0, w.width, w.height), f.line)) {
                if (
                  ((t.strokeStyle =
                    'rgba(' +
                    O.trailColor.r +
                    ',' +
                    O.trailColor.g +
                    ',' +
                    O.trailColor.b +
                    ',' +
                    O.trailColor.a +
                    ')'),
                  (t.lineWidth = O.trailWidth),
                  (t.lineCap = 'butt'),
                  (t.lineJoin = 'round'),
                  (t.shadowBlur = O.trailWidth),
                  (t.shadowColor = 'rgba(255,255,255,.3)'),
                  O.trailLegacy)
                ) {
                  t.beginPath(),
                    t.moveTo(f.line.points[0].x, f.line.points[0].y)
                  for (r = 1; r < f.line.points.length; r++)
                    t.lineTo(f.line.points[r].x, f.line.points[r].y)
                  t.stroke()
                } else {
                  var n = {
                      x: f.line.dirPoints[0].x,
                      y: f.line.dirPoints[0].y,
                    },
                    o = f.line.points[f.line.points.length - 1],
                    i = f.line.dirPoints[f.line.dirPoints.length - 1],
                    l = C(i, o)
                  Math.max(Math.abs(o.x - i.x), Math.abs(o.y - i.y)) > 25 &&
                    l.match(/^[1379]$/)
                  t.beginPath(),
                    f.line.code.length > 0 &&
                      (f.line.code[0] == 'L' || f.line.code[0] == 'R'
                        ? (n.y = f.line.dirPoints[1].y)
                        : (n.x = f.line.dirPoints[1].x)),
                    t.moveTo(n.x, n.y)
                  for (var r = 1; r < f.line.code.length; r++) {
                    var s = f.line.code[r - 1],
                      a = f.line.code[r],
                      d = f.line.dirPoints[r],
                      c = f.line.dirPoints[r + 1]
                    if (s == 'L' || s == 'R')
                      if (a == 'L' || a == 'R') {
                        var u = Math.min(
                          Math.abs(d.x - n.x),
                          Math.abs(c.y - n.y) / 2,
                        )
                        t.arcTo(d.x, n.y, d.x, c.y, u),
                          (u = Math.min(
                            Math.abs(c.x - d.x),
                            Math.abs(c.y - n.y) - u,
                          )),
                          t.arcTo(d.x, c.y, c.x, c.y, u),
                          (n.x = (d.x + c.x) / 2),
                          (n.y = c.y),
                          t.lineTo(n.x, n.y)
                      } else {
                        var m = c.y
                        ;(f.line.code[r + 1] != 'L' &&
                          f.line.code[r + 1] != 'R') ||
                          (m = f.line.dirPoints[r + 2].y)
                        u = Math.min(Math.abs(c.x - n.x), Math.abs(m - n.y) / 2)
                        t.arcTo(c.x, n.y, c.x, c.y, 0.8 * u),
                          (n.x = c.x),
                          (n.y = (n.y + m) / 2),
                          t.lineTo(n.x, n.y)
                      }
                    else if (a == 'L' || a == 'R') {
                      var h = c.x
                      ;(f.line.code[r + 1] != 'U' &&
                        f.line.code[r + 1] != 'D') ||
                        (h = f.line.dirPoints[r + 2].x)
                      u = Math.min(Math.abs(h - n.x) / 2, Math.abs(c.y - n.y))
                      t.arcTo(n.x, c.y, c.x, c.y, 0.8 * u),
                        (n.x = (n.x + h) / 2),
                        (n.y = c.y),
                        t.lineTo(n.x, n.y)
                    } else {
                      u = Math.min(Math.abs(c.x - n.x) / 2, Math.abs(d.y - n.y))
                      t.arcTo(n.x, d.y, c.x, d.y, u),
                        (u = Math.min(
                          Math.abs(c.x - n.x) - u,
                          Math.abs(c.y - d.y),
                        )),
                        t.arcTo(c.x, d.y, c.x, c.y, u),
                        (n.x = c.x),
                        (n.y = (d.y + c.y) / 2),
                        t.lineTo(n.x, n.y)
                    }
                  }
                  f.line.code.length > 0 &&
                    ((n = f.line.dirPoints[f.line.dirPoints.length - 1]),
                    t.lineTo(n.x, n.y)),
                    t.stroke(),
                    ((f.line.possibleDirs && f.line.possibleDirs[l]) ||
                      g.callback) &&
                      (l == '3' || l == '7'
                        ? t.lineTo(
                            (n.x - n.y + o.x + o.y) / 2,
                            (-n.x + n.y + o.x + o.y) / 2,
                          )
                        : (l != '1' && l != '9') ||
                          t.lineTo(
                            (n.x + n.y + o.x - o.y) / 2,
                            (n.x + n.y - o.x + o.y) / 2,
                          ),
                      t.stroke())
                }
                ;(z.lasttime = Date.now()),
                  (z.runtime = 0.9 * (z.runtime || 10) + 0.1 * (z.lasttime - e))
              }
            }
          }

        const enable = (): void => {
          if (enabled) return
          enabled = true

          window.addEventListener('mousedown', mouseDownCapture, true)
          window.addEventListener('mouseup', mouseUpCapture, true)
          window.addEventListener('dragend', p, true)
          window.addEventListener('click', mouseClickCapture, true)
          window.addEventListener('contextmenu', doContextMenu, true)
          window.addEventListener('selectstart', doSelectStart, true)
          window.addEventListener('resize', canvasResize, true)
          window.addEventListener('keydown', keyDownCapture, true)
        }
        ;(g.disable = (): void => {
          if (!enabled) return
          enabled = false

          window.removeEventListener('mousedown', mouseDownCapture, true)
          window.removeEventListener('mouseup', mouseUpCapture, true)
          window.removeEventListener('dragend', p, true)
          window.removeEventListener('click', mouseClickCapture, true)
          window.removeEventListener('contextmenu', doContextMenu, true)
          window.removeEventListener('selectstart', doSelectStart, true)
          window.removeEventListener('resize', canvasResize, true)
          window.removeEventListener('keydown', keyDownCapture, true)

          port.onMessage.removeListener(t)
          port.onDisconnect.removeListener(g.disable)
        }),
          (g.enabled = () => {
            return enabled
          }),
          (() => {
            if (location.hostname === 'smoothgesturesplus.com') {
              var e = document.createElement('script')
              ;(e.innerText =
                'window.sgp = ' +
                JSON.stringify({
                  license: O.license,
                  clid: O.id,
                  firstinstalled: O.firstinstalled,
                }) +
                '; if(window.setSGP) window.setSGP();'),
                document.head.appendChild(e)
            }
            window.addEventListener('focus', P, true),
              window.addEventListener('blur', E, true),
              g.connect(),
              (w = document.createElement('canvas')).style &&
                ((w.style.position = 'fixed'),
                (w.style.top = 0),
                (w.style.left = 0),
                (w.style.zIndex = 999999999),
                (w.style.background = 'transparent'),
                (w.style.margin = '0'),
                (w.style.padding = '0')),
              canvasResize(),
              ((c = document.createElement('div')).style.clear = 'both')
          })()
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
          window.SG = new t()
        }
      }
    })()
  },
])
