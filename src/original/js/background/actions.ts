import browser from 'webextension-polyfill';

export type Actions = {
  //
  'close-window': undefined;
  'split-tabs': undefined;
  'merge-tabs': () => Promise<void>;
  options: undefined;
  'page-back-close': undefined;
  'goto-top': undefined;
  'goto-bottom': undefined;
  'page-up': undefined;
  'page-down': undefined;
  'page-next': undefined;
  'page-prev': undefined;
  'fullscreen-window': undefined;
  'minimize-window': undefined;
  'maximize-window': undefined;
  'open-screenshot': undefined;
  'save-screenshot': undefined;
  'open-screenshot-full': undefined;
  'save-screenshot-full': undefined;
  'clone-tab': undefined;
  'zoom-in': undefined;
  'zoom-out': undefined;
  'zoom-zero': undefined;
  'zoom-img-in': undefined;
  'zoom-img-out': undefined;
  'zoom-img-zero': undefined;
  'tab-to-left': undefined;
  'tab-to-right': undefined;
  'parent-dir': undefined;
  'open-history': undefined;
  'open-downloads': undefined;
  'open-extensions': undefined;
  'open-bookmarks': undefined;
  'open-image': undefined;
  'save-image': undefined;
  'hide-image': undefined;
  'show-cookies': undefined;
  'search-sel': undefined;
  print: undefined;
  'toggle-pin': undefined;
  pin: undefined;
  unpin: undefined;
  copy: undefined;
  'copy-link': undefined;
  'find-prev': () => Promise<void>;
  'find-next': () => Promise<void>;
  'toggle-bookmark': undefined;
  bookmark: undefined;
  unbookmark: undefined;
};

type Message = {
  startPoint?: unknown;
  links?: [
    {
      src?: string;
    },
  ];
  images?: [
    {
      src: string;
    },
  ];
  selection?: unknown;
};

export const createActions = (
  message: Message,
  sender: browser.Runtime.MessageSender,
  sendResponse: (response: unknown) => void,
): Actions => {
  // TODO
  const mergeTabs = async () => {
    if (!sender.tab || !sender.tab.windowId) {
      return;
    }
    const currWin = await browser.windows.get(sender.tab.windowId);
    if (!currWin.tabs) {
      return;
    }
    //
    const t = [];
    for (const n in b) {
      if (b[n].focused > 0) {
        t.push([n, b[n]]);
      }
    }
    if (!(t.length < 2)) {
      t.sort((e, t) => {
        return t.focused < e.focused ? 1 : e.focused < t.focused ? -1 : 0;
      });
      const o = parseInt(t[t.length - 2][0]);
      if (o) {
        for (let i = 0; i < tabs.length; i += 1) {
          await browser.tabs.move(tabs[i].id, { windowId: o, index: 1000000 });
        }
        await browser.tabs.update(sender.tab.id, { active: true });
        await browser.windows.update(o, { focused: true });
      }
    }
  };

  const D = (e, t) => {
    const n = URL.createObjectURL(e);
    T(n, t);
    URL.revokeObjectURL(n);
  };

  const T = (e, t) => {
    const n = document.createElement('a');
    n.href = e;
    n.download = t || 'download';
    const o = document.createEvent('MouseEvents');
    o.initMouseEvent(
      'click',
      true,
      false,
      window,
      0,
      0,
      0,
      0,
      0,
      false,
      false,
      false,
      false,
      0,
      null,
    );
    n.dispatchEvent(o);
  };

  const U = (c, l) => {
    chrome.tabs.update(c.id, { active: true }, () => {
      chrome.tabs.executeScript(
        c.id,
        {
          code: 'var ssfo=document.body.style.overflow;document.body.style.overflow="hidden";var ssf={top:document.body.scrollTop,left:document.body.scrollLeft,height:document.body.scrollHeight,width:document.body.scrollWidth,screenh:window.innerHeight,screenw:window.innerWidth,overflow:ssfo};ssf;',
        },
        (e) => {
          const t = e[0];
          const n = document.createElement('canvas');
          n.height = Math.min(t.height, 32768);
          n.width = Math.min(t.width, 32768);
          const o = document.createElement('img');
          const i = n.getContext('2d');
          let a = 0;
          let r = 0;
          const s = () => {
            chrome.tabs.executeScript(
              c.id,
              {
                code: `document.body.scrollTop=${a * t.screenh};document.body.scrollLeft=${
                  r * t.screenw
                };`,
              },
              () => {
                setTimeout(() => {
                  chrome.tabs.captureVisibleTab(c.windowId, { format: 'png' }, (e) => {
                    o.src = e;
                  });
                }, 80);
              },
            );
          };
          o.addEventListener('load', () => {
            i.drawImage(
              o,
              0,
              0,
              o.width,
              o.height,
              Math.min(r * o.width, t.width - t.screenw),
              Math.min(a * o.height, t.height - t.screenh),
              o.width,
              o.height,
            );
            if (a + 1 < n.height / t.screenh) {
              a += 1;
              s();
            } else if (r + 1 < n.width / t.screenw) {
              a = 0;
              r += 1;
              s();
            } else {
              chrome.tabs.executeScript(
                c.id,
                {
                  code: `document.body.scrollTop=${t.top};document.body.scrollLeft=${t.left};document.body.style.overflow="${t.overflow}"`,
                },
                () => {
                  l(S(n.toDataURL()));
                },
              );
            }
          });
          s();
        },
      );
    });
  };

  const S = (e) => {
    const t = e.indexOf(',');
    const n = e.substr(0, t).match(/^data:([^;]+)(;.*)?$/);
    let o = e.substr(t + 1);
    if (n[2] === ';base64') {
      o = ((e) => {
        const t = atob(e);
        const n = new Array(t.length);
        for (let o = 0; o < t.length; o += 1) {
          n[o] = t.charCodeAt(o);
        }
        return new Uint8Array(n);
      })(o);
    }
    return new Blob([o], { type: n[1] });
  };

  // TODO
  const openScreenshotFull = async () => {
    U(sender.tab, (e) => {
      browser.tabs.create({ url: URL.createObjectURL(e) });
    });
  };

  // TODO
  const saveScreenshotFull = async () => {
    U(sender.tab, (e) => {
      D(e, `screenshot${sender.url ? `-${new URL(sender.url).hostname}` : ''}.png`);
    });
  };

  const findPrev = async () => {
    if (!sender.tab || !sender.tab.id || !message.selection) {
      return;
    }
    sendResponse({ action: { id: 'find-prev', selection: message.selection } });
  };

  const findNext = async () => {
    if (!sender.tab || !sender.tab.id || !message.selection) {
      return;
    }
    sendResponse({ action: { id: 'find-next', selection: message.selection } });
  };

  return {
    //
    'close-window': undefined,
    'split-tabs': undefined,
    'merge-tabs': mergeTabs,
    options: undefined,
    'page-back-close': undefined,
    'goto-top': undefined,
    'goto-bottom': undefined,
    'page-up': undefined,
    'page-down': undefined,
    'page-next': undefined,
    'page-prev': undefined,
    'fullscreen-window': undefined,
    'minimize-window': undefined,
    'maximize-window': undefined,
    'open-screenshot': undefined,
    'save-screenshot': undefined,
    'open-screenshot-full': undefined,
    'save-screenshot-full': undefined,
    'clone-tab': undefined,
    'zoom-in': undefined,
    'zoom-out': undefined,
    'zoom-zero': undefined,
    'zoom-img-in': undefined,
    'zoom-img-out': undefined,
    'zoom-img-zero': undefined,
    'tab-to-left': undefined,
    'tab-to-right': undefined,
    'parent-dir': undefined,
    'open-history': undefined,
    'open-downloads': undefined,
    'open-extensions': undefined,
    'open-bookmarks': undefined,
    'open-image': undefined,
    'save-image': undefined,
    'hide-image': undefined,
    'show-cookies': undefined,
    'search-sel': undefined,
    print: undefined,
    'toggle-pin': undefined,
    pin: undefined,
    unpin: undefined,
    copy: undefined,
    'copy-link': undefined,
    'find-prev': findPrev,
    'find-next': findNext,
    'toggle-bookmark': undefined,
    bookmark: undefined,
    unbookmark: undefined,
  };
};
