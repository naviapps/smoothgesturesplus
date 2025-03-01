const e = {};
for (a in console) {
  e[a] = console[a];
}
if ('update_url' in chrome.runtime.getManifest()) for (a in console) console[a] = () => {};
const A = chrome.runtime.getManifest().short_name !== 'Smooth Gestures Plus';
const B =
  'update_url' in chrome.runtime.getManifest()
    ? 'kdcjmllhmhnnadianfhhnoefgcdbpdap'
    : (chrome.runtime.id, 'ijgdgeacmjiigjjepffiijkleklaapfl');
let settings = {};
if (A) {
  chrome.extension.sendMessage(B, { storage: true }, (e) => {
    if (e && e.gestures && e.validGestures) {
      settings = e;
      l();
    }
  });
} else {
  chrome.storage.local.get(null, (items) => {
    settings = items;
    l();
  });
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local') {
      for (key in changes) {
        settings[key] = changes[key].newValue;
      }
    }
  });
}
chrome.runtime.onMessage.addListener((e, t, n) => {
  e.ping && n({ pong: true });
});

const SmoothGestures = function () {
  /*
   * Local Variables
   */
  const _this = this;
  _this.callback = null;
  const n =
    Math.floor(Math.random() * 2 ** 30).toString(32) +
    Math.floor(Math.random() * 2 ** 30).toString(32);
  _this.isId = (e) => {
    return n == e;
  };

  let enabled = !(_this.postMessage = (e, t) => {
    n == e && port && port.postMessage(t);
  });
  var port = null;
  let canvas: HTMLCanvasElement = null;
  let htmlclear = null;

  // gesture states
  const gesture = {};

  // button syncing between tabs
  let syncButtons = false;

  // mouse event states
  let buttonDown: { [button: number]: boolean } = {};
  let blockClick: { [button: number]: boolean } = {};
  let blockContext: boolean = true;
  let forceContext: boolean = false;
  // key mod down states
  let keyMod: string = '0000';
  let keyEscape: boolean = false;
  // focus state
  let focus: EventTarget | null = null;

  _this.connect = () => {
    const e = {
      name: JSON.stringify({
        name: 'smoothgestures.tab',
        frame: !window.parent,
        id: n,
        url: window.location.href,
      }),
    };
    if (window.SGextId) {
      port = chrome.runtime.connect(window.SGextId, e);
    }
    port = A ? chrome.runtime.connect(B, e) : chrome.runtime.connect(e);
    if (!port) {
      return;
    }
    port.onMessage.addListener(receiveMessage);
    port.onDisconnect.addListener(_this.disable);
  };

  const receiveMessage = (mess) => {
    if ('enable' in mess) {
      if (mess.enable) {
        enable();
      } else {
        _this.disable();
      }
    }
    if (mess.disable) {
      _this.disable();
    }
    if (mess.action) {
      localAction(mess.action);
    }
    if (mess.windowBlurred) {
      buttonDown = {};
      blockClick = {};
      blockContext = true;
      endGesture();
    }
    if (mess.chain) {
      startGesture(
        mess.chain.startPoint,
        mess.chain.startPoint
          ? document.elementFromPoint(mess.chain.startPoint.x, mess.chain.startPoint.y)
          : null,
        mess.chain.line,
        mess.chain.rocker,
        mess.chain.wheel,
      );
      blockContext = true;
      if (mess.chain.buttonDown) {
        if (mess.chain.buttonDown[0]) {
          blockClick[0] = true;
        }
        if (mess.chain.buttonDown[1]) {
          blockClick[1] = true;
        }
        if (mess.chain.buttonDown[2]) {
          blockClick[2] = true;
        }
        if (buttonDown[0] == null) {
          buttonDown[0] = mess.chain.buttonDown[0];
        }
        if (buttonDown[1] == null) {
          buttonDown[1] = mess.chain.buttonDown[1];
        }
        if (buttonDown[2] == null) {
          buttonDown[2] = mess.chain.buttonDown[2];
        }
      }
    }
    if (mess.syncButton) {
      buttonDown[mess.syncButton.id] = mess.syncButton.down;
    }
  };

  const localAction = (e) => {
    if (e.id === 'page-back-close') {
      const t = window.location.href;
      window.history.back();
      if (!e.has_history) {
        setTimeout(() => {
          if (t === window.location.href) {
            port.postMessage({ closetab: true });
          }
        }, 400);
      }
    } else if (e.id === 'stop') {
      window.stop();
    } else if (e.id === 'print') {
      window.print();
    } else if (e.id === 'goto-top') {
      let n = e.startPoint
        ? document.elementFromPoint(e.startPoint.x, e.startPoint.y)
        : document.documentElement;
      while (
        n !== document.documentElement &&
        n.parentNode &&
        (n.scrollHeight <= n.clientHeight ||
          n.scrollTop == 0 ||
          ['auto', 'scroll'].indexOf(document.defaultView.getComputedStyle(n)['overflow-y']) === -1)
      ) {
        n = n.parentNode;
      }
      if (n === document.documentElement) {
        document.body.scrollTop = 0;
      }
      n.scrollTop = 0;
    } else if (e.id === 'goto-bottom') {
      let n = e.startPoint
        ? document.elementFromPoint(e.startPoint.x, e.startPoint.y)
        : document.documentElement;
      while (
        n !== document.documentElement &&
        n.parentNode &&
        (n.scrollHeight <= n.clientHeight ||
          n.scrollTop == n.scrollHeight - n.clientHeight ||
          ['auto', 'scroll'].indexOf(document.defaultView.getComputedStyle(n)['overflow-y']) === -1)
      ) {
        n = n.parentNode;
      }
      if (n === document.documentElement) {
        document.body.scrollTop = document.body.scrollHeight;
      }
      n.scrollTop = n.scrollHeight;
    } else if (e.id === 'page-up') {
      let n = e.startPoint
        ? document.elementFromPoint(e.startPoint.x, e.startPoint.y)
        : document.documentElement;
      while (
        n !== document.documentElement &&
        n.parentNode &&
        (n.scrollHeight <= n.clientHeight ||
          n.scrollTop == 0 ||
          ['auto', 'scroll'].indexOf(document.defaultView.getComputedStyle(n)['overflow-y']) === -1)
      ) {
        n = n.parentNode;
      }
      if (n === document.documentElement) {
        document.body.scrollTop -=
          0.8 * Math.min(document.documentElement.clientHeight, document.body.clientHeight);
      }
      n.scrollTop -= 0.8 * Math.min(document.documentElement.clientHeight, n.clientHeight);
    } else if (e.id === 'page-down') {
      let n = e.startPoint
        ? document.elementFromPoint(e.startPoint.x, e.startPoint.y)
        : document.documentElement;
      while (
        n !== document.documentElement &&
        n.parentNode &&
        (n.scrollHeight <= n.clientHeight ||
          n.scrollTop == n.scrollHeight - n.clientHeight ||
          ['auto', 'scroll'].indexOf(document.defaultView.getComputedStyle(n)['overflow-y']) === -1)
      ) {
        n = n.parentNode;
      }
      console.log(
        'scroll',
        n,
        n.scrollTop,
        document.body.scrollTop,
        document.documentElement.clientHeight,
        document.body.clientHeight,
        n.clientHeight,
      );
      if (n === document.documentElement) {
        document.body.scrollTop +=
          0.8 * Math.min(document.documentElement.clientHeight, document.body.clientHeight);
      }
      console.log('scroll2', n.scrollTop, document.body.scrollTop);
      n.scrollTop += 0.8 * Math.min(document.documentElement.clientHeight, n.clientHeight);
      console.log('scroll3', n.scrollTop, document.body.scrollTop);
    } else if (e.id === 'zoom-in-hack') {
      const o = document.body.style.zoom ? 1.1 * document.body.style.zoom : 1.1;
      document.body.style.zoom = o;
      canvas.style.zoom = 1 / o;
    } else if (e.id === 'zoom-out-hack') {
      const o = document.body.style.zoom ? document.body.style.zoom / 1.1 : 1 / 1.1;
      document.body.style.zoom = o;
      canvas.style.zoom = 1 / o;
    } else if (e.id === 'zoom-zero-hack') {
      document.body.style.zoom = '1';
      canvas.style.zoom = '1';
    } else if (e.id === 'zoom-img-in') {
      for (let i = 0; i < e.images.length; i += 1) {
        const l = $(`img[gestureid='${e.images[i].gestureid}']`);
        if (!l.attr('origsize')) {
          l.attr('origsize', `${l.width()}x${l.height()}`);
        }
        l.css({ width: 1.2 * l.width(), height: 1.2 * l.height() });
      }
    } else if (e.id === 'zoom-img-out') {
      for (let i = 0; i < e.images.length; i += 1) {
        const l = $(`img[gestureid='${e.images[i].gestureid}']`);
        if (!l.attr('origsize')) {
          l.attr('origsize', `${l.width()}x${l.height()}`);
        }
        l.css({ width: l.width() / 1.2, height: l.height() / 1.2 });
      }
    } else if (e.id === 'zoom-img-zero') {
      for (let i = 0; i < e.images.length; i += 1) {
        const l = $(`img[gestureid='${e.images[i].gestureid}']`);
        if (!l.attr('origsize')) {
          return;
        }
        const r = l.attr('origsize').split('x');
        l.css({ width: `${r[0]}px`, height: `${r[1]}px` });
      }
    } else if (e.id === 'hide-image') {
      for (let i = 0; i < e.images.length; i += 1) {
        $(`img[gestureid='${e.images[i].gestureid}']`).css({ display: 'none' });
      }
    }
  };

  const handleMouseDown = (event: MouseEvent): void => {
    blockClick[event.button] = false;
    blockContext = event.button !== 2;

    // block scrollbars
    if (
      event.target &&
      event.target instanceof HTMLElement &&
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
      if (event.button === 2) {
        endGesture();
        return;
      }
      forceContext = false;
    }

    moveGesture(event);
    if (
      gesture.rocker &&
      (buttonDown[0] ? 1 : 0) + (buttonDown[1] ? 1 : 0) + (buttonDown[2] ? 1 : 0) === 2
    ) {
      let first;
      let second;
      if (buttonDown[0]) {
        if (event.button === 0) {
          second = 'L';
        } else {
          first = 'L';
        }
      }
      if (buttonDown[1]) {
        if (event.button === 1) {
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
      if (
        _this.callback ||
        (settings.validGestures.r[first] && settings.validGestures.r[first][second])
      ) {
        syncButtons = {
          timeout: setTimeout(() => {
            syncButtons = false;
          }, 500),
        };
        sendGesture(`r${first}${second}`);

        window.getSelection()?.removeAllRanges();
        blockContext = true;
        blockClick[0] = true;
        blockClick[1] = true;
        blockClick[2] = true;
        event.preventDefault();
        event.stopPropagation();
        return;
      }
    }

    if (settings.contextOnLink && event.button === 2 && getLink(event.target)) {
      return;
    }
    if (
      settings.holdButton === 0 &&
      event.button === 0 &&
      event.target instanceof HTMLSelectElement
    ) {
      return;
    }
    if (
      settings.holdButton === 0 &&
      (keyMod[0] !== '0' || keyMod[1] !== '0' || keyMod[2] !== '0' || keyEscape)
    ) {
      return; // allow selection
    }
    if (
      settings.holdButton === 0 &&
      event.button === 0 &&
      event.target instanceof HTMLImageElement
    ) {
      event.preventDefault();
    }
    // if windows and middle-clicked and (middle-click rocker set or options page is setting a gesture) then block autoscrolling with middle
    if (
      event.button === 1 &&
      (settings.validGestures.r.M || window.SG.callback) &&
      navigator.platform.indexOf('Win') !== -1
    ) {
      event.preventDefault();
    }

    startGesture(
      { x: event.clientX, y: event.clientY },
      event.target,
      event.button === settings.holdButton,
      (buttonDown[0] ? 1 : 0) + (buttonDown[1] ? 1 : 0) + (buttonDown[2] ? 1 : 0) === 1 &&
        (_this.callback ||
          (settings.validGestures.r &&
            ((buttonDown[0] && settings.validGestures.r.L) ||
              (buttonDown[1] && settings.validGestures.r.M) ||
              (buttonDown[2] && settings.validGestures.r.R)))),
      event.button === settings.holdButton && (_this.callback || settings.validGestures.w),
    );
  };

  const handleMouseUp = async (event: MouseEvent): Promise<void> => {
    if (event.button === settings.holdButton) {
      if (gesture.line) {
        moveGesture(event, true);
      }
      if (gesture.line && gesture.line.code !== '') {
        await sendGesture(gesture.line.code);
        event.preventDefault();
        if (event.button === 0) {
          window.getSelection()?.removeAllRanges();
        }
        if (event.button === 2) {
          blockContext = true;
        }
        blockClick[event.button] = true;
      }
    }
    gesture.line = null;
    gesture.wheel = null;

    if (event.button !== 2) {
      blockContext = true;
    }
    if (
      event.button === 2 &&
      !forceContext &&
      !blockContext &&
      !buttonDown[0] &&
      !buttonDown[1] &&
      navigator.platform.indexOf('Win') === -1
    ) {
      forceContext = true;
      setTimeout(() => {
        forceContext = false;
      }, 600);
      const t = { x: event.screenX, y: event.screenY };
      if (
        navigator.userAgent.match(/linux/i) &&
        (event.screenX < window.screenLeft + Math.round(event.clientX * window.devicePixelRatio) ||
          (window.screenLeft === 0 &&
            event.screenY <
              55 + window.screenTop + Math.round(event.clientY * window.devicePixelRatio)))
      ) {
        t.x += window.screenLeft;
        t.y += window.screenTop;
      }
      console.log('SEND NATIVE', t);
      await port.postMessage({ nativeport: { rightclick: t } });
    }

    if (blockClick[event.button]) {
      event.preventDefault();
    }
    buttonDown[event.button] = false;
    if (syncButtons) {
      await port.postMessage({ syncButton: { id: event.button, down: false } });
    }

    if (!buttonDown[0] && !buttonDown[2]) {
      gesture.rocker = null;
    }
    if (!gesture.rocker) {
      endGesture();
    }
  };

  const handleDragEnd = (): void => {
    buttonDown = {};
  };

  const handleClick = (event: MouseEvent): void => {
    if (blockClick[event.button]) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  const handleContextMenu = (event: MouseEvent): void => {
    if (
      (blockContext || (buttonDown[2] && (gesture.line || gesture.rocker || gesture.wheel))) &&
      !forceContext
    ) {
      event.preventDefault();
      event.stopPropagation();
      blockContext = false;
    } else {
      endGesture();
      buttonDown = {};
    }
  };

  const handleSelectStart = (): void => {
    if (
      settings.holdButton === 0 &&
      keyMod[0] === '0' &&
      keyMod[1] === '0' &&
      keyMod[2] === '0' &&
      !keyEscape
    ) {
      window.getSelection()?.removeAllRanges();
    }
  };

  const canvasResize = (): void => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };

  const handleKeyDown = async (event: KeyboardEvent): Promise<void> => {
    if (event.keyCode === 27) {
      endGesture();
      keyEscape = true;
      const handleKeyUp = () => {
        keyEscape = false;
        window.removeEventListener('keyup', handleKeyUp, true);
      };
      window.addEventListener('keyup', handleKeyUp, true);
    }
    let mod =
      (event.ctrlKey ? '1' : '0') +
      (event.altKey ? '1' : '0') +
      (event.shiftKey ? '1' : '0') +
      (event.metaKey ? '1' : '0');
    if (
      event.keyCode === 16 ||
      event.keyCode === 17 ||
      event.keyCode === 18 ||
      event.keyCode === 0 ||
      event.keyCode === 91 ||
      event.keyCode === 92 ||
      event.keyCode === 93
    ) {
      const i =
        event.keyCode === 16 ? 2 : event.keyCode === 17 ? 0 : event.keyCode === 18 ? 1 : null;
      if (i !== null) {
        mod = `${mod.substr(0, i)}1${mod.substr(i + 1)}`;
        const handleKeyUp = () => {
          keyMod = `${keyMod.substr(0, i)}0${keyMod.substr(i + 1)}`;
          window.removeEventListener('keyup', handleKeyUp, true);
        };
        window.addEventListener('keyup', handleKeyUp, true);
      }
      keyMod = mod;
    } else if (
      _this.callback ||
      ((mod !== '0000' ||
        focus === null ||
        (!(focus instanceof HTMLInputElement) && !(focus instanceof HTMLTextAreaElement))) &&
        settings.validGestures.k &&
        settings.validGestures.k[mod] &&
        settings.validGestures.k[mod].indexOf(`${event.keyIdentifier}:${event.keyCode}`) >= 0)
    ) {
      startGesture(null, null);
      await sendGesture(`k${mod}:${event.keyIdentifier}:${event.keyCode}`);
      event.preventDefault();
      event.stopPropagation();
    }
  };

  const handleFocus = (event: FocusEvent) => {
    if (event.target instanceof EventTarget) {
      focus = event.target;
    }
  };

  const handleBlur = (event: FocusEvent) => {
    if (event.target instanceof EventTarget) {
      focus = null;
    }
  };

  /*
   * Start/End Gestures
   */
  const startGesture = (
    point,
    target,
    line: boolean = false,
    rocker: boolean = false,
    wheel: boolean = false,
  ) => {
    endGesture();
    if (!gesture.events) {
      window.addEventListener('mousemove', moveGesture, true);
      window.addEventListener('mousewheel', wheelGesture, true);
      gesture.events = true;
    }
    if (window.location.hostname === 'mail.google.com') {
      const elem = document.body.children[1];
      const domListen = () => {
        endGesture();
        elem.removeEventListener('DOMSubtreeModified', domListen, true);
      };
      elem.addEventListener('DOMSubtreeModified', domListen, true);
    }
    gesture.startPoint = point ? { x: point.x, y: point.y } : null;
    gesture.targets = target ? [target] : [];
    const a = window.getSelection();
    gesture.selection = a.toString();
    gesture.ranges = [];
    for (let i = 0; i < a.rangeCount; i += 1) {
      gesture.ranges.push(a.getRangeAt(i));
    }
    gesture.timeout = null;

    gesture.line =
      line && point
        ? {
            code: '',
            points: [{ x: point.x, y: point.y }],
            dirPoints: [{ x: point.x, y: point.y }],
            possibleDirs: settings.validGestures,
            distance: 0,
          }
        : null;
    gesture.rocker = rocker;
    gesture.wheel = wheel;

    if (
      document.documentElement.offsetHeight < document.documentElement.scrollHeight &&
      (gesture.line || gesture.wheel) &&
      !htmlclear.parentNode
    ) {
      document.body.appendChild(htmlclear);
    }
  };

  const moveGesture = (event: MouseEvent | WheelEvent, diagonal: boolean): void => {
    if (!gesture.startPoint) {
      gesture.startPoint = { x: event.clientX, y: event.clientY };
    }

    if (
      (gesture.rocker || gesture.wheel) &&
      (Math.abs(event.clientX - gesture.startPoint.x) > 0 ||
        Math.abs(event.clientY - gesture.startPoint.y) > 2)
    ) {
      gesture.rocker = null;
      gesture.wheel = null;
    }

    if (gesture.line) {
      const next = { x: event.clientX, y: event.clientY };
      const prev = gesture.line.points[gesture.line.points.length - 1];
      gesture.line.points.push(next);
      gesture.line.distance += Math.sqrt((next.x - prev.x) ** 2 + (next.y - prev.y) ** 2);

      const diffx = next.x - gesture.line.dirPoints[gesture.line.dirPoints.length - 1].x;
      const diffy = next.y - gesture.line.dirPoints[gesture.line.dirPoints.length - 1].y;

      if (!settings.trailBlock && canvas.getContext) {
        refreshLineAsync();
        if (!canvas.parentNode && (Math.abs(diffx) > 10 || Math.abs(diffy) > 10)) {
          document.body.appendChild(canvas);
        }
      }

      const ldir = gesture.line.code === '' ? 'X' : gesture.line.code.substr(-1, 1);
      const ndir = C(gesture.line.dirPoints[gesture.line.dirPoints.length - 1], next);
      if (ndir === ldir) {
        gesture.line.dirPoints[gesture.line.dirPoints.length - 1] = next;
      } else if (
        (Math.abs(diffx) > 25 || Math.abs(diffy) > 25) &&
        (diagonal || ndir.match(/^[RLUD]$/))
      ) {
        if (gesture.line.possibleDirs) {
          gesture.line.possibleDirs = gesture.line.possibleDirs[ndir];
        }
        if (gesture.line.possibleDirs || _this.callback) {
          gesture.line.code += ndir;
          gesture.line.dirPoints.push(next);
        } else {
          endGesture();
          blockContext = true;
        }
      }
    }
  };

  const C = (e, t): string => {
    const n = t.x - e.x;
    const o = t.y - e.y;
    if (Math.abs(n) > 2 * Math.abs(o)) {
      return n > 0 ? 'R' : 'L';
    }
    if (Math.abs(o) > 2 * Math.abs(n)) {
      return o > 0 ? 'D' : 'U';
    }
    if (o < 0) {
      return n > 0 ? '9' : '7';
    }
    return n > 0 ? '3' : '1';
  };

  const wheelGesture = async (event: WheelEvent): Promise<void> => {
    if (event.target instanceof HTMLIFrameElement) {
      endGesture();
    }
    moveGesture(event);
    if (!gesture.wheel || event.wheelDelta === 0) {
      return;
    }
    const dir = event.wheelDelta > 0 ? 'U' : 'D';
    if (_this.callback || settings.validGestures.w[dir]) {
      syncButtons = {
        timeout: setTimeout(() => {
          syncButtons = false;
        }, 500),
      };
      await sendGesture(`w${dir}`);
      if (settings.holdButton === 2) {
        blockContext = true;
      }
      if (settings.holdButton === 0) {
        window.getSelection()?.removeAllRanges();
      }
      blockClick[settings.holdButton] = true;
      event.preventDefault();
      event.stopPropagation();
    }
  };

  const sendGesture = async (code: string): Promise<void> => {
    if (code) {
      if (_this.callback) {
        _this.callback(code);
        _this.callback = null;
      } else {
        const message = {
          gesture: code,
          startPoint: gesture.startPoint,
          targets: [],
          links: [],
          images: [],
          selection: gesture.selection,
        };
        if (gesture.line && code[0] !== 'w' && code[0] !== 'r') {
          message.line = { distance: gesture.line.distance, segments: code.length };
        }
        if (settings.selectToLink && gesture.selection) {
          const parts = gesture.selection.split('http');
          for (let i = 1; i < parts.length; i += 1) {
            const link = `http${parts[i]}`.split(/[\s"']/)[0];
            if (link.match(/\/\/.+\..+/)) {
              message.links.push({ src: link });
            }
          }
        }
        for (let i = 0; i < gesture.targets.length; i += 1) {
          const gestureid = Math.floor(Math.random() * 2 ** 30).toString(32);
          gesture.targets[i].setAttribute('gestureid', gestureid);

          message.targets.push({ gestureid });
          const link = getLink(gesture.targets[i]);
          if (link) {
            message.links.push({ src: link, gestureid });
          }
          if (gesture.targets[i] instanceof HTMLImageElement) {
            message.images.push({ src: gesture.targets[i].src, gestureid });
          }
        }
        if (syncButtons) {
          message.buttonDown = buttonDown;
        }
        await port.postMessage(message);
      }
    }
    if (code[0] === 'w') {
      gesture.line = null;
      gesture.rocker = null;
    } else if (code[0] === 'r') {
      gesture.line = null;
      gesture.wheel = null;
    } else {
      if (gesture.ranges && gesture.ranges.length > 0) {
        const l = window.getSelection();
        l.removeAllRanges();
        for (let i = 0; i < gesture.ranges.length; i += 1) {
          l.addRange(gesture.ranges[i]);
        }
      }
      endGesture();
    }
  };

  const endGesture = (): void => {
    if (gesture.events) {
      window.removeEventListener('mousemove', moveGesture, true);
      window.removeEventListener('mousewheel', wheelGesture, true);
      gesture.events = false;
    }

    if (canvas.parentNode) {
      canvas.parentNode.removeChild(canvas);
    }
    if (canvas.getContext) {
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    }

    if (htmlclear.parentNode) {
      htmlclear.parentNode.removeChild(htmlclear);
    }

    clearTimeout(gesture.timeout);
    gesture.timeout = null;

    gesture.selection = null;
    gesture.ranges = null;
    gesture.line = null;
    gesture.rocker = null;
    gesture.wheel = null;
  };

  /*
   * Helpers
   */
  const getLink = (elem) => {
    while (elem) {
      if (elem.href) {
        return elem.href;
      }
      elem = elem.parentNode;
    }
    return null;
  };

  const refreshLineAsync: { (): void; timeout: number } = () => {
    if (!refreshLineAsync.timeout) {
      const e = Date.now() - refreshLine.lasttime;
      const t = Math.min(500, 4 * refreshLine.runtime);
      if (t < e) {
        refreshLine();
      } else {
        refreshLineAsync.timeout = setTimeout(() => {
          refreshLine();
          refreshLineAsync.timeout = null;
        }, t - e);
      }
    }
  };

  const refreshLine: { (): void; lasttime: number; runtime: number } = () => {
    if (!canvas.getContext) {
      return;
    }
    const now = Date.now();
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (gesture.line) {
      ctx.strokeStyle = `rgba(${settings.trailColor.r},${settings.trailColor.g},${settings.trailColor.b},${settings.trailColor.a})`;
      ctx.lineWidth = settings.trailWidth;
      ctx.lineCap = 'butt';
      ctx.lineJoin = 'round';
      ctx.shadowBlur = settings.trailWidth;
      ctx.shadowColor = 'rgba(255,255,255,.3)';
      if (settings.trailLegacy) {
        ctx.beginPath();
        ctx.moveTo(gesture.line.points[0].x, gesture.line.points[0].y);
        for (let i = 1; i < gesture.line.points.length; i += 1) {
          ctx.lineTo(gesture.line.points[i].x, gesture.line.points[i].y);
        }
        ctx.stroke();
      } else {
        let nDirPoint = { x: gesture.line.dirPoints[0].x, y: gesture.line.dirPoints[0].y };
        const oPoint = gesture.line.points[gesture.line.points.length - 1];
        const iDirPoint = gesture.line.dirPoints[gesture.line.dirPoints.length - 1];
        const lDir = C(iDirPoint, oPoint);
        ctx.beginPath();
        if (gesture.line.code.length > 0) {
          if (gesture.line.code[0] === 'L' || gesture.line.code[0] === 'R') {
            nDirPoint.y = gesture.line.dirPoints[1].y;
          } else {
            nDirPoint.x = gesture.line.dirPoints[1].x;
          }
        }
        ctx.moveTo(nDirPoint.x, nDirPoint.y);
        for (let r = 1; r < gesture.line.code.length; r += 1) {
          const prevDir = gesture.line.code[r - 1];
          const currDir = gesture.line.code[r];
          const currDirPoint = gesture.line.dirPoints[r];
          const nextDirPoint = gesture.line.dirPoints[r + 1];
          let u: number;
          if (prevDir === 'L' || prevDir === 'R') {
            if (currDir === 'L' || currDir === 'R') {
              u = Math.min(
                Math.abs(currDirPoint.x - nDirPoint.x),
                Math.abs(nextDirPoint.y - nDirPoint.y) / 2,
              );
              ctx.arcTo(currDirPoint.x, nDirPoint.y, currDirPoint.x, nextDirPoint.y, u);
              u = Math.min(
                Math.abs(nextDirPoint.x - currDirPoint.x),
                Math.abs(nextDirPoint.y - nDirPoint.y) - u,
              );
              ctx.arcTo(currDirPoint.x, nextDirPoint.y, nextDirPoint.x, nextDirPoint.y, u);
              nDirPoint.x = (currDirPoint.x + nextDirPoint.x) / 2;
              nDirPoint.y = nextDirPoint.y;
              ctx.lineTo(nDirPoint.x, nDirPoint.y);
            } else {
              let { y } = nextDirPoint;
              if (gesture.line.code[r + 1] === 'L' || gesture.line.code[r + 1] === 'R') {
                y = gesture.line.dirPoints[r + 2].y;
              }
              u = Math.min(Math.abs(nextDirPoint.x - nDirPoint.x), Math.abs(y - nDirPoint.y) / 2);
              ctx.arcTo(nextDirPoint.x, nDirPoint.y, nextDirPoint.x, nextDirPoint.y, 0.8 * u);
              nDirPoint.x = nextDirPoint.x;
              nDirPoint.y = (nDirPoint.y + y) / 2;
              ctx.lineTo(nDirPoint.x, nDirPoint.y);
            }
          } else if (currDir === 'L' || currDir === 'R') {
            let { x } = nextDirPoint;
            if (gesture.line.code[r + 1] === 'U' || gesture.line.code[r + 1] === 'D') {
              x = gesture.line.dirPoints[r + 2].x;
            }
            u = Math.min(Math.abs(x - nDirPoint.x) / 2, Math.abs(nextDirPoint.y - nDirPoint.y));
            ctx.arcTo(nDirPoint.x, nextDirPoint.y, nextDirPoint.x, nextDirPoint.y, 0.8 * u);
            nDirPoint.x = (nDirPoint.x + x) / 2;
            nDirPoint.y = nextDirPoint.y;
            ctx.lineTo(nDirPoint.x, nDirPoint.y);
          } else {
            u = Math.min(
              Math.abs(nextDirPoint.x - nDirPoint.x) / 2,
              Math.abs(currDirPoint.y - nDirPoint.y),
            );
            ctx.arcTo(nDirPoint.x, currDirPoint.y, nextDirPoint.x, currDirPoint.y, u);
            u = Math.min(
              Math.abs(nextDirPoint.x - nDirPoint.x) - u,
              Math.abs(nextDirPoint.y - currDirPoint.y),
            );
            ctx.arcTo(nextDirPoint.x, currDirPoint.y, nextDirPoint.x, nextDirPoint.y, u);
            nDirPoint.x = nextDirPoint.x;
            nDirPoint.y = (currDirPoint.y + nextDirPoint.y) / 2;
            ctx.lineTo(nDirPoint.x, nDirPoint.y);
          }
        }
        if (gesture.line.code.length > 0) {
          nDirPoint = gesture.line.dirPoints[gesture.line.dirPoints.length - 1];
          ctx.lineTo(nDirPoint.x, nDirPoint.y);
        }
        ctx.stroke();
        if ((gesture.line.possibleDirs && gesture.line.possibleDirs[lDir]) || _this.callback) {
          if (lDir === '3' || lDir === '7') {
            ctx.lineTo(
              (nDirPoint.x - nDirPoint.y + oPoint.x + oPoint.y) / 2,
              (-nDirPoint.x + nDirPoint.y + oPoint.x + oPoint.y) / 2,
            );
          } else if (lDir === '1' || lDir === '9') {
            ctx.lineTo(
              (nDirPoint.x + nDirPoint.y + oPoint.x - oPoint.y) / 2,
              (nDirPoint.x + nDirPoint.y - oPoint.x + oPoint.y) / 2,
            );
          }
          ctx.stroke();
        }
      }
      refreshLine.lasttime = Date.now();
      refreshLine.runtime = 0.9 * (refreshLine.runtime || 10) + 0.1 * (refreshLine.lasttime - now);
    }
  };

  /*
   * Enable/Disable
   */
  const init = () => {
    if (window.location.hostname === 'smoothgesturesplus.com') {
      const script = document.createElement('script');
      script.innerText = `window.sgp = ${JSON.stringify({
        license: settings.license,
        clid: settings.id,
        firstinstalled: settings.firstinstalled,
      })}; if(window.setSGP) window.setSGP();`;
      document.head.appendChild(script);
    }
    window.addEventListener('focus', handleFocus, true);
    window.addEventListener('blur', handleBlur, true);

    _this.connect();

    canvas = document.createElement('canvas');
    if (canvas.style) {
      canvas.style.position = 'fixed';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.zIndex = '999999999';
      canvas.style.background = 'transparent';
      canvas.style.margin = '0';
      canvas.style.padding = '0';
    }
    canvasResize();

    htmlclear = document.createElement('div');
    htmlclear.style.clear = 'both';
  };

  const enable = (): void => {
    if (enabled) return;
    enabled = true;

    window.addEventListener('mousedown', handleMouseDown, true);
    window.addEventListener('mouseup', handleMouseUp, true);
    window.addEventListener('dragend', handleDragEnd, true);
    window.addEventListener('click', handleClick, true);
    window.addEventListener('contextmenu', handleContextMenu, true);
    window.addEventListener('selectstart', handleSelectStart, true);
    window.addEventListener('resize', canvasResize, true);
    window.addEventListener('keydown', handleKeyDown, true);
  };

  _this.disable = (): void => {
    if (!enabled) return;
    enabled = false;

    window.removeEventListener('mousedown', handleMouseDown, true);
    window.removeEventListener('mouseup', handleMouseUp, true);
    window.removeEventListener('dragend', handleDragEnd, true);
    window.removeEventListener('click', handleClick, true);
    window.removeEventListener('contextmenu', handleContextMenu, true);
    window.removeEventListener('selectstart', handleSelectStart, true);
    window.removeEventListener('resize', canvasResize, true);
    window.removeEventListener('keydown', handleKeyDown, true);

    port.onMessage.removeListener(receiveMessage);
    port.onDisconnect.removeListener(_this.disable);
  };

  _this.enabled = (): boolean => {
    return enabled;
  };

  init();
};

if (window.SGinjectscript && window.SGinjectscript.constructor === HTMLScriptElement) {
  const match = window.SGinjectscript.src.match(/([^a-p]|^)([a-p]{32})([^a-p]|$)/);
  if (match) {
    window.SGextId = match[2];
  }
  const scripts = document.querySelectorAll('script[src^=chrome-extension\\:\\/\\/]');
  for (let i = 0; i < scripts.length; i += 1) {
    scripts[i].parentNode.removeChild(scripts[i]);
  }
}

const l = () => {
  if (window.SG) {
    if (!window.SG.enabled()) {
      window.SG.connect();
    }
  } else {
    window.SG = new SmoothGestures();
  }
};
