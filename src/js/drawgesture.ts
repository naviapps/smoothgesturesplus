!(function () {
  'update_url' in chrome.runtime.getManifest() && (console.log = console.error = function () {});
  let f = {};
  chrome.storage.local.get(null, function (t) {
    f = t;
  });
  chrome.storage.onChanged.addListener(function (t, e) {
    if (e == 'local') for (key in t) f[key] = t[key].newValue;
  }),
    (window.drawGesture = function (t, e, x, o) {
      let n;
      let c = '';
      t[0] == 's'
        ? ((c = 's'), (t = t.substr(1)))
        : t[0] == 'l'
          ? ((c = 'l'), (t = t.substr(1)))
          : t[0] == 'i' && ((c = 'i'), (t = t.substr(1))),
        (n = t[0] == 'r' ? a(t, e) : t[0] == 'w' ? s(t, e) : t[0] == 'k' ? y(t, e) : r(t, e, x, o)),
        $(n).css({ 'min-height': '2em', overflow: 'hidden' });
      let i = null;
      return (
        c == 's'
          ? (i = `* ${chrome.i18n.getMessage('context_with_selection')}`)
          : c == 'l'
            ? (i = `* ${chrome.i18n.getMessage('context_on_link')}`)
            : c == 'i'
              ? (i = `* ${chrome.i18n.getMessage('context_on_image')}`)
              : f.gestures[`s${t}`]
                ? (i = `* ${chrome.i18n.getMessage('context_not_selection')}`)
                : f.gestures[`l${t}`] && f.gestures[`i${t}`]
                  ? (i = `* ${chrome.i18n.getMessage('context_not_links_images')}`)
                  : f.gestures[`l${t}`]
                    ? (i = `* ${chrome.i18n.getMessage('context_not_link')}`)
                    : f.gestures[`i${t}`] &&
                      (i = `* ${chrome.i18n.getMessage('context_not_image')}`),
        i
          ? $('<div>')
              .css({ width: `${e}px`, overflow: 'hidden' })
              .append(
                $('<div>')
                  .css({
                    'font-size': `${12 * Math.sqrt(e / 100)}px`,
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
      );
    });
  var r = function (t, e, x, o) {
    const n = document.createElement('canvas');
    (n.width = e),
      (n.height = x),
      (ctx = n.getContext('2d')),
      (ctx.strokeStyle = `rgba(${f.trailColor.r},${f.trailColor.g},${f.trailColor.b},${
        f.trailColor.a
      })`),
      (ctx.lineWidth = o || 3),
      (ctx.lineCap = 'butt');
    let c = 10;
    let r = 2;
    let a = 3;
    let s = { x: 0, y: 0 };
    let y = { x: 0, y: 0 };
    const l = { x: 0, y: 0 };
    const g = { x: 0, y: 0 };
    const h = function (t) {
      (s = y),
        ctx.lineTo(s.x, s.y),
        t == 'U'
          ? (y = { x: s.x, y: s.y - 0.75 * c })
          : t == 'D'
            ? (y = { x: s.x, y: s.y + 0.75 * c })
            : t == 'L'
              ? (y = { x: s.x - 0.75 * c, y: s.y })
              : t == 'R'
                ? (y = { x: s.x + 0.75 * c, y: s.y })
                : t == '1'
                  ? (y = { x: s.x - 0.5 * c, y: s.y + 0.5 * c })
                  : t == '3'
                    ? (y = { x: s.x + 0.5 * c, y: s.y + 0.5 * c })
                    : t == '7'
                      ? (y = { x: s.x - 0.5 * c, y: s.y - 0.5 * c })
                      : t == '9' && (y = { x: s.x + 0.5 * c, y: s.y - 0.5 * c }),
        ctx.lineTo(y.x, y.y),
        p();
    };
    const u = function (t) {
      (s = y),
        ctx.lineTo(s.x, s.y),
        t == 'UD'
          ? ((y = { x: s.x, y: s.y - c }),
            p(),
            ctx.lineTo(s.x, s.y - c),
            ctx.arc(s.x + r, s.y - c, r, Math.PI, 0, !1),
            ctx.lineTo(s.x + 2 * r, s.y))
          : t == 'UL'
            ? ctx.arc(s.x - c, s.y, c, 0, -Math.PI / 2, !0)
            : t == 'UR'
              ? ctx.arc(s.x + c, s.y, c, Math.PI, -Math.PI / 2, !1)
              : t == 'DU'
                ? ((y = { x: s.x, y: s.y + c }),
                  p(),
                  ctx.lineTo(s.x, s.y + c),
                  ctx.arc(s.x + r, s.y + c, r, Math.PI, 0, !0),
                  ctx.lineTo(s.x + 2 * r, s.y))
                : t == 'DL'
                  ? ctx.arc(s.x - c, s.y, c, 0, Math.PI / 2, !1)
                  : t == 'DR'
                    ? ctx.arc(s.x + c, s.y, c, Math.PI, Math.PI / 2, !0)
                    : t == 'LU'
                      ? ctx.arc(s.x, s.y - c, c, Math.PI / 2, Math.PI, !1)
                      : t == 'LD'
                        ? ctx.arc(s.x, s.y + c, c, -Math.PI / 2, Math.PI, !0)
                        : t == 'LR'
                          ? ((y = { x: s.x - c, y: s.y }),
                            p(),
                            ctx.lineTo(s.x - c, s.y),
                            ctx.arc(s.x - c, s.y + r, r, -Math.PI / 2, Math.PI / 2, !0),
                            ctx.lineTo(s.x, s.y + 2 * r))
                          : t == 'RU'
                            ? ctx.arc(s.x, s.y - c, c, Math.PI / 2, 0, !0)
                            : t == 'RD'
                              ? ctx.arc(s.x, s.y + c, c, -Math.PI / 2, 0, !1)
                              : t == 'RL'
                                ? ((y = { x: s.x + c, y: s.y }),
                                  p(),
                                  ctx.lineTo(s.x + c, s.y),
                                  ctx.arc(s.x + c, s.y + r, r, -Math.PI / 2, Math.PI / 2, !1),
                                  ctx.lineTo(s.x, s.y + 2 * r))
                                : (h(t[0]), h(t[1])),
        t == 'UD'
          ? (y = { x: s.x + 2 * r, y: s.y + a })
          : t == 'UL'
            ? (y = { x: s.x - c, y: s.y - c })
            : t == 'UR'
              ? (y = { x: s.x + c + a, y: s.y - c })
              : t == 'DU'
                ? (y = { x: s.x + 2 * r, y: s.y })
                : t == 'DL'
                  ? (y = { x: s.x - c, y: s.y + c })
                  : t == 'DR'
                    ? (y = { x: s.x + c + a, y: s.y + c })
                    : t == 'LU'
                      ? (y = { x: s.x - c, y: s.y - c })
                      : t == 'LD'
                        ? (y = { x: s.x - c, y: s.y + c + a })
                        : t == 'LR'
                          ? (y = { x: s.x + a, y: s.y + 2 * r })
                          : t == 'RU'
                            ? (y = { x: s.x + c, y: s.y - c })
                            : t == 'RD'
                              ? (y = { x: s.x + c, y: s.y + c + a })
                              : t == 'RL' && (y = { x: s.x, y: s.y + 2 * r }),
        p();
    };
    var p = function () {
      y.x > l.x && (l.x = y.x),
        y.y > l.y && (l.y = y.y),
        y.x < g.x && (g.x = y.x),
        y.y < g.y && (g.y = y.y);
    };
    for (ctx.beginPath(), h(t[0]), i = 0; i < t.length - 1; i++) u(t[i] + t[i + 1]);
    h(t[t.length - 1]), ctx.stroke();
    const d = (l.x + g.x) / 2;
    const M = (l.y + g.y) / 2;
    const m = (l.x - g.x + c) / e;
    const P = (l.y - g.y + c) / x;
    const T = m < P ? P : m;
    for (
      c /= T,
        a /= T,
        (r /= T) > 6 && (r = 6),
        y = { x: 0, y: 0 },
        ctx.clearRect(0, 0, n.width, n.height),
        ctx.save(),
        ctx.translate(e / 2 - d / T, x / 2 - M / T),
        ctx.beginPath(),
        h(t[0]),
        i = 0;
      i < t.length - 1;
      i++
    )
      u(t[i] + t[i + 1]);
    return (
      h(t[t.length - 1]),
      ctx.stroke(),
      (ctx.fillStyle = `rgba(${f.trailColor.r},${f.trailColor.g},${f.trailColor.b},${
        f.trailColor.a
      })`),
      ctx.beginPath(),
      t[t.length - 1] == 'U'
        ? (ctx.moveTo(y.x - 5, y.y + 2), ctx.lineTo(y.x + 5, y.y + 2), ctx.lineTo(y.x, y.y - 3))
        : t[t.length - 1] == 'D'
          ? (ctx.moveTo(y.x - 5, y.y - 2), ctx.lineTo(y.x + 5, y.y - 2), ctx.lineTo(y.x, y.y + 3))
          : t[t.length - 1] == 'L'
            ? (ctx.moveTo(y.x + 2, y.y - 5), ctx.lineTo(y.x + 2, y.y + 5), ctx.lineTo(y.x - 3, y.y))
            : t[t.length - 1] == 'R'
              ? (ctx.moveTo(y.x - 2, y.y - 5),
                ctx.lineTo(y.x - 2, y.y + 5),
                ctx.lineTo(y.x + 3, y.y))
              : t[t.length - 1] == '1'
                ? (ctx.moveTo(y.x - 2, y.y - 6),
                  ctx.lineTo(y.x + 6, y.y + 2),
                  ctx.lineTo(y.x - 2, y.y + 2))
                : t[t.length - 1] == '3'
                  ? (ctx.moveTo(y.x + 2, y.y - 6),
                    ctx.lineTo(y.x - 6, y.y + 2),
                    ctx.lineTo(y.x + 2, y.y + 2))
                  : t[t.length - 1] == '7'
                    ? (ctx.moveTo(y.x - 2, y.y + 6),
                      ctx.lineTo(y.x + 6, y.y - 2),
                      ctx.lineTo(y.x - 2, y.y - 2))
                    : t[t.length - 1] == '9' &&
                      (ctx.moveTo(y.x + 2, y.y + 6),
                      ctx.lineTo(y.x - 6, y.y - 2),
                      ctx.lineTo(y.x + 2, y.y - 2)),
      ctx.closePath(),
      ctx.fill(),
      ctx.restore(),
      n
    );
  };
  var a = function (t, e) {
    const x = t[1] == 'L' ? 0 : t[1] == 'M' ? 1 : 2;
    const o = t[2] == 'L' ? 0 : t[2] == 'M' ? 1 : 2;
    return $('<div>')
      .css({ width: `${e - 2}px`, padding: '5px 1px' })
      .append(
        $('<div>')
          .text(chrome.i18n.getMessage(`gesture_${t}`))
          .css({
            'font-size': `${14 * Math.sqrt(e / 100)}px`,
            color: '#111',
            'text-align': 'center',
            'font-weight': 'bold',
          }),
      )
      .append(
        $('<div>')
          .text(
            chrome.i18n.getMessage('gesture_rocker_descrip', [
              chrome.i18n.getMessage(`options_mousebutton_${x}`),
              chrome.i18n.getMessage(`options_mousebutton_${o}`),
            ]),
          )
          .css({
            'font-size': `${12 * Math.sqrt(e / 100)}px`,
            color: '#666',
            'text-align': 'center',
          }),
      );
  };
  var s = function (t, e) {
    return $('<div>')
      .css({ width: `${e - 2}px`, padding: '5px 1px' })
      .append(
        $('<div>')
          .text(chrome.i18n.getMessage(`gesture_${t}`))
          .css({
            'font-size': `${14 * Math.sqrt(e / 100)}px`,
            color: '#111',
            'text-align': 'center',
            'font-weight': 'bold',
          }),
      )
      .append(
        $('<div>')
          .text(chrome.i18n.getMessage(`gesture_${t}_descrip`))
          .css({
            'font-size': `${12 * Math.sqrt(e / 100)}px`,
            color: '#666',
            'text-align': 'center',
          }),
      );
  };
  const n = {
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
  };
  var y = function (t, e) {
    return $('<div>')
      .css({ width: `${e - 2}px`, padding: '5px 1px' })
      .append(
        $('<div>')
          .text(
            (t[1] == '1' ? 'Ctrl + ' : '') +
              (t[2] == '1' ? 'Alt + ' : '') +
              (t[3] == '1' ? 'Shift + ' : '') +
              (t[4] == '1' ? 'Meta + ' : '') +
              (function (t) {
                const e = (t = t.split(':'))[1];
                const x = t[2];
                if (!e || e == '') return 'empty';
                if (e.substr(0, 2) != 'U+') return e;
                const o = n[x];
                return o || JSON.parse(`"\\u${e.substr(2)}"`);
              })(t),
          )
          .css({
            'font-size': `${14 * Math.sqrt(e / 100)}px`,
            color: '#666',
            'text-align': 'center',
            'font-weight': 'bold',
          }),
      );
  };
})();
