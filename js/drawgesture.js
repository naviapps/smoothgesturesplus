!(function () {
  if ('update_url' in chrome.runtime.getManifest()) {
    console.log = function () {};
    console.error = function () {};
  }
  var settings = {};
  chrome.storage.local.get(null, function (t) {
    settings = t;
  });
  chrome.storage.onChanged.addListener(function (t, e) {
    if (e === 'local') {
      for (let key in t) {
        settings[key] = t[key].newValue;
      }
    }
  });

  window.drawGesture = function (gesture, width, height, lineWidth) {
    var context = '';
    if (gesture[0] === 's') {
      context = 's';
      gesture = gesture.substr(1);
    } else if (gesture[0] === 'l') {
      context = 'l';
      gesture = gesture.substr(1);
    } else if (gesture[0] === 'i') {
      context = 'i';
      gesture = gesture.substr(1);
    }

    let c;
    if (gesture[0] === 'r') {
      c = drawRocker(gesture, width);
    } else if (gesture[0] === 'w') {
      c = drawWheel(gesture, width);
    } else if (gesture[0] === 'k') {
      c = drawKey(gesture, width);
    } else {
      c = drawLine(gesture, width, height, lineWidth);
    }
    $(c).css({ 'min-height': '2em', overflow: 'hidden' });

    let mess = null;
    if (context === 's') {
      mess = '* ' + chrome.i18n.getMessage('context_with_selection');
    } else if (context === 'l') {
      mess = '* ' + chrome.i18n.getMessage('context_on_link');
    } else if (context === 'i') {
      mess = '* ' + chrome.i18n.getMessage('context_on_image');
    } else if (settings.gestures['s' + gesture]) {
      mess = '* ' + chrome.i18n.getMessage('context_not_selection');
    } else if (
      settings.gestures['l' + gesture] &&
      settings.gestures['i' + gesture]
    ) {
      mess = '* ' + chrome.i18n.getMessage('context_not_links_images');
    } else if (settings.gestures['l' + gesture]) {
      mess = '* ' + chrome.i18n.getMessage('context_not_link');
    } else if (settings.gestures['i' + gesture]) {
      mess = '* ' + chrome.i18n.getMessage('context_not_image');
    }

    if (!mess) {
      return c;
    } else {
      $('<div>')
        .css({
          width: width + 'px',
          overflow: 'hidden',
        })
        .append(
          $('<div>')
            .css({
              'font-size': 12 * Math.sqrt(width / 100) + 'px',
              color: '#888',
              'text-align': 'right',
              'margin-right': '.3em',
              height: '0px',
              position: 'relative',
              top: '.1em',
            })
            .text(mess),
        )
        .append(c);
    }
  };
  var drawLine = function (gesture, width, height, lineWidth) {
    var c = document.createElement('canvas');
    c.width = width;
    c.height = height;
    var ctx = c.getContext('2d');
    ctx.strokeStyle =
      'rgba(' +
      settings.trailColor.r +
      ',' +
      settings.trailColor.g +
      ',' +
      settings.trailColor.b +
      ',' +
      settings.trailColor.a +
      ')';
    ctx.lineWidth = lineWidth || 3;
    ctx.lineCap = 'butt';
    var step = 10;
    var tight = 2;
    var sep = 3;

    var prev = { x: 0, y: 0 };
    var curr = { x: 0, y: 0 };
    var max = { x: 0, y: 0 };
    var min = { x: 0, y: 0 };

    var tip = function (dir) {
      prev = curr;
      ctx.lineTo(prev.x, prev.y);
      if (dir === 'U') {
        curr = { x: prev.x, y: prev.y - step * 0.75 };
      } else if (dir === 'D') {
        curr = { x: prev.x, y: prev.y + step * 0.75 };
      } else if (dir === 'L') {
        curr = { x: prev.x - step * 0.75, y: prev.y };
      } else if (dir === 'R') {
        curr = { x: prev.x + step * 0.75, y: prev.y };
      } else if (dir === '1') {
        curr = { x: prev.x - step * 0.5, y: prev.y + step * 0.5 };
      } else if (dir === '3') {
        curr = { x: prev.x + step * 0.5, y: prev.y + step * 0.5 };
      } else if (dir === '7') {
        curr = { x: prev.x - step * 0.5, y: prev.y - step * 0.5 };
      } else if (dir === '9') {
        curr = { x: prev.x + step * 0.5, y: prev.y - step * 0.5 };
      }
      ctx.lineTo(curr.x, curr.y);
      minmax();
    };
    var curve = function (dir) {
      prev = curr;
      ctx.lineTo(prev.x, prev.y);
      if (dir === 'UD') {
        curr = { x: prev.x, y: prev.y - step };
        minmax();
        ctx.lineTo(prev.x, prev.y - step);
        ctx.arc(prev.x + tight, prev.y - step, tight, Math.PI, 0, false);
        ctx.lineTo(prev.x + 2 * tight, prev.y);
      } else if (dir === 'UL') {
        ctx.arc(prev.x - step, prev.y, step, 0, -Math.PI / 2, true);
      } else if (dir === 'UR') {
        ctx.arc(prev.x + step, prev.y, step, Math.PI, -Math.PI / 2, false);
      } else if (dir === 'DU') {
        curr = { x: prev.x, y: prev.y + step };
        minmax();
        ctx.lineTo(prev.x, prev.y + step);
        ctx.arc(prev.x + tight, prev.y + step, tight, Math.PI, 0, true);
        ctx.lineTo(prev.x + 2 * tight, prev.y);
      } else if (dir === 'DL') {
        ctx.arc(prev.x - step, prev.y, step, 0, Math.PI / 2, false);
      } else if (dir === 'DR') {
        ctx.arc(prev.x + step, prev.y, step, Math.PI, Math.PI / 2, true);
      } else if (dir === 'LU') {
        ctx.arc(prev.x, prev.y - step, step, Math.PI / 2, Math.PI, false);
      } else if (dir === 'LD') {
        ctx.arc(prev.x, prev.y + step, step, -Math.PI / 2, Math.PI, true);
      } else if (dir === 'LR') {
        curr = { x: prev.x - step, y: prev.y };
        minmax();
        ctx.lineTo(prev.x - step, prev.y);
        ctx.arc(
          prev.x - step,
          prev.y + tight,
          tight,
          -Math.PI / 2,
          Math.PI / 2,
          true,
        );
        ctx.lineTo(prev.x, prev.y + 2 * tight);
      } else if (dir === 'RU') {
        ctx.arc(prev.x, prev.y - step, step, Math.PI / 2, 0, true);
      } else if (dir === 'RD') {
        ctx.arc(prev.x, prev.y + step, step, -Math.PI / 2, 0, false);
      } else if (dir === 'RL') {
        curr = { x: prev.x + step, y: prev.y };
        minmax();
        ctx.lineTo(prev.x + step, prev.y);
        ctx.arc(
          prev.x + step,
          prev.y + tight,
          tight,
          -Math.PI / 2,
          Math.PI / 2,
          false,
        );
        ctx.lineTo(prev.x, prev.y + 2 * tight);
      } else {
        tip(dir[0]);
        tip(dir[1]);
      }
      if (dir === 'UD') {
        curr = { x: prev.x + 2 * tight, y: prev.y + sep };
      } else if (dir === 'UL') {
        curr = { x: prev.x - step, y: prev.y - step };
      } else if (dir === 'UR') {
        curr = { x: prev.x + step + sep, y: prev.y - step };
      } else if (dir === 'DU') {
        curr = { x: prev.x + 2 * tight, y: prev.y };
      } else if (dir === 'DL') {
        curr = { x: prev.x - step, y: prev.y + step };
      } else if (dir === 'DR') {
        curr = { x: prev.x + step + sep, y: prev.y + step };
      } else if (dir === 'LU') {
        curr = { x: prev.x - step, y: prev.y - step };
      } else if (dir === 'LD') {
        curr = { x: prev.x - step, y: prev.y + step + sep };
      } else if (dir === 'LR') {
        curr = { x: prev.x + sep, y: prev.y + 2 * tight };
      } else if (dir === 'RU') {
        curr = { x: prev.x + step, y: prev.y - step };
      } else if (dir === 'RD') {
        curr = { x: prev.x + step, y: prev.y + step + sep };
      } else if (dir === 'RL') {
        curr = { x: prev.x, y: prev.y + 2 * tight };
      }
      minmax();
    };
    var minmax = function () {
      if (curr.x > max.x) max.x = curr.x;
      if (curr.y > max.y) max.y = curr.y;
      if (curr.x < min.x) min.x = curr.x;
      if (curr.y < min.y) min.y = curr.y;
    };

    ctx.beginPath();
    tip(gesture[0]);
    for (let i = 0; i < gesture.length - 1; i++) {
      curve(gesture[i] + gesture[i + 1]);
    }
    tip(gesture[gesture.length - 1]);
    ctx.stroke();

    var d = (max.x + min.x) / 2;
    var M = (max.y + min.y) / 2;
    var wr = (max.x - min.x + step) / width;
    var hr = (max.y - min.y + step) / height;
    var ratio = wr < hr ? hr : wr;
    step /= ratio;
    sep /= ratio;
    tight /= ratio;
    if (tight > 6) tight = 6;
    curr = { x: 0, y: 0 };

    ctx.clearRect(0, 0, c.width, c.height);
    ctx.save();
    ctx.translate(width / 2 - d / ratio, height / 2 - M / ratio);
    ctx.beginPath();
    tip(gesture[0]);
    for (let i = 0; i < gesture.length - 1; i++) {
      curve(gesture[i] + gesture[i + 1]);
    }
    tip(gesture[gesture.length - 1]);
    ctx.stroke();
    ctx.fillStyle =
      'rgba(' +
      settings.trailColor.r +
      ',' +
      settings.trailColor.g +
      ',' +
      settings.trailColor.b +
      ',' +
      settings.trailColor.a +
      ')';
    ctx.beginPath();
    if (gesture[gesture.length - 1] === 'U') {
      ctx.moveTo(curr.x - 5, curr.y + 2);
      ctx.lineTo(curr.x + 5, curr.y + 2);
      ctx.lineTo(curr.x, curr.y - 3);
    } else if (gesture[gesture.length - 1] === 'D') {
      ctx.moveTo(curr.x - 5, curr.y - 2);
      ctx.lineTo(curr.x + 5, curr.y - 2);
      ctx.lineTo(curr.x, curr.y + 3);
    } else if (gesture[gesture.length - 1] === 'L') {
      ctx.moveTo(curr.x + 2, curr.y - 5);
      ctx.lineTo(curr.x + 2, curr.y + 5);
      ctx.lineTo(curr.x - 3, curr.y);
    } else if (gesture[gesture.length - 1] === 'R') {
      ctx.moveTo(curr.x - 2, curr.y - 5);
      ctx.lineTo(curr.x - 2, curr.y + 5);
      ctx.lineTo(curr.x + 3, curr.y);
    } else if (gesture[gesture.length - 1] === '1') {
      ctx.moveTo(curr.x - 2, curr.y - 6);
      ctx.lineTo(curr.x + 6, curr.y + 2);
      ctx.lineTo(curr.x - 2, curr.y + 2);
    } else if (gesture[gesture.length - 1] === '3') {
      ctx.moveTo(curr.x + 2, curr.y - 6);
      ctx.lineTo(curr.x - 6, curr.y + 2);
      ctx.lineTo(curr.x + 2, curr.y + 2);
    } else if (gesture[gesture.length - 1] === '7') {
      ctx.moveTo(curr.x - 2, curr.y + 6);
      ctx.lineTo(curr.x + 6, curr.y - 2);
      ctx.lineTo(curr.x - 2, curr.y - 2);
    } else if (gesture[gesture.length - 1] === '9') {
      ctx.moveTo(curr.x + 2, curr.y + 6);
      ctx.lineTo(curr.x - 6, curr.y - 2);
      ctx.lineTo(curr.x + 2, curr.y - 2);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    return c;
  };
  var drawRocker = function (gesture, width) {
    var first = gesture[1] === 'L' ? 0 : gesture[1] === 'M' ? 1 : 2;
    var second = gesture[2] === 'L' ? 0 : gesture[2] === 'M' ? 1 : 2;
    return $('<div>')
      .css({
        width: width - 2 + 'px',
        padding: '5px 1px',
      })
      .append(
        $('<div>')
          .text(chrome.i18n.getMessage('gesture_' + gesture))
          .css({
            'font-size': 14 * Math.sqrt(width / 100) + 'px',
            color: '#111',
            'text-align': 'center',
            'font-weight': 'bold',
          }),
      )
      .append(
        $('<div>')
          .text(
            chrome.i18n.getMessage('gesture_rocker_descrip', [
              chrome.i18n.getMessage('options_mousebutton_' + first),
              chrome.i18n.getMessage('options_mousebutton_' + second),
            ]),
          )
          .css({
            'font-size': 12 * Math.sqrt(width / 100) + 'px',
            color: '#666',
            'text-align': 'center',
          }),
      );
  };
  var drawWheel = function (gesture, width) {
    return $('<div>')
      .css({
        width: width - 2 + 'px',
        padding: '5px 1px',
      })
      .append(
        $('<div>')
          .text(chrome.i18n.getMessage('gesture_' + gesture))
          .css({
            'font-size': 14 * Math.sqrt(width / 100) + 'px',
            color: '#111',
            'text-align': 'center',
            'font-weight': 'bold',
          }),
      )
      .append(
        $('<div>')
          .text(chrome.i18n.getMessage('gesture_' + gesture + '_descrip'))
          .css({
            'font-size': 12 * Math.sqrt(width / 100) + 'px',
            color: '#666',
            'text-align': 'center',
          }),
      );
  };
  var codeCharMap = {
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
  var codeButton = function (code) {
    code = code.split(':');
    var id = code[1];
    var key = code[2];
    if (!id || id == '') return 'empty';
    if (id.substr(0, 2) != 'U+') return id;
    var ch = codeCharMap[key];
    if (ch) return ch;
    return JSON.parse('"\\u' + id.substr(2) + '"');
  };
  var drawKey = function (gesture, width) {
    return $('<div>')
      .css({
        width: width - 2 + 'px',
        padding: '5px 1px',
      })
      .append(
        $('<div>')
          .text(
            (gesture[1] === '1' ? 'Ctrl + ' : '') +
              (gesture[2] === '1' ? 'Alt + ' : '') +
              (gesture[3] === '1' ? 'Shift + ' : '') +
              (gesture[4] === '1' ? 'Meta + ' : '') +
              codeButton(gesture),
          )
          .css({
            'font-size': 14 * Math.sqrt(width / 100) + 'px',
            color: '#666',
            'text-align': 'center',
            'font-weight': 'bold',
          }),
      );
  };
})();
