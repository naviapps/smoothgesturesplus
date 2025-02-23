!(function (n) {
  var o = {};

  function i(e) {
    if (o[e]) return o[e].exports;
    var t = (o[e] = { i: e, l: false, exports: {} });
    return n[e].call(t.exports, t, t.exports, i), (t.l = true), t.exports;
  }

  (i.m = n),
    (i.c = o),
    (i.i = function (e) {
      return e;
    }),
    (i.d = function (e, t, n) {
      i.o(e, t) ||
        Object.defineProperty(e, t, {
          configurable: false,
          enumerable: true,
          get: n,
        });
    }),
    (i.n = function (e) {
      var t =
        e && e.__esModule
          ? function () {
              return e.default;
            }
          : function () {
              return e;
            };
      return i.d(t, 'a', t), t;
    }),
    (i.o = function (e, t) {
      return Object.prototype.hasOwnProperty.call(e, t);
    }),
    (i.p = ''),
    i((i.s = 1));
})([
  ,
  function (e, t) {
    !(function () {
      var e = {};
      for (a in console) e[a] = console[a];
      if ('update_url' in chrome.runtime.getManifest()) for (a in console) console[a] = function () {};
      var A = 'Smooth Gestures Plus' != chrome.runtime.getManifest().short_name,
        B =
          'update_url' in chrome.runtime.getManifest()
            ? 'kdcjmllhmhnnadianfhhnoefgcdbpdap'
            : (chrome.runtime.id, 'ijgdgeacmjiigjjepffiijkleklaapfl'),
        settings = {};
      if (A)
        chrome.extension.sendMessage(B, { storage: true }, function (e) {
          e && e.gestures && e.validGestures && ((settings = e), l());
        });
      else {
        chrome.storage.local.get(null, function (e) {
          settings = e;
          l();
        });
        chrome.storage.onChanged.addListener(function (e, t) {
          if (t === 'local') {
            for (let key in e) {
              settings[key] = e[key].newValue;
            }
          }
        });
      }
      chrome.runtime.onMessage.addListener(function (e, t, n) {
        e.ping && n({ pong: true });
      });
      var SmoothGestures = function () {
        var _this = this;
        _this.callback = null;
        var id =
          Math.floor(Math.random() * Math.pow(2, 30)).toString(32) +
          Math.floor(Math.random() * Math.pow(2, 30)).toString(32);
        _this.isId = function (e) {
          return id == e;
        };
        var enabled = !(_this.postMessage = function (e, t) {
          id == e && port && port.postMessage(t);
        });
        var port = null;
        var canvas = null;
        var c = null;
        var gesture = {};
        var syncButtons = false;
        var buttonDown = {};
        var blockClick = {};
        var blockContext = true;
        var forceContext = false;
        var keyMod = '0000';
        var keyEscape = false;
        var focus = null;

        _this.connect = function () {
          const mess = {
            name: JSON.stringify({
              name: 'smoothgestures.tab',
              frame: !parent,
              id: id,
              url: location.href,
            }),
          };
          if (window.SGextId) port = chrome.runtime.connect(window.SGextId, mess);
          port = A ? chrome.runtime.connect(B, mess) : chrome.runtime.connect(mess);
          if (!port) return;
          port.onMessage.addListener(receiveMessage);
          port.onDisconnect.addListener(_this.disable);
        };

        var receiveMessage = function (e) {
          'enable' in e && (e.enable ? enable() : _this.disable()),
            e.disable && _this.disable(),
            e.action && localAction(e.action),
            e.windowBlurred && ((buttonDown = {}), (blockClick = {}), (blockContext = true), endGesture()),
            e.chain &&
              (startGesture(
                e.chain.startPoint,
                e.chain.startPoint ? document.elementFromPoint(e.chain.startPoint.x, e.chain.startPoint.y) : null,
                e.chain.line,
                e.chain.rocker,
                e.chain.wheel,
                1e4,
              ),
              (blockContext = true),
              e.chain.buttonDown &&
                (e.chain.buttonDown[0] && (blockClick[0] = true),
                e.chain.buttonDown[1] && (blockClick[1] = true),
                e.chain.buttonDown[2] && (blockClick[2] = true),
                null == buttonDown[0] && (buttonDown[0] = e.chain.buttonDown[0]),
                null == buttonDown[1] && (buttonDown[1] = e.chain.buttonDown[1]),
                null == buttonDown[2] && (buttonDown[2] = e.chain.buttonDown[2]))),
            e.syncButton && (buttonDown[e.syncButton.id] = e.syncButton.down),
            e.displayAlert && alert(e.displayAlert);
        };

        const localAction = function (e) {
          if ('page-back' == e.id) history.back();
          else if ('page-forward' == e.id) history.forward();
          else if ('page-back-close' == e.id) {
            var t = location.href;
            history.back(),
              e.has_history ||
                setTimeout(function () {
                  t == location.href && port.postMessage({ closetab: true });
                }, 400);
          } else if ('stop' == e.id) window.stop();
          else if ('print' == e.id) window.print();
          else if ('goto-top' == e.id) {
            for (
              var n = e.startPoint
                ? document.elementFromPoint(e.startPoint.x, e.startPoint.y)
                : document.documentElement;
              n != document.documentElement &&
              n.parentNode &&
              (n.scrollHeight <= n.clientHeight ||
                0 == n.scrollTop ||
                -1 == ['auto', 'scroll'].indexOf(document.defaultView.getComputedStyle(n)['overflow-y']));

            )
              n = n.parentNode;
            n == document.documentElement && (document.body.scrollTop = 0), (n.scrollTop = 0);
          } else if ('goto-bottom' == e.id) {
            for (
              n = e.startPoint ? document.elementFromPoint(e.startPoint.x, e.startPoint.y) : document.documentElement;
              n != document.documentElement &&
              n.parentNode &&
              (n.scrollHeight <= n.clientHeight ||
                n.scrollTop == n.scrollHeight - n.clientHeight ||
                -1 == ['auto', 'scroll'].indexOf(document.defaultView.getComputedStyle(n)['overflow-y']));

            )
              n = n.parentNode;
            n == document.documentElement && (document.body.scrollTop = document.body.scrollHeight),
              (n.scrollTop = n.scrollHeight);
          } else if ('page-up' == e.id) {
            for (
              n = e.startPoint ? document.elementFromPoint(e.startPoint.x, e.startPoint.y) : document.documentElement;
              n != document.documentElement &&
              n.parentNode &&
              (n.scrollHeight <= n.clientHeight ||
                0 == n.scrollTop ||
                -1 == ['auto', 'scroll'].indexOf(document.defaultView.getComputedStyle(n)['overflow-y']));

            )
              n = n.parentNode;
            n == document.documentElement &&
              (document.body.scrollTop -=
                0.8 * Math.min(document.documentElement.clientHeight, document.body.clientHeight)),
              (n.scrollTop -= 0.8 * Math.min(document.documentElement.clientHeight, n.clientHeight));
          } else if ('page-down' == e.id) {
            for (
              n = e.startPoint ? document.elementFromPoint(e.startPoint.x, e.startPoint.y) : document.documentElement;
              n != document.documentElement &&
              n.parentNode &&
              (n.scrollHeight <= n.clientHeight ||
                n.scrollTop == n.scrollHeight - n.clientHeight ||
                -1 == ['auto', 'scroll'].indexOf(document.defaultView.getComputedStyle(n)['overflow-y']));

            )
              n = n.parentNode;
            console.log(
              'scroll',
              n,
              n.scrollTop,
              document.body.scrollTop,
              document.documentElement.clientHeight,
              document.body.clientHeight,
              n.clientHeight,
            ),
              n == document.documentElement &&
                (document.body.scrollTop +=
                  0.8 * Math.min(document.documentElement.clientHeight, document.body.clientHeight)),
              console.log('scroll2', n.scrollTop, document.body.scrollTop),
              (n.scrollTop += 0.8 * Math.min(document.documentElement.clientHeight, n.clientHeight)),
              console.log('scroll3', n.scrollTop, document.body.scrollTop);
          } else if ('zoom-in-hack' == e.id) {
            var o = document.body.style.zoom ? 1.1 * document.body.style.zoom : 1.1;
            (document.body.style.zoom = o), (canvas.style.zoom = 1 / o);
          } else if ('zoom-out-hack' == e.id) {
            o = document.body.style.zoom ? document.body.style.zoom / 1.1 : 1 / 1.1;
            (document.body.style.zoom = o), (canvas.style.zoom = 1 / o);
          } else if ('zoom-zero-hack' == e.id) (document.body.style.zoom = 1), (canvas.style.zoom = 1);
          else if ('zoom-img-in' == e.id)
            for (var i = 0; i < e.images.length; i++) {
              (l = $("img[gestureid='" + e.images[i].gestureid + "']")).attr('origsize') ||
                l.attr('origsize', l.width() + 'x' + l.height()),
                l.css({
                  width: 1.2 * l.width(),
                  height: 1.2 * l.height(),
                });
            }
          else if ('zoom-img-out' == e.id)
            for (i = 0; i < e.images.length; i++) {
              (l = $("img[gestureid='" + e.images[i].gestureid + "']")).attr('origsize') ||
                l.attr('origsize', l.width() + 'x' + l.height()),
                l.css({
                  width: l.width() / 1.2,
                  height: l.height() / 1.2,
                });
            }
          else if ('zoom-img-zero' == e.id)
            for (i = 0; i < e.images.length; i++) {
              var l;
              if (!(l = $("img[gestureid='" + e.images[i].gestureid + "']")).attr('origsize')) return;
              var r = l.attr('origsize').split('x');
              l.css({ width: r[0] + 'px', height: r[1] + 'px' });
            }
          else if ('hide-image' == e.id)
            for (i = 0; i < e.images.length; i++)
              $("img[gestureid='" + e.images[i].gestureid + "']").css({
                display: 'none',
              });
        };

        var mouseDownCapture = function (event) {
          blockClick[event.button] = false;
          blockContext = event.button != 2;

          // block scrollbars
          if (
            event.target &&
            event.target.nodeName === 'HTML' &&
            ((document.height > window.innerHeight && event.clientX > window.innerWidth - 17) ||
              (document.width > window.innerWidth && event.clientY > window.innerHeight - 17))
          ) {
            endGesture();
            return;
          }

          if (syncButtons) {
            port.postMessage({ syncButton: { id: event.button, down: true } });
          }
          buttonDown[event.button] = true;

          if (forceContext) {
            if (event.button == 2) {
              endGesture();
              return;
            } else {
              forceContext = false;
            }
          }

          moveGesture(event);
          if (gesture.rocker && (buttonDown[0] ? 1 : 0) + (buttonDown[1] ? 1 : 0) + (buttonDown[2] ? 1 : 0) == 2) {
            var first;
            var second;
            if (buttonDown[0]) {
              if (event.button === 0) {
                second = 'L';
              } else {
                first = 'L';
              }
            }
            if (buttonDown[1]) {
              if (event.button === 0) {
                second = 'M';
              } else {
                first = 'M';
              }
            }
            if (buttonDown[2]) {
              if (event.button === 2) {
                second = 'R';
              } else {
                first = 'R';
              }
            }
            if (_this.callback || (settings.validGestures.r[first] && settings.validGestures.r[first][second])) {
              syncButtons = {
                timeout: setTimeout(function () {
                  syncButtons = false;
                }, 500),
              };
              sendGesture('r' + first + second);

              window.getSelection().removeAllRanges();
              blockContext = true;
              blockClick[0] = true;
              blockClick[1] = true;
              blockClick[2] = true;
              event.preventDefault();
              event.stopPropagation();
              return;
            }
          }
          if (settings.contextOnLink && event.button === 2 && getLink(event.target)) return;
          if (settings.holdButton === 0 && event.button === 0 && event.target.nodeName === 'SELECT') return;
          if (settings.holdButton === 0 && (keyMod[0] !== '0' || keyMod[1] !== '0' || keyMod[2] !== '0' || keyEscape))
            return; //allow selection
          if (settings.holdButton === 0 && event.button === 0 && event.target.nodeName === 'IMG')
            event.preventDefault();
          // if windows and middle clicked and (middle-click rocker set or options page is setting a gesture) then block auto scrolling with middle
          if (
            event.button == 1 &&
            (settings.validGestures.r.M || window.SG.callback) &&
            navigator.platform.indexOf('Win') != -1
          )
            event.preventDefault();

          startGesture(
            {
              x: event.clientX,
              y: event.clientY,
            },
            event.target,
            event.button == settings.holdButton,
            (buttonDown[0] ? 1 : 0) + (buttonDown[1] ? 1 : 0) + (buttonDown[2] ? 1 : 0) == 1 &&
              (_this.callback ||
                (settings.validGestures.r &&
                  ((buttonDown[0] && settings.validGestures.r.L) ||
                    (buttonDown[1] && settings.validGestures.r.M) ||
                    (buttonDown[2] && settings.validGestures.r.R)))),
            event.button == settings.holdButton && (_this.callback || settings.validGestures.w),
          );
        };

        var y = function (event) {
          if (
            (event.button == settings.holdButton &&
              (gesture.line && moveGesture(event, true),
              gesture.line &&
                '' != gesture.line.code &&
                (sendGesture(gesture.line.code),
                event.preventDefault(),
                0 == event.button && window.getSelection().removeAllRanges(),
                2 == event.button && (blockContext = true),
                (blockClick[event.button] = true))),
            (gesture.line = null),
            (gesture.wheel = null),
            2 != event.button && (blockContext = true),
            !(
              2 != event.button ||
              forceContext ||
              blockContext ||
              buttonDown[0] ||
              buttonDown[1] ||
              -1 != navigator.platform.indexOf('Win')
            ))
          ) {
            (forceContext = true),
              setTimeout(function () {
                forceContext = false;
              }, 600);
            var t = { x: event.screenX, y: event.screenY };
            navigator.userAgent.match(/linux/i) &&
              (event.screenX < window.screenLeft + Math.round(event.clientX * window.devicePixelRatio) ||
                (0 == window.screenLeft &&
                  event.screenY < 55 + window.screenTop + Math.round(event.clientY * window.devicePixelRatio))) &&
              ((t.x += window.screenLeft), (t.y += window.screenTop)),
              console.log('SEND NATIVE', t),
              port.postMessage({ nativeport: { rightclick: t } });
          }
          blockClick[event.button] && event.preventDefault(),
            (buttonDown[event.button] = false),
            syncButtons &&
              port.postMessage({
                syncButton: {
                  id: event.button,
                  down: false,
                },
              }),
            buttonDown[0] || buttonDown[2] || (gesture.rocker = null),
            gesture.rocker || endGesture();
        };

        const p = function () {
          buttonDown = {};
        };

        const mouseClickCapture = function (event) {
          if (blockClick[event.button]) {
            event.preventDefault();
            event.stopPropagation();
          }
          blockClick[event.button] = false;
        };

        const doContextMenu = function (event) {
          if ((blockContext || (buttonDown[2] && (gesture.line || gesture.rocker || gesture.wheel))) && !forceContext) {
            event.preventDefault();
            event.stopPropagation();
            blockContext = false;
          } else {
            endGesture();
            buttonDown = {};
          }
        };

        const doSelectStart = function () {
          if (settings.holdButton === 0 && keyMod[0] === '0' && keyMod[1] === '0' && keyMod[2] === '0' && !keyEscape) {
            window.getSelection().removeAllRanges();
          }
        };

        const M = function () {
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
        };

        var keyDownCapture = function (event) {
          if (event.keyCode == 27) {
            endGesture();
            keyEscape = true;
            var keyUp = function () {
              keyEscape = false;
              window.removeEventListener('keyup', keyUp, true);
            };
            window.addEventListener('keyup', keyUp, true);
          }
          var n =
            (event.ctrlKey ? '1' : '0') +
            (event.altKey ? '1' : '0') +
            (event.shiftKey ? '1' : '0') +
            (event.metaKey ? '1' : '0');
          if (
            16 == event.keyCode ||
            17 == event.keyCode ||
            18 == event.keyCode ||
            0 == event.keyCode ||
            91 == event.keyCode ||
            92 == event.keyCode ||
            93 == event.keyCode
          ) {
            var o =
              16 == event.keyCode
                ? 2
                : 17 == event.keyCode
                  ? 0
                  : 18 == event.keyCode
                    ? 1
                    : (0 == event.keyCode || 91 == event.keyCode || 92 == event.keyCode || event.keyCode, null);
            if (null != o) {
              n = n.substr(0, o) + '1' + n.substr(o + 1);
              keyUp = function (e) {
                (keyMod = keyMod.substr(0, o) + '0' + keyMod.substr(o + 1)),
                  window.removeEventListener('keyup', keyUp, true);
              };
              window.addEventListener('keyup', keyUp, true);
            }
            keyMod = n;
          } else
            (_this.callback ||
              (('0000' != n || null == focus || ('INPUT' != focus.nodeName && 'TEXTAREA' != focus.nodeName)) &&
                settings.validGestures.k &&
                settings.validGestures.k[n] &&
                0 <= settings.validGestures.k[n].indexOf(event.keyIdentifier + ':' + event.keyCode))) &&
              (startGesture(null, null, false, false, false),
              sendGesture('k' + n + ':' + event.keyIdentifier + ':' + event.keyCode),
              event.preventDefault(),
              event.stopPropagation());
        };

        const focusCapture = function (event) {
          if (event.target.nodeName) focus = event.target;
        };

        const blurCapture = function (event) {
          if (event.target.nodeName) focus = null;
        };

        var startGesture = function (e, t, n, o, i, l) {
          if (
            (endGesture(),
            gesture.events ||
              (window.addEventListener('mousemove', moveGesture, true),
              window.addEventListener('mousewheel', wheelGesture, true),
              (gesture.events = true)),
            'mail.google.com' == location.hostname)
          ) {
            var r = document.body.children[1],
              s = function () {
                endGesture(), r.removeEventListener('DOMSubtreeModified', s, true);
              };
            r.addEventListener('DOMSubtreeModified', s, true);
          }
          (gesture.startPoint = e ? { x: e.x, y: e.y } : null), (gesture.targets = t ? [t] : []);
          var a = window.getSelection();
          (gesture.selection = a.toString()), (gesture.ranges = []);
          for (var d = 0; d < a.rangeCount; d++) gesture.ranges.push(a.getRangeAt(d));
          (gesture.timeout = null),
            (gesture.line =
              n && e
                ? {
                    code: '',
                    points: [{ x: e.x, y: e.y }],
                    dirPoints: [{ x: e.x, y: e.y }],
                    possibleDirs: settings.validGestures,
                    distance: 0,
                  }
                : null),
            (gesture.rocker = o),
            (gesture.wheel = i),
            document.documentElement.offsetHeight < document.documentElement.scrollHeight &&
              (gesture.line || gesture.wheel) &&
              !c.parentNode &&
              document.body.appendChild(c);
        };
        var moveGesture = function (e, t) {
          if (
            (gesture.startPoint ||
              (gesture.startPoint = {
                x: e.clientX,
                y: e.clientY,
              }),
            (gesture.rocker || gesture.wheel) &&
              (0 < Math.abs(e.clientX - gesture.startPoint.x) || 2 < Math.abs(e.clientY - gesture.startPoint.y)) &&
              ((gesture.rocker = null), (gesture.wheel = null)),
            gesture.line)
          ) {
            var n = { x: e.clientX, y: e.clientY },
              o = gesture.line.points[gesture.line.points.length - 1];
            gesture.line.points.push(n),
              (gesture.line.distance += Math.sqrt(Math.pow(n.x - o.x, 2) + Math.pow(n.y - o.y, 2)));
            var i = n.x - gesture.line.dirPoints[gesture.line.dirPoints.length - 1].x,
              l = n.y - gesture.line.dirPoints[gesture.line.dirPoints.length - 1].y;
            !settings.trailBlock &&
              canvas.getContext &&
              (G(), !canvas.parentNode && (10 < Math.abs(i) || 10 < Math.abs(l)) && document.body.appendChild(canvas));
            var r = '' == gesture.line.code ? 'X' : gesture.line.code.substr(-1, 1),
              s = C(gesture.line.dirPoints[gesture.line.dirPoints.length - 1], n);
            s == r
              ? (gesture.line.dirPoints[gesture.line.dirPoints.length - 1] = n)
              : (25 < Math.abs(i) || 25 < Math.abs(l)) &&
                (t || s.match(/^[RLUD]$/)) &&
                (gesture.line.possibleDirs && (gesture.line.possibleDirs = gesture.line.possibleDirs[s]),
                gesture.line.possibleDirs || _this.callback
                  ? ((gesture.line.code += s), gesture.line.dirPoints.push(n))
                  : (endGesture(), (blockContext = true)));
          }
        };
        var C = function (e, t) {
          var n = t.x - e.x,
            o = t.y - e.y;
          return Math.abs(n) > 2 * Math.abs(o)
            ? 0 < n
              ? 'R'
              : 'L'
            : Math.abs(o) > 2 * Math.abs(n)
              ? 0 < o
                ? 'D'
                : 'U'
              : o < 0
                ? 0 < n
                  ? '9'
                  : '7'
                : 0 < n
                  ? '3'
                  : '1';
        };

        var wheelGesture = function (t) {
          if (t.target.nodeName === 'IFRAME' || t.target.nodeName === 'FRAME') endGesture();
          moveGesture(t);
          if (gesture.wheel && 0 != t.wheelDelta) {
            var dir = t.wheelDelta > 0 ? 'U' : 'D';
            (_this.callback || settings.validGestures.w[dir]) &&
              ((syncButtons = {
                timeout: setTimeout(function () {
                  syncButtons = false;
                }, 500),
              }),
              sendGesture('w' + dir),
              2 == settings.holdButton && (blockContext = true),
              0 == settings.holdButton && window.getSelection().removeAllRanges(),
              (blockClick[settings.holdButton] = true),
              t.preventDefault(),
              t.stopPropagation());
          }
        };

        var sendGesture = function (e) {
          if (e)
            if (_this.callback) _this.callback(e), (_this.callback = null);
            else {
              var t = {
                gesture: e,
                startPoint: gesture.startPoint,
                targets: [],
                links: [],
                images: [],
                selection: gesture.selection,
              };
              if (
                (gesture.line &&
                  'w' != e[0] &&
                  'r' != e[0] &&
                  (t.line = {
                    distance: gesture.line.distance,
                    segments: e.length,
                  }),
                settings.selectToLink && gesture.selection)
              ) {
                parts = gesture.selection.split('http');
                for (var n = 1; n < parts.length; n++) {
                  (o = (o = 'http' + parts[n]).split(/[\s"']/)[0]).match(/\/\/.+\..+/) && t.links.push({ src: o });
                }
              }
              for (n = 0; n < gesture.targets.length; n++) {
                var o,
                  i = Math.floor(Math.random() * Math.pow(2, 30)).toString(32);
                gesture.targets[n].setAttribute('gestureid', i),
                  t.targets.push({ gestureid: i }),
                  (o = getLink(gesture.targets[n])) &&
                    t.links.push({
                      src: o,
                      gestureid: i,
                    }),
                  'IMG' == gesture.targets[n].nodeName &&
                    t.images.push({
                      src: gesture.targets[n].src,
                      gestureid: i,
                    });
              }
              syncButtons && (t.buttonDown = buttonDown), port.postMessage(t);
              gesture.targets;
            }
          if ('w' == e[0]) (gesture.line = null), (gesture.rocker = null);
          else if ('r' == e[0]) (gesture.line = null), (gesture.wheel = null);
          else {
            if (gesture.ranges && 0 < gesture.ranges.length) {
              var l = window.getSelection();
              l.removeAllRanges();
              for (n = 0; n < gesture.ranges.length; n++) l.addRange(gesture.ranges[n]);
            }
            endGesture();
          }
        };
        var endGesture = function () {
          gesture.events &&
            (window.removeEventListener('mousemove', moveGesture, true),
            window.removeEventListener('mousewheel', wheelGesture, true),
            (gesture.events = false)),
            canvas.parentNode && canvas.parentNode.removeChild(canvas),
            canvas.getContext && canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height),
            c.parentNode && c.parentNode.removeChild(c),
            clearTimeout(gesture.timeout),
            (gesture.timeout = null),
            (gesture.selection = null),
            (gesture.ranges = null),
            (gesture.line = null),
            (gesture.rocker = null),
            (gesture.wheel = null);
        };

        var getLink = function (e) {
          for (; e; ) {
            if (e.href) return e.href;
            e = e.parentNode;
          }
          return null;
        };

        var G = function () {
          if (!G.timeout) {
            var e = Date.now() - z.lasttime,
              t = Math.min(500, 4 * z.runtime);
            t < e
              ? z()
              : (G.timeout = setTimeout(function () {
                  z(), (G.timeout = null);
                }, t - e));
          }
        };
        var z = function () {
          if (!canvas.getContext) return;
          var e = Date.now();
          var ctx = canvas.getContext('2d');
          if ((ctx.clearRect(0, 0, canvas.width, canvas.height), gesture.line)) {
            if (
              ((ctx.strokeStyle =
                'rgba(' +
                settings.trailColor.r +
                ',' +
                settings.trailColor.g +
                ',' +
                settings.trailColor.b +
                ',' +
                settings.trailColor.a +
                ')'),
              (ctx.lineWidth = settings.trailWidth),
              (ctx.lineCap = 'butt'),
              (ctx.lineJoin = 'round'),
              (ctx.shadowBlur = settings.trailWidth),
              (ctx.shadowColor = 'rgba(255,255,255,.3)'),
              settings.trailLegacy)
            ) {
              ctx.beginPath(), ctx.moveTo(gesture.line.points[0].x, gesture.line.points[0].y);
              for (r = 1; r < gesture.line.points.length; r++)
                ctx.lineTo(gesture.line.points[r].x, gesture.line.points[r].y);
              ctx.stroke();
            } else {
              var n = {
                  x: gesture.line.dirPoints[0].x,
                  y: gesture.line.dirPoints[0].y,
                },
                o = gesture.line.points[gesture.line.points.length - 1],
                i = gesture.line.dirPoints[gesture.line.dirPoints.length - 1],
                l = C(i, o);
              25 < Math.max(Math.abs(o.x - i.x), Math.abs(o.y - i.y)) && l.match(/^[1379]$/);
              ctx.beginPath(),
                0 < gesture.line.code.length &&
                  ('L' == gesture.line.code[0] || 'R' == gesture.line.code[0]
                    ? (n.y = gesture.line.dirPoints[1].y)
                    : (n.x = gesture.line.dirPoints[1].x)),
                ctx.moveTo(n.x, n.y);
              for (var r = 1; r < gesture.line.code.length; r++) {
                var s = gesture.line.code[r - 1],
                  a = gesture.line.code[r],
                  d = gesture.line.dirPoints[r],
                  c = gesture.line.dirPoints[r + 1];
                if ('L' == s || 'R' == s)
                  if ('L' == a || 'R' == a) {
                    var u = Math.min(Math.abs(d.x - n.x), Math.abs(c.y - n.y) / 2);
                    ctx.arcTo(d.x, n.y, d.x, c.y, u),
                      (u = Math.min(Math.abs(c.x - d.x), Math.abs(c.y - n.y) - u)),
                      ctx.arcTo(d.x, c.y, c.x, c.y, u),
                      (n.x = (d.x + c.x) / 2),
                      (n.y = c.y),
                      ctx.lineTo(n.x, n.y);
                  } else {
                    var m = c.y;
                    ('L' != gesture.line.code[r + 1] && 'R' != gesture.line.code[r + 1]) ||
                      (m = gesture.line.dirPoints[r + 2].y);
                    u = Math.min(Math.abs(c.x - n.x), Math.abs(m - n.y) / 2);
                    ctx.arcTo(c.x, n.y, c.x, c.y, 0.8 * u), (n.x = c.x), (n.y = (n.y + m) / 2), ctx.lineTo(n.x, n.y);
                  }
                else if ('L' == a || 'R' == a) {
                  var h = c.x;
                  ('U' != gesture.line.code[r + 1] && 'D' != gesture.line.code[r + 1]) ||
                    (h = gesture.line.dirPoints[r + 2].x);
                  u = Math.min(Math.abs(h - n.x) / 2, Math.abs(c.y - n.y));
                  ctx.arcTo(n.x, c.y, c.x, c.y, 0.8 * u), (n.x = (n.x + h) / 2), (n.y = c.y), ctx.lineTo(n.x, n.y);
                } else {
                  u = Math.min(Math.abs(c.x - n.x) / 2, Math.abs(d.y - n.y));
                  ctx.arcTo(n.x, d.y, c.x, d.y, u),
                    (u = Math.min(Math.abs(c.x - n.x) - u, Math.abs(c.y - d.y))),
                    ctx.arcTo(c.x, d.y, c.x, c.y, u),
                    (n.x = c.x),
                    (n.y = (d.y + c.y) / 2),
                    ctx.lineTo(n.x, n.y);
                }
              }
              0 < gesture.line.code.length &&
                ((n = gesture.line.dirPoints[gesture.line.dirPoints.length - 1]), ctx.lineTo(n.x, n.y)),
                ctx.stroke(),
                ((gesture.line.possibleDirs && gesture.line.possibleDirs[l]) || _this.callback) &&
                  ('3' == l || '7' == l
                    ? ctx.lineTo((n.x - n.y + o.x + o.y) / 2, (-n.x + n.y + o.x + o.y) / 2)
                    : ('1' != l && '9' != l) || ctx.lineTo((n.x + n.y + o.x - o.y) / 2, (n.x + n.y - o.x + o.y) / 2),
                  ctx.stroke());
            }
            (z.lasttime = Date.now()), (z.runtime = 0.9 * (z.runtime || 10) + 0.1 * (z.lasttime - e));
          }
        };
        var enable = function () {
          if (enabled) return;
          enabled = true;

          window.addEventListener('mousedown', mouseDownCapture, true);
          window.addEventListener('mouseup', y, true);
          window.addEventListener('dragend', p, true);
          window.addEventListener('click', mouseClickCapture, true);
          window.addEventListener('contextmenu', doContextMenu, true);
          window.addEventListener('selectstart', doSelectStart, true);
          window.addEventListener('resize', M, true);
          window.addEventListener('keydown', keyDownCapture, true);
        };

        _this.disable = function () {
          if (!enabled) return;
          enabled = false;

          window.removeEventListener('mousedown', mouseDownCapture, true);
          window.removeEventListener('mouseup', y, true);
          window.removeEventListener('dragend', p, true);
          window.removeEventListener('click', mouseClickCapture, true);
          window.removeEventListener('contextmenu', doContextMenu, true);
          window.removeEventListener('selectstart', doSelectStart, true);
          window.removeEventListener('resize', M, true);
          window.removeEventListener('keydown', keyDownCapture, true);
          port.onMessage.removeListener(receiveMessage);
          port.onDisconnect.removeListener(_this.disable);
        };

        _this.enabled = (function () {
          return enabled;
        })(function () {
          if ('smoothgesturesplus.com' == location.hostname) {
            var e = document.createElement('script');
            (e.innerText =
              'window.sgp = ' +
              JSON.stringify({
                license: settings.license,
                clid: settings.id,
                firstinstalled: settings.firstinstalled,
              }) +
              '; if(window.setSGP) window.setSGP();'),
              document.head.appendChild(e);
          }
          window.addEventListener('focus', focusCapture, true);
          window.addEventListener('blur', blurCapture, true);
          _this.connect(),
            (canvas = document.createElement('canvas')).style &&
              ((canvas.style.position = 'fixed'),
              (canvas.style.top = 0),
              (canvas.style.left = 0),
              (canvas.style.zIndex = 999999999),
              (canvas.style.background = 'transparent'),
              (canvas.style.margin = '0'),
              (canvas.style.padding = '0')),
            M(),
            ((c = document.createElement('div')).style.clear = 'both');
        })();
      };
      if (window.SGinjectscript && window.SGinjectscript.constructor == HTMLScriptElement) {
        var match = window.SGinjectscript.src.match(/([^a-p]|^)([a-p]{32})([^a-p]|$)/);
        if (match) window.SGextId = match[2];
        var scripts = document.querySelectorAll('script[src^=chrome-extension\\:\\/\\/]');
        for (var i = 0; i < scripts.length; i++) scripts[i].parentNode.removeChild(scripts[i]);
      }
      var l = function () {
        if (window.SG) {
          if (!window.SG.enabled()) window.SG.connect();
        } else {
          window.SG = new SmoothGestures();
        }
      };
    })();
  },
]);
