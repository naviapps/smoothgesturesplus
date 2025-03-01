const showCookies = async () => {
  O(
    id,
    "window.alert('Cookies stored by this host or domain:\\n'+('\\n'+document.cookie).replace(/; /g,';\\n').replace(/\\n(.{192})([^\\n]{5})/gm,\"\\n$1\\n        $2\").replace(/\\n(.{100})([^\\n]{5})/gm,\"\\n$1\\n        $2\"));",
    call,
  );
};

// TODO
const copy = async () => {
  if (!message.selection) return call();
  const o = document.createElement('textarea');
  o.value = message.selection;
  document.body.appendChild(o);
  o.select();
  document.execCommand('Copy');
  document.body.removeChild(o);
};

// TODO
const copyLink = async () => {
  if (message.links.length == 0) return call();
  const o = document.createElement('textarea');
  o.value = message.links[0].src;
  document.body.appendChild(o);
  o.select();
  document.execCommand('Copy');
  document.body.removeChild(o);
  call();
};

const pageNext = async () => {
  O(
    id,
    () => {
      let e = null;
      if ((e = document.querySelector('link[rel=next][href]'))) window.location.href = e.href;
      else if ((e = document.querySelector('a[rel=next][href]'))) window.location.href = e.href;
      else {
        e = document.querySelectorAll('a[href]');
        for (var t = 0; t < e.length; t += 1)
          if (e[t].innerText.match(/(next|下一页|下页)/i))
            return void (window.location.href = e[t].href);
        e = document.querySelectorAll('a[href]');
        for (t = 0; t < e.length; t += 1)
          if (e[t].innerText.match(/(>|›)/i)) return void (window.location.href = e[t].href);
      }
    },
    call,
  );
};

// TODO
const pagePrev = async () => {
  O(
    id,
    () => {
      let e = null;
      if ((e = document.querySelector('link[rel=prev][href]'))) window.location.href = e.href;
      else if ((e = document.querySelector('a[rel=prev][href]'))) window.location.href = e.href;
      else {
        e = document.querySelectorAll('a[href]');
        for (var t = 0; t < e.length; t += 1)
          if (e[t].innerText.match(/(prev|上一页|上页)/i))
            return void (window.location.href = e[t].href);
        e = document.querySelectorAll('a[href]');
        for (t = 0; t < e.length; t += 1)
          if (e[t].innerText.match(/(<|‹)/i)) return void (window.location.href = e[t].href);
      }
    },
    call,
  );
};

// TODO
const findPrev = async () => {
  if (!message.selection) return call();
  O(
    id,
    `window.find('${message.selection.replace(
      /[\\"']/g,
      '\\$&',
    )}', false, true, true, false, true, true);`,
    call,
  );
};

// TODO
const findNext = async () => {
  if (!message.selection) return call();
  O(
    id,
    `window.find('${message.selection.replace(
      /[\\"']/g,
      '\\$&',
    )}', false, false, true, false, true, true);`,
    call,
  );
};

if (e.id === 'stop') {
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
