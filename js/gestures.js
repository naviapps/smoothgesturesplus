!function (n) {
    var o = {};

    function i(e) {
        if (o[e]) return o[e].exports;
        var t = o[e] = {i: e, l: false, exports: {}};
        return n[e].call(t.exports, t, t.exports, i), t.l = true, t.exports
    }

    i.m = n, i.c = o, i.i = function (e) {
        return e
    }, i.d = function (e, t, n) {
        i.o(e, t) || Object.defineProperty(e, t, {configurable: false, enumerable: true, get: n})
    }, i.n = function (e) {
        var t = e && e.__esModule ? function () {
            return e.default
        } : function () {
            return e
        };
        return i.d(t, 'a', t), t
    }, i.o = function (e, t) {
        return Object.prototype.hasOwnProperty.call(e, t)
    }, i.p = '', i(i.s = 1)
}([, function (e, t) {
    !function () {
        var e = {};
        for (a in console) e[a] = console[a];
        if ('update_url' in chrome.runtime.getManifest()) for (a in console) console[a] = function () {
        };
        var A = 'Smooth Gestures Plus' != chrome.runtime.getManifest().short_name,
            B = 'update_url' in chrome.runtime.getManifest() ? 'kdcjmllhmhnnadianfhhnoefgcdbpdap' : (chrome.runtime.id, 'ijgdgeacmjiigjjepffiijkleklaapfl'),
            O = {};
        if (A) chrome.extension.sendMessage(B, {storage: true}, function (e) {
            e && e.gestures && e.validGestures && (O = e, l())
        }); else {
            chrome.storage.local.get(null, function (e) {
                O = e, l()
            });
            chrome.storage.onChanged.addListener(function (e, t) {
                if ('local' == t) for (key in e) O[key] = e[key].newValue
            })
        }
        chrome.runtime.onMessage.addListener(function (e, t, n) {
            e.ping && n({pong: true})
        });
        var SmoothGestures = function () {
            var _this = this;
            _this.callback = null;
            var n = Math.floor(Math.random() * Math.pow(2, 30)).toString(32) + Math.floor(Math.random() * Math.pow(2, 30)).toString(32);
            _this.isId = function (e) {
                return n == e
            };
            var enabled = !(_this.postMessage = function (e, t) {
                    n == e && port && port.postMessage(t)
                }), port = null, w = null, c = null, f = {}, r = false, a = {}, o = {}, d = true, i = false, l = '0000',
                u = false,
                focus = null;
            _this.connect = function () {
                var e = {name: JSON.stringify({name: 'smoothgestures.tab', frame: !parent, id: n, url: location.href})};
                window.SGextId && (port = chrome.runtime.connect(window.SGextId, e)), (port = A ? chrome.runtime.connect(B, e) : chrome.runtime.connect(e)) && (port.onMessage.addListener(t), port.onDisconnect.addListener(_this.disable))
            };
            var t = function (e) {
                'enable' in e && (e.enable ? enable() : _this.disable()), e.disable && _this.disable(), e.action && localAction(e.action), e.windowBlurred && (a = {}, o = {}, d = true, endGesture()), e.chain && (L(e.chain.startPoint, e.chain.startPoint ? document.elementFromPoint(e.chain.startPoint.x, e.chain.startPoint.y) : null, e.chain.line, e.chain.rocker, e.chain.wheel, 1e4), d = true, e.chain.buttonDown && (e.chain.buttonDown[0] && (o[0] = true), e.chain.buttonDown[1] && (o[1] = true), e.chain.buttonDown[2] && (o[2] = true), null == a[0] && (a[0] = e.chain.buttonDown[0]), null == a[1] && (a[1] = e.chain.buttonDown[1]), null == a[2] && (a[2] = e.chain.buttonDown[2]))), e.syncButton && (a[e.syncButton.id] = e.syncButton.down), e.displayAlert && alert(e.displayAlert)
            };
            localAction = function (e) {
                if ('page-back' == e.id) history.back(); else if ('page-forward' == e.id) history.forward(); else if ('page-back-close' == e.id) {
                    var t = location.href;
                    history.back(), e.has_history || setTimeout(function () {
                        t == location.href && port.postMessage({closetab: true})
                    }, 400)
                } else if ('stop' == e.id) window.stop(); else if ('print' == e.id) window.print(); else if ('goto-top' == e.id) {
                    for (var n = e.startPoint ? document.elementFromPoint(e.startPoint.x, e.startPoint.y) : document.documentElement; n != document.documentElement && n.parentNode && (n.scrollHeight <= n.clientHeight || 0 == n.scrollTop || -1 == ['auto', 'scroll'].indexOf(document.defaultView.getComputedStyle(n)['overflow-y']));) n = n.parentNode;
                    n == document.documentElement && (document.body.scrollTop = 0), n.scrollTop = 0
                } else if ('goto-bottom' == e.id) {
                    for (n = e.startPoint ? document.elementFromPoint(e.startPoint.x, e.startPoint.y) : document.documentElement; n != document.documentElement && n.parentNode && (n.scrollHeight <= n.clientHeight || n.scrollTop == n.scrollHeight - n.clientHeight || -1 == ['auto', 'scroll'].indexOf(document.defaultView.getComputedStyle(n)['overflow-y']));) n = n.parentNode;
                    n == document.documentElement && (document.body.scrollTop = document.body.scrollHeight), n.scrollTop = n.scrollHeight
                } else if ('page-up' == e.id) {
                    for (n = e.startPoint ? document.elementFromPoint(e.startPoint.x, e.startPoint.y) : document.documentElement; n != document.documentElement && n.parentNode && (n.scrollHeight <= n.clientHeight || 0 == n.scrollTop || -1 == ['auto', 'scroll'].indexOf(document.defaultView.getComputedStyle(n)['overflow-y']));) n = n.parentNode;
                    n == document.documentElement && (document.body.scrollTop -= .8 * Math.min(document.documentElement.clientHeight, document.body.clientHeight)), n.scrollTop -= .8 * Math.min(document.documentElement.clientHeight, n.clientHeight)
                } else if ('page-down' == e.id) {
                    for (n = e.startPoint ? document.elementFromPoint(e.startPoint.x, e.startPoint.y) : document.documentElement; n != document.documentElement && n.parentNode && (n.scrollHeight <= n.clientHeight || n.scrollTop == n.scrollHeight - n.clientHeight || -1 == ['auto', 'scroll'].indexOf(document.defaultView.getComputedStyle(n)['overflow-y']));) n = n.parentNode;
                    console.log('scroll', n, n.scrollTop, document.body.scrollTop, document.documentElement.clientHeight, document.body.clientHeight, n.clientHeight), n == document.documentElement && (document.body.scrollTop += .8 * Math.min(document.documentElement.clientHeight, document.body.clientHeight)), console.log('scroll2', n.scrollTop, document.body.scrollTop), n.scrollTop += .8 * Math.min(document.documentElement.clientHeight, n.clientHeight), console.log('scroll3', n.scrollTop, document.body.scrollTop)
                } else if ('zoom-in-hack' == e.id) {
                    var o = document.body.style.zoom ? 1.1 * document.body.style.zoom : 1.1;
                    document.body.style.zoom = o, w.style.zoom = 1 / o
                } else if ('zoom-out-hack' == e.id) {
                    o = document.body.style.zoom ? document.body.style.zoom / 1.1 : 1 / 1.1;
                    document.body.style.zoom = o, w.style.zoom = 1 / o
                } else if ('zoom-zero-hack' == e.id) document.body.style.zoom = 1, w.style.zoom = 1; else if ('zoom-img-in' == e.id) for (var i = 0; i < e.images.length; i++) {
                    (l = $("img[gestureid='" + e.images[i].gestureid + "']")).attr('origsize') || l.attr('origsize', l.width() + 'x' + l.height()), l.css({
                        width: 1.2 * l.width(),
                        height: 1.2 * l.height()
                    })
                } else if ('zoom-img-out' == e.id) for (i = 0; i < e.images.length; i++) {
                    (l = $("img[gestureid='" + e.images[i].gestureid + "']")).attr('origsize') || l.attr('origsize', l.width() + 'x' + l.height()), l.css({
                        width: l.width() / 1.2,
                        height: l.height() / 1.2
                    })
                } else if ('zoom-img-zero' == e.id) for (i = 0; i < e.images.length; i++) {
                    var l;
                    if (!(l = $("img[gestureid='" + e.images[i].gestureid + "']")).attr('origsize')) return;
                    var r = l.attr('origsize').split('x');
                    l.css({width: r[0] + 'px', height: r[1] + 'px'})
                } else if ('hide-image' == e.id) for (i = 0; i < e.images.length; i++) $("img[gestureid='" + e.images[i].gestureid + "']").css({display: 'none'})
            };
            var mouseDownCapture = function (e) {
                if (o[e.button] = false, d = 2 != e.button, e.target && 'HTML' == e.target.nodeName && (document.height > window.innerHeight && e.clientX > window.innerWidth - 17 || document.width > window.innerWidth && e.clientY > window.innerHeight - 17)) endGesture(); else {
                    if (r && port.postMessage({syncButton: {id: e.button, down: true}}), a[e.button] = true, i) {
                        if (2 == e.button) return void endGesture();
                        i = false
                    }
                    var t, n;
                    if (T(e), f.rocker && (a[0] ? 1 : 0) + (a[1] ? 1 : 0) + (a[2] ? 1 : 0) == 2) if (a[0] && (0 == e.button ? n = 'L' : t = 'L'), a[1] && (1 == e.button ? n = 'M' : t = 'M'), a[2] && (2 == e.button ? n = 'R' : t = 'R'), _this.callback || O.validGestures.r[t] && O.validGestures.r[t][n]) return r = {
                        timeout: setTimeout(function () {
                            r = false
                        }, 500)
                    }, S('r' + t + n), window.getSelection().removeAllRanges(), d = true, o[0] = true, o[1] = true, o[2] = true, e.preventDefault(), void e.stopPropagation();
                    O.contextOnLink && 2 == e.button && N(e.target) || 0 == O.holdButton && 0 == e.button && 'SELECT' == e.target.nodeName || (0 != O.holdButton || '0' == l[0] && '0' == l[1] && '0' == l[2] && !u) && (0 == O.holdButton && 0 == e.button && 'IMG' == e.target.nodeName && e.preventDefault(), 1 == e.button && (O.validGestures.r.M || window.SG.callback) && -1 != navigator.platform.indexOf('Win') && e.preventDefault(), L({
                        x: e.clientX,
                        y: e.clientY
                    }, e.target, e.button == O.holdButton, (a[0] ? 1 : 0) + (a[1] ? 1 : 0) + (a[2] ? 1 : 0) == 1 && (_this.callback || O.validGestures.r && (a[0] && O.validGestures.r.L || a[1] && O.validGestures.r.M || a[2] && O.validGestures.r.R)), e.button == O.holdButton && (_this.callback || O.validGestures.w)))
                }
            }
            var y = function (e) {
                if (e.button == O.holdButton && (f.line && T(e, true), f.line && '' != f.line.code && (S(f.line.code), e.preventDefault(), 0 == e.button && window.getSelection().removeAllRanges(), 2 == e.button && (d = true), o[e.button] = true)), f.line = null, f.wheel = null, 2 != e.button && (d = true), !(2 != e.button || i || d || a[0] || a[1] || -1 != navigator.platform.indexOf('Win'))) {
                    i = true, setTimeout(function () {
                        i = false
                    }, 600);
                    var t = {x: e.screenX, y: e.screenY};
                    navigator.userAgent.match(/linux/i) && (e.screenX < window.screenLeft + Math.round(e.clientX * window.devicePixelRatio) || 0 == window.screenLeft && e.screenY < 55 + window.screenTop + Math.round(e.clientY * window.devicePixelRatio)) && (t.x += window.screenLeft, t.y += window.screenTop), console.log('SEND NATIVE', t), port.postMessage({nativeport: {rightclick: t}})
                }
                o[e.button] && e.preventDefault(), a[e.button] = false, r && port.postMessage({
                    syncButton: {
                        id: e.button,
                        down: false
                    }
                }), a[0] || a[2] || (f.rocker = null), f.rocker || endGesture()
            }
            var p = function (e) {
                a = {}
            }
            var mouseClickCapture = function (e) {
                o[e.button] && (e.preventDefault(), e.stopPropagation()), o[e.button] = false
            }
            var doContextMenu = function (e) {
                (d || a[2] && (f.line || f.rocker || f.wheel)) && !i ? (e.preventDefault(), e.stopPropagation(), d = false) : (endGesture(), a = {})
            }
            var doSelectStart = function (e) {
                0 != O.holdButton || '0' != l[0] || '0' != l[1] || '0' != l[2] || u || window.getSelection().removeAllRanges()
            }
            var M = function () {
                w.width = window.innerWidth, w.height = window.innerHeight
            }
            var keyDownCapture = function (e) {
                if (27 == e.keyCode) {
                    endGesture(), u = true;
                    var t = function (e) {
                        u = false, window.removeEventListener('keyup', t, true)
                    };
                    window.addEventListener('keyup', t, true)
                }
                var n = (e.ctrlKey ? '1' : '0') + (e.altKey ? '1' : '0') + (e.shiftKey ? '1' : '0') + (e.metaKey ? '1' : '0');
                if (16 == e.keyCode || 17 == e.keyCode || 18 == e.keyCode || 0 == e.keyCode || 91 == e.keyCode || 92 == e.keyCode || 93 == e.keyCode) {
                    var o = 16 == e.keyCode ? 2 : 17 == e.keyCode ? 0 : 18 == e.keyCode ? 1 : (0 == e.keyCode || 91 == e.keyCode || 92 == e.keyCode || e.keyCode, null);
                    if (null != o) {
                        n = n.substr(0, o) + '1' + n.substr(o + 1);
                        t = function (e) {
                            l = l.substr(0, o) + '0' + l.substr(o + 1), window.removeEventListener('keyup', t, true)
                        };
                        window.addEventListener('keyup', t, true)
                    }
                    l = n
                } else (_this.callback || ('0000' != n || null == focus || 'INPUT' != focus.nodeName && 'TEXTAREA' != focus.nodeName) && O.validGestures.k && O.validGestures.k[n] && 0 <= O.validGestures.k[n].indexOf(e.keyIdentifier + ':' + e.keyCode)) && (L(null, null, false, false, false), S('k' + n + ':' + e.keyIdentifier + ':' + e.keyCode), e.preventDefault(), e.stopPropagation())
            }

            var focusCapture = function (t) {
                if (t.target.nodeName) focus = t.target
            }

            var blurCapture = function (e) {
                if (e.target.nodeName) focus = null
            }

            var L = function (e, t, n, o, i, l) {
                if (endGesture(), f.events || (window.addEventListener('mousemove', T, true), window.addEventListener('mousewheel', wheelGesture, true), f.events = true), 'mail.google.com' == location.hostname) {
                    var r = document.body.children[1], s = function () {
                        endGesture(), r.removeEventListener('DOMSubtreeModified', s, true)
                    };
                    r.addEventListener('DOMSubtreeModified', s, true)
                }
                f.startPoint = e ? {x: e.x, y: e.y} : null, f.targets = t ? [t] : [];
                var a = window.getSelection();
                f.selection = a.toString(), f.ranges = [];
                for (var d = 0; d < a.rangeCount; d++) f.ranges.push(a.getRangeAt(d));
                f.timeout = null, f.line = n && e ? {
                    code: '',
                    points: [{x: e.x, y: e.y}],
                    dirPoints: [{x: e.x, y: e.y}],
                    possibleDirs: O.validGestures,
                    distance: 0
                } : null, f.rocker = o, f.wheel = i, document.documentElement.offsetHeight < document.documentElement.scrollHeight && (f.line || f.wheel) && !c.parentNode && document.body.appendChild(c)
            }
            var T = function (e, t) {
                if (f.startPoint || (f.startPoint = {
                    x: e.clientX,
                    y: e.clientY
                }), (f.rocker || f.wheel) && (0 < Math.abs(e.clientX - f.startPoint.x) || 2 < Math.abs(e.clientY - f.startPoint.y)) && (f.rocker = null, f.wheel = null), f.line) {
                    var n = {x: e.clientX, y: e.clientY}, o = f.line.points[f.line.points.length - 1];
                    f.line.points.push(n), f.line.distance += Math.sqrt(Math.pow(n.x - o.x, 2) + Math.pow(n.y - o.y, 2));
                    var i = n.x - f.line.dirPoints[f.line.dirPoints.length - 1].x,
                        l = n.y - f.line.dirPoints[f.line.dirPoints.length - 1].y;
                    !O.trailBlock && w.getContext && (G(), !w.parentNode && (10 < Math.abs(i) || 10 < Math.abs(l)) && document.body.appendChild(w));
                    var r = '' == f.line.code ? 'X' : f.line.code.substr(-1, 1),
                        s = C(f.line.dirPoints[f.line.dirPoints.length - 1], n);
                    s == r ? f.line.dirPoints[f.line.dirPoints.length - 1] = n : (25 < Math.abs(i) || 25 < Math.abs(l)) && (t || s.match(/^[RLUD]$/)) && (f.line.possibleDirs && (f.line.possibleDirs = f.line.possibleDirs[s]), f.line.possibleDirs || _this.callback ? (f.line.code += s, f.line.dirPoints.push(n)) : (endGesture(), d = true))
                }
            }
            var C = function (e, t) {
                var n = t.x - e.x, o = t.y - e.y;
                return Math.abs(n) > 2 * Math.abs(o) ? 0 < n ? 'R' : 'L' : Math.abs(o) > 2 * Math.abs(n) ? 0 < o ? 'D' : 'U' : o < 0 ? 0 < n ? '9' : '7' : 0 < n ? '3' : '1'
            }

            var wheelGesture = function (t) {
                if (t.target.nodeName === 'IFRAME' || t.target.nodeName === 'FRAME') endGesture()
                T(t)
                if (f.wheel && 0 != t.wheelDelta) {
                    var dir = t.wheelDelta > 0 ? 'U' : 'D';
                    (_this.callback || O.validGestures.w[dir]) && (r = {
                        timeout: setTimeout(function () {
                            r = false
                        }, 500)
                    }, S('w' + dir), 2 == O.holdButton && (d = true), 0 == O.holdButton && window.getSelection().removeAllRanges(), o[O.holdButton] = true, t.preventDefault(), t.stopPropagation())
                }
            }

            var S = function (e) {
                if (e) if (_this.callback) _this.callback(e), _this.callback = null; else {
                    var t = {
                        gesture: e,
                        startPoint: f.startPoint,
                        targets: [],
                        links: [],
                        images: [],
                        selection: f.selection
                    };
                    if (f.line && 'w' != e[0] && 'r' != e[0] && (t.line = {
                        distance: f.line.distance,
                        segments: e.length
                    }), O.selectToLink && f.selection) {
                        parts = f.selection.split('http');
                        for (var n = 1; n < parts.length; n++) {
                            (o = (o = 'http' + parts[n]).split(/[\s"']/)[0]).match(/\/\/.+\..+/) && t.links.push({src: o})
                        }
                    }
                    for (n = 0; n < f.targets.length; n++) {
                        var o, i = Math.floor(Math.random() * Math.pow(2, 30)).toString(32);
                        f.targets[n].setAttribute('gestureid', i), t.targets.push({gestureid: i}), (o = N(f.targets[n])) && t.links.push({
                            src: o,
                            gestureid: i
                        }), 'IMG' == f.targets[n].nodeName && t.images.push({src: f.targets[n].src, gestureid: i})
                    }
                    r && (t.buttonDown = a), port.postMessage(t);
                    f.targets
                }
                if ('w' == e[0]) f.line = null, f.rocker = null; else if ('r' == e[0]) f.line = null, f.wheel = null; else {
                    if (f.ranges && 0 < f.ranges.length) {
                        var l = window.getSelection();
                        l.removeAllRanges();
                        for (n = 0; n < f.ranges.length; n++) l.addRange(f.ranges[n])
                    }
                    endGesture()
                }
            }
            var endGesture = function () {
                f.events && (window.removeEventListener('mousemove', T, true), window.removeEventListener('mousewheel', wheelGesture, true), f.events = false), w.parentNode && w.parentNode.removeChild(w), w.getContext && w.getContext('2d').clearRect(0, 0, w.width, w.height), c.parentNode && c.parentNode.removeChild(c), clearTimeout(f.timeout), f.timeout = null, f.selection = null, f.ranges = null, f.line = null, f.rocker = null, f.wheel = null
            }
            var N = function (e) {
                for (; e;) {
                    if (e.href) return e.href;
                    e = e.parentNode
                }
                return null
            }
            var G = function () {
                if (!G.timeout) {
                    var e = Date.now() - z.lasttime, t = Math.min(500, 4 * z.runtime);
                    t < e ? z() : G.timeout = setTimeout(function () {
                        z(), G.timeout = null
                    }, t - e)
                }
            }
            var z = function () {
                if (!w.getContext) return
                var e = Date.now()
                var ctx = w.getContext('2d');
                if (ctx.clearRect(0, 0, w.width, w.height), f.line) {
                    if (ctx.strokeStyle = 'rgba(' + O.trailColor.r + ',' + O.trailColor.g + ',' + O.trailColor.b + ',' + O.trailColor.a + ')', ctx.lineWidth = O.trailWidth, ctx.lineCap = 'butt', ctx.lineJoin = 'round', ctx.shadowBlur = O.trailWidth, ctx.shadowColor = 'rgba(255,255,255,.3)', O.trailLegacy) {
                        ctx.beginPath(), ctx.moveTo(f.line.points[0].x, f.line.points[0].y);
                        for (r = 1; r < f.line.points.length; r++) ctx.lineTo(f.line.points[r].x, f.line.points[r].y);
                        ctx.stroke()
                    } else {
                        var n = {x: f.line.dirPoints[0].x, y: f.line.dirPoints[0].y},
                            o = f.line.points[f.line.points.length - 1],
                            i = f.line.dirPoints[f.line.dirPoints.length - 1], l = C(i, o);
                        25 < Math.max(Math.abs(o.x - i.x), Math.abs(o.y - i.y)) && l.match(/^[1379]$/);
                        ctx.beginPath(), 0 < f.line.code.length && ('L' == f.line.code[0] || 'R' == f.line.code[0] ? n.y = f.line.dirPoints[1].y : n.x = f.line.dirPoints[1].x), ctx.moveTo(n.x, n.y);
                        for (var r = 1; r < f.line.code.length; r++) {
                            var s = f.line.code[r - 1], a = f.line.code[r], d = f.line.dirPoints[r],
                                c = f.line.dirPoints[r + 1];
                            if ('L' == s || 'R' == s) if ('L' == a || 'R' == a) {
                                var u = Math.min(Math.abs(d.x - n.x), Math.abs(c.y - n.y) / 2);
                                ctx.arcTo(d.x, n.y, d.x, c.y, u), u = Math.min(Math.abs(c.x - d.x), Math.abs(c.y - n.y) - u), ctx.arcTo(d.x, c.y, c.x, c.y, u), n.x = (d.x + c.x) / 2, n.y = c.y, ctx.lineTo(n.x, n.y)
                            } else {
                                var m = c.y;
                                'L' != f.line.code[r + 1] && 'R' != f.line.code[r + 1] || (m = f.line.dirPoints[r + 2].y);
                                u = Math.min(Math.abs(c.x - n.x), Math.abs(m - n.y) / 2);
                                ctx.arcTo(c.x, n.y, c.x, c.y, .8 * u), n.x = c.x, n.y = (n.y + m) / 2, ctx.lineTo(n.x, n.y)
                            } else if ('L' == a || 'R' == a) {
                                var h = c.x;
                                'U' != f.line.code[r + 1] && 'D' != f.line.code[r + 1] || (h = f.line.dirPoints[r + 2].x);
                                u = Math.min(Math.abs(h - n.x) / 2, Math.abs(c.y - n.y));
                                ctx.arcTo(n.x, c.y, c.x, c.y, .8 * u), n.x = (n.x + h) / 2, n.y = c.y, ctx.lineTo(n.x, n.y)
                            } else {
                                u = Math.min(Math.abs(c.x - n.x) / 2, Math.abs(d.y - n.y));
                                ctx.arcTo(n.x, d.y, c.x, d.y, u), u = Math.min(Math.abs(c.x - n.x) - u, Math.abs(c.y - d.y)), ctx.arcTo(c.x, d.y, c.x, c.y, u), n.x = c.x, n.y = (d.y + c.y) / 2, ctx.lineTo(n.x, n.y)
                            }
                        }
                        0 < f.line.code.length && (n = f.line.dirPoints[f.line.dirPoints.length - 1], ctx.lineTo(n.x, n.y)), ctx.stroke(), (f.line.possibleDirs && f.line.possibleDirs[l] || _this.callback) && ('3' == l || '7' == l ? ctx.lineTo((n.x - n.y + o.x + o.y) / 2, (-n.x + n.y + o.x + o.y) / 2) : '1' != l && '9' != l || ctx.lineTo((n.x + n.y + o.x - o.y) / 2, (n.x + n.y - o.x + o.y) / 2), ctx.stroke())
                    }
                    z.lasttime = Date.now(), z.runtime = .9 * (z.runtime || 10) + .1 * (z.lasttime - e)
                }
            }
            var enable = function () {
                if (enabled) return
                enabled = true

                window.addEventListener('mousedown', mouseDownCapture, true)
                window.addEventListener('mouseup', y, true)
                window.addEventListener('dragend', p, true)
                window.addEventListener('click', mouseClickCapture, true)
                window.addEventListener('contextmenu', doContextMenu, true)
                window.addEventListener('selectstart', doSelectStart, true)
                window.addEventListener('resize', M, true)
                window.addEventListener('keydown', keyDownCapture, true)
            };

            _this.disable = function () {
                if (!enabled) return
                enabled = false

                window.removeEventListener('mousedown', mouseDownCapture, true)
                window.removeEventListener('mouseup', y, true)
                window.removeEventListener('dragend', p, true)
                window.removeEventListener('click', mouseClickCapture, true)
                window.removeEventListener('contextmenu', doContextMenu, true)
                window.removeEventListener('selectstart', doSelectStart, true)
                window.removeEventListener('resize', M, true)
                window.removeEventListener('keydown', keyDownCapture, true)
                port.onMessage.removeListener(t)
                port.onDisconnect.removeListener(_this.disable)
            }

            _this.enabled = function () {
                return enabled;
            }

            (function () {
                if ('smoothgesturesplus.com' == location.hostname) {
                    var e = document.createElement('script');
                    e.innerText = 'window.sgp = ' + JSON.stringify({
                        license: O.license,
                        clid: O.id,
                        firstinstalled: O.firstinstalled
                    }) + '; if(window.setSGP) window.setSGP();', document.head.appendChild(e)
                }
                window.addEventListener('focus', focusCapture, true)
                window.addEventListener('blur', blurCapture, true)
                _this.connect(), (w = document.createElement('canvas')).style && (w.style.position = 'fixed', w.style.top = 0, w.style.left = 0, w.style.zIndex = 999999999, w.style.background = 'transparent', w.style.margin = '0', w.style.padding = '0'), M(), (c = document.createElement('div')).style.clear = 'both'
            })()
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
        }
    }()
}]);
