!(() => {
  'update_url' in chrome.runtime.getManifest() &&
    (console.log = console.error = () => {})
  var f = {}
  chrome.storage.local.get(null, (t) => {
    f = t
  })
  chrome.storage.onChanged.addListener((t, e) => {
    if ('local' == e) for (key in t) f[key] = t[key].newValue
  }),
    (window.drawGesture = (t, e, x, o) => {
      var n,
        c = ''
      's' == t[0]
        ? ((c = 's'), (t = t.substr(1)))
        : 'l' == t[0]
          ? ((c = 'l'), (t = t.substr(1)))
          : 'i' == t[0] && ((c = 'i'), (t = t.substr(1))),
        (n =
          'r' == t[0]
            ? a(t, e)
            : 'w' == t[0]
              ? s(t, e)
              : 'k' == t[0]
                ? drawKey(t, e)
                : drawLine(t, e, x, o)),
        $(n).css({ 'min-height': '2em', overflow: 'hidden' })
      var i = null
      return (
        's' == c
          ? (i = '* ' + chrome.i18n.getMessage('context_with_selection'))
          : 'l' == c
            ? (i = '* ' + chrome.i18n.getMessage('context_on_link'))
            : 'i' == c
              ? (i = '* ' + chrome.i18n.getMessage('context_on_image'))
              : f.gestures['s' + t]
                ? (i = '* ' + chrome.i18n.getMessage('context_not_selection'))
                : f.gestures['l' + t] && f.gestures['i' + t]
                  ? (i =
                      '* ' + chrome.i18n.getMessage('context_not_links_images'))
                  : f.gestures['l' + t]
                    ? (i = '* ' + chrome.i18n.getMessage('context_not_link'))
                    : f.gestures['i' + t] &&
                      (i = '* ' + chrome.i18n.getMessage('context_not_image')),
        i
          ? $('<div>')
              .css({ width: e + 'px', overflow: 'hidden' })
              .append(
                $('<div>')
                  .css({
                    'font-size': 12 * Math.sqrt(e / 100) + 'px',
                    color: '#888',
                    'text-align': 'right',
                    'margin-right': '.3em',
                    height: '0px',
                    position: 'relative',
                    top: '.1em',
                  })
                  .text(i),
              )
              .append(n)
          : n
      )
    })
  const drawLine = (
    gesture,
    width: number,
    height: number,
    lineWidth: number,
  ) => {
    const n: HTMLCanvasElement = document.createElement('canvas')
    n.width = width
    n.height = height
    const ctx = n.getContext('2d')
    ctx.strokeStyle =
      'rgba(' +
      f.trailColor.r +
      ',' +
      f.trailColor.g +
      ',' +
      f.trailColor.b +
      ',' +
      f.trailColor.a +
      ')'
    ctx.lineWidth = lineWidth || 3
    ctx.lineCap = 'butt'
    let step: number = 10
    let tight: number = 2
    let sep: number = 3

    let prev: { x: number, y: number } = { x: 0, y: 0 }
    let curr: { x: number, y: number } = { x: 0, y: 0 }
    const max: { x: number, y: number } = { x: 0, y: 0 }
    const min: { x: number, y: number } = { x: 0, y: 0 }

    var tip = (t) => {
      ;(prev = curr),
        ctx.lineTo(prev.x, prev.y),
        'U' === t
          ? (curr = { x: prev.x, y: prev.y - 0.75 * step })
          : 'D' == t
            ? (curr = { x: prev.x, y: prev.y + 0.75 * step })
            : 'L' == t
              ? (curr = { x: prev.x - 0.75 * step, y: prev.y })
              : 'R' == t
                ? (curr = { x: prev.x + 0.75 * step, y: prev.y })
                : '1' == t
                  ? (curr = {
                      x: prev.x - 0.5 * step,
                      y: prev.y + 0.5 * step,
                    })
                  : '3' == t
                    ? (curr = {
                        x: prev.x + 0.5 * step,
                        y: prev.y + 0.5 * step,
                      })
                    : '7' == t
                      ? (curr = {
                          x: prev.x - 0.5 * step,
                          y: prev.y - 0.5 * step,
                        })
                      : '9' == t &&
                        (curr = {
                          x: prev.x + 0.5 * step,
                          y: prev.y - 0.5 * step,
                        }),
        ctx.lineTo(curr.x, curr.y),
        minmax()
    }
    var u = (t) => {
      ;(prev = curr),
        ctx.lineTo(prev.x, prev.y),
        'UD' == t
          ? ((curr = { x: prev.x, y: prev.y - step }),
            minmax(),
            ctx.lineTo(prev.x, prev.y - step),
            ctx.arc(prev.x + tight, prev.y - step, tight, Math.PI, 0, !1),
            ctx.lineTo(prev.x + 2 * tight, prev.y))
          : 'UL' == t
            ? ctx.arc(prev.x - step, prev.y, step, 0, -Math.PI / 2, !0)
            : 'UR' == t
              ? ctx.arc(prev.x + step, prev.y, step, Math.PI, -Math.PI / 2, !1)
              : 'DU' == t
                ? ((curr = { x: prev.x, y: prev.y + step }),
                  minmax(),
                  ctx.lineTo(prev.x, prev.y + step),
                  ctx.arc(prev.x + tight, prev.y + step, tight, Math.PI, 0, !0),
                  ctx.lineTo(prev.x + 2 * tight, prev.y))
                : 'DL' == t
                  ? ctx.arc(prev.x - step, prev.y, step, 0, Math.PI / 2, !1)
                  : 'DR' == t
                    ? ctx.arc(
                        prev.x + step,
                        prev.y,
                        step,
                        Math.PI,
                        Math.PI / 2,
                        !0,
                      )
                    : 'LU' == t
                      ? ctx.arc(
                          prev.x,
                          prev.y - step,
                          step,
                          Math.PI / 2,
                          Math.PI,
                          !1,
                        )
                      : 'LD' == t
                        ? ctx.arc(
                            prev.x,
                            prev.y + step,
                            step,
                            -Math.PI / 2,
                            Math.PI,
                            !0,
                          )
                        : 'LR' == t
                          ? ((curr = { x: prev.x - step, y: prev.y }),
                            minmax(),
                            ctx.lineTo(prev.x - step, prev.y),
                            ctx.arc(
                              prev.x - step,
                              prev.y + tight,
                              tight,
                              -Math.PI / 2,
                              Math.PI / 2,
                              !0,
                            ),
                            ctx.lineTo(prev.x, prev.y + 2 * tight))
                          : 'RU' == t
                            ? ctx.arc(
                                prev.x,
                                prev.y - step,
                                step,
                                Math.PI / 2,
                                0,
                                !0,
                              )
                            : 'RD' == t
                              ? ctx.arc(
                                  prev.x,
                                  prev.y + step,
                                  step,
                                  -Math.PI / 2,
                                  0,
                                  !1,
                                )
                              : 'RL' == t
                                ? ((curr = { x: prev.x + step, y: prev.y }),
                                  minmax(),
                                  ctx.lineTo(prev.x + step, prev.y),
                                  ctx.arc(
                                    prev.x + step,
                                    prev.y + tight,
                                    tight,
                                    -Math.PI / 2,
                                    Math.PI / 2,
                                    !1,
                                  ),
                                  ctx.lineTo(prev.x, prev.y + 2 * tight))
                                : (tip(t[0]), tip(t[1])),
        'UD' == t
          ? (curr = { x: prev.x + 2 * tight, y: prev.y + sep })
          : 'UL' == t
            ? (curr = { x: prev.x - step, y: prev.y - step })
            : 'UR' == t
              ? (curr = { x: prev.x + step + sep, y: prev.y - step })
              : 'DU' == t
                ? (curr = { x: prev.x + 2 * tight, y: prev.y })
                : 'DL' == t
                  ? (curr = { x: prev.x - step, y: prev.y + step })
                  : 'DR' == t
                    ? (curr = { x: prev.x + step + sep, y: prev.y + step })
                    : 'LU' == t
                      ? (curr = { x: prev.x - step, y: prev.y - step })
                      : 'LD' == t
                        ? (curr = {
                            x: prev.x - step,
                            y: prev.y + step + sep,
                          })
                        : 'LR' == t
                          ? (curr = {
                              x: prev.x + sep,
                              y: prev.y + 2 * tight,
                            })
                          : 'RU' == t
                            ? (curr = { x: prev.x + step, y: prev.y - step })
                            : 'RD' == t
                              ? (curr = {
                                  x: prev.x + step,
                                  y: prev.y + step + sep,
                                })
                              : 'RL' == t &&
                                (curr = { x: prev.x, y: prev.y + 2 * tight }),
        minmax()
    }
    const minmax = (): void => {
      if (curr.x > max.x) max.x = curr.x
      if (curr.y > max.y) max.y = curr.y
      if (curr.x < min.x) min.x = curr.x
      if (curr.y < min.y) min.y = curr.y
    }
    for (ctx.beginPath(), tip(gesture[0]), i = 0; i < gesture.length - 1; i++)
      u(gesture[i] + gesture[i + 1])
    tip(gesture[gesture.length - 1]), ctx.stroke()
    var d = (max.x + min.x) / 2,
      M = (max.y + min.y) / 2,
      m = (max.x - min.x + step) / width,
      P = (max.y - min.y + step) / height,
      T = m < P ? P : m
    for (
      step /= T,
        sep /= T,
        6 < (tight /= T) && (tight = 6),
        curr = { x: 0, y: 0 },
        ctx.clearRect(0, 0, n.width, n.height),
        ctx.save(),
        ctx.translate(width / 2 - d / T, height / 2 - M / T),
        ctx.beginPath(),
        tip(gesture[0]),
        i = 0;
      i < gesture.length - 1;
      i++
    )
      u(gesture[i] + gesture[i + 1])
    return (
      tip(gesture[gesture.length - 1]),
      ctx.stroke(),
      (ctx.fillStyle =
        'rgba(' +
        f.trailColor.r +
        ',' +
        f.trailColor.g +
        ',' +
        f.trailColor.b +
        ',' +
        f.trailColor.a +
        ')'),
      ctx.beginPath(),
      'U' == gesture[gesture.length - 1]
        ? (ctx.moveTo(curr.x - 5, curr.y + 2),
          ctx.lineTo(curr.x + 5, curr.y + 2),
          ctx.lineTo(curr.x, curr.y - 3))
        : 'D' == gesture[gesture.length - 1]
          ? (ctx.moveTo(curr.x - 5, curr.y - 2),
            ctx.lineTo(curr.x + 5, curr.y - 2),
            ctx.lineTo(curr.x, curr.y + 3))
          : 'L' == gesture[gesture.length - 1]
            ? (ctx.moveTo(curr.x + 2, curr.y - 5),
              ctx.lineTo(curr.x + 2, curr.y + 5),
              ctx.lineTo(curr.x - 3, curr.y))
            : 'R' == gesture[gesture.length - 1]
              ? (ctx.moveTo(curr.x - 2, curr.y - 5),
                ctx.lineTo(curr.x - 2, curr.y + 5),
                ctx.lineTo(curr.x + 3, curr.y))
              : '1' == gesture[gesture.length - 1]
                ? (ctx.moveTo(curr.x - 2, curr.y - 6),
                  ctx.lineTo(curr.x + 6, curr.y + 2),
                  ctx.lineTo(curr.x - 2, curr.y + 2))
                : '3' == gesture[gesture.length - 1]
                  ? (ctx.moveTo(curr.x + 2, curr.y - 6),
                    ctx.lineTo(curr.x - 6, curr.y + 2),
                    ctx.lineTo(curr.x + 2, curr.y + 2))
                  : '7' == gesture[gesture.length - 1]
                    ? (ctx.moveTo(curr.x - 2, curr.y + 6),
                      ctx.lineTo(curr.x + 6, curr.y - 2),
                      ctx.lineTo(curr.x - 2, curr.y - 2))
                    : '9' == gesture[gesture.length - 1] &&
                      (ctx.moveTo(curr.x + 2, curr.y + 6),
                      ctx.lineTo(curr.x - 6, curr.y - 2),
                      ctx.lineTo(curr.x + 2, curr.y - 2)),
      ctx.closePath(),
      ctx.fill(),
      ctx.restore(),
      n
    )
  }

  const a = (t, e) => {
    var x = 'L' == t[1] ? 0 : 'M' == t[1] ? 1 : 2,
      o = 'L' == t[2] ? 0 : 'M' == t[2] ? 1 : 2
    return $('<div>')
      .css({ width: e - 2 + 'px', padding: '5px 1px' })
      .append(
        $('<div>')
          .text(chrome.i18n.getMessage('gesture_' + t))
          .css({
            'font-size': 14 * Math.sqrt(e / 100) + 'px',
            color: '#111',
            'text-align': 'center',
            'font-weight': 'bold',
          }),
      )
      .append(
        $('<div>')
          .text(
            chrome.i18n.getMessage('gesture_rocker_descrip', [
              chrome.i18n.getMessage('options_mousebutton_' + x),
              chrome.i18n.getMessage('options_mousebutton_' + o),
            ]),
          )
          .css({
            'font-size': 12 * Math.sqrt(e / 100) + 'px',
            color: '#666',
            'text-align': 'center',
          }),
      )
  }

  const s = (t, e) => {
    return $('<div>')
      .css({ width: e - 2 + 'px', padding: '5px 1px' })
      .append(
        $('<div>')
          .text(chrome.i18n.getMessage('gesture_' + t))
          .css({
            'font-size': 14 * Math.sqrt(e / 100) + 'px',
            color: '#111',
            'text-align': 'center',
            'font-weight': 'bold',
          }),
      )
      .append(
        $('<div>')
          .text(chrome.i18n.getMessage('gesture_' + t + '_descrip'))
          .css({
            'font-size': 12 * Math.sqrt(e / 100) + 'px',
            color: '#666',
            'text-align': 'center',
          }),
      )
  }

  const codeCharMap = {
    8: 'Backspace',
    9: 'Tab',
    13: 'Enter',
    19: 'Pause',
    20: 'Caps Lock',
    27: 'Esc',
    32: 'Space',
    33: 'Page Up',
    34: 'Page Down',
    35: 'End',
    36: 'Home',
    37: 'Left',
    38: 'Up',
    39: 'Right',
    40: 'Down',
    45: 'Insert',
    46: 'Delete',
    96: 'NP 0',
    97: 'NP 1',
    98: 'NP 2',
    99: 'NP 3',
    100: 'NP 4',
    101: 'NP 5',
    102: 'NP 6',
    103: 'NP 7',
    104: 'NP 8',
    105: 'NP 9',
    106: 'NP *',
    107: 'NP +',
    109: 'NP -',
    110: 'NP .',
    111: 'NP /',
    144: 'Num Lock',
    145: 'Scroll Lock',
    186: ';',
    187: '=',
    188: ',',
    189: '-',
    190: '.',
    191: '/',
    192: '~',
    219: '[',
    220: '\\',
    221: ']',
    222: "'",
  }
  const drawKey = (gesture, width) => {
    return $('<div>')
      .css({ width: width - 2 + 'px', padding: '5px 1px' })
      .append(
        $('<div>')
          .text(
            (gesture[1] === '1' ? 'Ctrl + ' : '') +
              (gesture[2] === '1' ? 'Alt + ' : '') +
              (gesture[3] === '1' ? 'Shift + ' : '') +
              (gesture[4] === '1' ? 'Meta + ' : '') +
              ((t) => {
                var e = (t = t.split(':'))[1],
                  x = t[2]
                if (!e || '' == e) return 'empty'
                if ('U+' != e.substr(0, 2)) return e
                var o = codeCharMap[x]
                return o || JSON.parse('"\\u' + e.substr(2) + '"')
              })(gesture),
          )
          .css({
            'font-size': 14 * Math.sqrt(width / 100) + 'px',
            color: '#666',
            'text-align': 'center',
            'font-weight': 'bold',
          }),
      )
  }
})()
