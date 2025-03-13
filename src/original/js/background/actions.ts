export type Actions = {
  //
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
  'open-screenshot-full': () => Promise<void>;
  'save-screenshot-full': () => Promise<void>;
  'clone-tab': undefined;
  //
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

  const U = async (tab, call) => {
    await browser.tabs.update(tab.id, { active: true });
    const results = await browser.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const ssfo = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return {
          top: document.body.scrollTop,
          left: document.body.scrollLeft,
          height: document.body.scrollHeight,
          width: document.body.scrollWidth,
          screenh: window.innerHeight,
          screenw: window.innerWidth,
          overflow: ssfo,
        };
      },
    });
    type Ssf = {
      top: number;
      left: number;
      height: number;
      width: number;
      screenh: number;
      screenw: number;
      overflow: string;
    };
    const ssf = results[0]?.result as Ssf | undefined;
    if (!ssf) {
      return;
    }
    const canvas = document.createElement('canvas');
    canvas.height = Math.min(ssf.height, 32768);
    canvas.width = Math.min(ssf.width, 32768);
    const img = document.createElement('img');
    const ctx = canvas.getContext('2d');
    let hNum = 0;
    let wNum = 0;
    const captureTab = async () => {
      await browser.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          window.scrollTo(hNum * ssf.screenh, wNum * ssf.screenw);
        },
      });
      setTimeout(async () => {
        const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' });
        img.src = dataUrl;
      }, 80);
    };
    img.addEventListener('load', async () => {
      ctx.drawImage(
        img,
        0,
        0,
        img.width,
        img.height,
        Math.min(wNum * img.width, ssf.width - ssf.screenw),
        Math.min(hNum * img.height, ssf.height - ssf.screenh),
        img.width,
        img.height,
      );
      if (hNum + 1 < canvas.height / ssf.screenh) {
        hNum += 1;
        await captureTab();
      } else if (wNum + 1 < canvas.width / ssf.screenw) {
        hNum = 0;
        wNum += 1;
        await captureTab();
      } else {
        await browser.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            document.body.scrollTop = ssf.top;
            document.body.scrollLeft = ssf.left;
            document.body.style.overflow = ssf.overflow;
          },
        });
        call(S(canvas.toDataURL()));
      }
    });
    captureTab();
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

  return {
    //
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
    'open-screenshot-full': openScreenshotFull,
    'save-screenshot-full': saveScreenshotFull,
    'clone-tab': undefined,
  };
};
