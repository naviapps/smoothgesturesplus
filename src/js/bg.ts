!(function (n) {
  const o = {};
  function i(e) {
    if (o[e]) return o[e].exports;
    const t = (o[e] = { i: e, l: !1, exports: {} });
    return n[e].call(t.exports, t, t.exports, i), (t.l = !0), t.exports;
  }
  (i.m = n),
    (i.c = o),
    (i.i = function (e) {
      return e;
    }),
    (i.d = function (e, t, n) {
      i.o(e, t) || Object.defineProperty(e, t, { configurable: !1, enumerable: !0, get: n });
    }),
    (i.n = function (e) {
      const t =
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
    i((i.s = 0));
})([
  function (e, t, n) {
    !(function () {
      const e = {};
      for (a in console) e[a] = console[a];
      if ('update_url' in chrome.runtime.getManifest())
        for (a in console) console[a] = function () {};
      let s = {};
      let r = {};
      const c = function (e, t) {
        const n = Date.now();
        for (key in e)
          (s[key] = e[key]),
            void 0 === e[key] && chrome.storage.local.remove(key),
            key.match(/\+ts$/) || (s[`${key}+ts`] = e[`${key}+ts`] = n);
        chrome.storage.local.set(e, t);
      };
      const l = { initcount: 2 };
      chrome.storage.local.get(null, function (e) {
        chrome.runtime.lastError
          ? (l.failed ||
              alert(
                "Google Chrome's storage may be corrupted. Extensions may not work properly.\n\nTry closing and restarting Chrome.\n\nIf that doesn't work, reinstall the browser to fix this problem.",
              ),
            (l.failed = !0),
            console.log('chrome.storage failure'),
            (s = JSON.parse(localStorage.local)))
          : ((s = e), (localStorage.local = JSON.stringify(e))),
          --l.initcount == 0 && l.init();
      }),
        chrome.storage.sync.get(null, function (e) {
          chrome.runtime.lastError
            ? (l.failed ||
                alert(
                  "Google Chrome's storage may be corrupted. Extensions may not work properly.\n\nTry closing and restarting Chrome.\n\nIf that doesn't work, reinstall the browser to fix this problem.",
                ),
              (l.failed = !0),
              console.log('chrome.storage failure'),
              (r = JSON.parse(localStorage.sync)))
            : ((r = e), (localStorage.sync = JSON.stringify(e))),
            --l.initcount == 0 && l.init();
        }),
        (l.changed = function (e, t) {
          if (t == 'local') {
            const n = {};
            for (key in (console.log('localchanged', e), e))
              (s[key] = e[key].newValue),
                r.sync && r.sync[key] && (r[key] = n[key] = e[key].newValue),
                console.log('syncsync', key, r.sync && r.sync[key], n);
            console.log('updatesync', Object.keys(n).length, n),
              Object.keys(n).length && chrome.storage.sync.set(n),
              l.localChanged(e);
          } else if (t == 'sync') {
            if (e.firstinstalled) {
              if (!e.firstinstalled.newValue) return void chrome.storage.sync.set(r);
              r.firstinstalled &&
                e.firstinstalled.newValue > e.firstinstalled.oldValue &&
                ((e.firstinstalled.newValue = e.firstinstalled.oldValue),
                chrome.storage.sync.set({ firstinstalled: e.firstinstalled.oldValue }));
            }
            const o = {};
            for (key in (console.log('syncchanged', e), e))
              (r[key] = e[key].newValue),
                r.sync && r.sync[key] && (s[key] = o[key] = e[key].newValue),
                console.log('synclocal', key, r.sync && r.sync[key], o);
            console.log('updatelocal', Object.keys(o).length, o),
              Object.keys(o).length && chrome.storage.local.set(o),
              l.syncChanged(e);
          }
        }),
        chrome.storage.onChanged.addListener(l.changed),
        (l.init = function () {
          for (key in (r.firstinstalled ||
            ((r.firstinstalled = Date.now()), (r.sync = { firstinstalled: !0 })),
          JSON.parse(k['Smooth Gestures'].settings)))
            r.sync[key] = !0;
          if (((r.sync.gestures = !0), (r.sync.customactions = !0), !s.installed)) {
            (s.installed = Date.now()),
              (s.id =
                Math.floor(Math.random() * 2 ** 30).toString(32) +
                Math.floor(Math.random() * 2 ** 30).toString(32)),
              (s.log = { action: {} }),
              (s.gestures = JSON.parse(k['Smooth Gestures'].gestures));
            const e = JSON.parse(k['Smooth Gestures'].settings);
            for (key in e) s[key] = e[key];
            (s.customactions = {
              custom000000: {
                title: 'Navigate to Google (example)',
                descrip: 'Go to Google',
                code: 'location.href = "http://www.google.com/"',
                env: 'page',
                share: !1,
                context: '',
              },
            }),
              (s.externalactions = {}),
              setTimeout(function () {
                chrome.tabs.create({ url: 'options.html' });
              }, 1e3);
          }
          for (key in (r.firstinstalled > s.installed && (r.firstinstalled = s.installed), r.sync))
            r.sync[key] && void 0 !== r[key] && (r[`${key}+ts`] || 0) >= (s[`${key}+ts`] || 0)
              ? ((s[key] = r[key]), (s[`${key}+ts`] = r[`${key}+ts`] || Date.now()))
              : r.sync[key] &&
                void 0 !== s[key] &&
                (s[`${key}+ts`] || 0) >= (r[`${key}+ts`] || 0) &&
                ((r[key] = s[key]), (r[`${key}+ts`] = s[`${key}+ts`] || Date.now()));
          if (
            ((s.version = chrome.runtime.getManifest().version),
            (s.started = Date.now()),
            (s.session =
              Math.floor(Math.random() * 2 ** 30).toString(32) +
              Math.floor(Math.random() * 2 ** 30).toString(32)),
            (o = s.license),
            s.forceInstallRightclick)
          ) {
            const t = screen.availHeight / 2 - 320 / 1.5;
            const n = screen.availWidth / 2 - 375;
            window.open('rightclick.html', 'rightclick', `width=750,height=320,top=${t},left=${n}`);
          }
          chrome.storage.sync.set(r, function () {
            chrome.storage.local.set(s, F);
          });
        }),
        (l.localChanged = function (e) {
          e.gestures && A(),
            e.license_expires &&
              e.license_expires.oldValue < Date.now() &&
              !e.license_expires.newValue &&
              c({ license_showexpired: !0 }),
            s.license != o
              ? c({ license: o })
              : e.license &&
                void 0 !== e.license.oldValue &&
                c(
                  {
                    license_showactivated: !!o,
                    license_showdeactivated: !o && !s.license_showexpired,
                  },
                  function () {},
                ),
            e.version &&
              s.version == '2.8.1' &&
              e.version.oldValue &&
              e.version.oldValue != '2.8.1' &&
              c({ showNoteUpdated: !0 }, function () {
                chrome.tabs.create({ url: chrome.runtime.getURL('/options.html#changelog') });
              });
        }),
        (l.syncChanged = function () {});
      navigator.platform.indexOf('Win');
      const d = navigator.platform.indexOf('Mac') != -1;
      const u = navigator.platform.indexOf('Linux') != -1;
      let m = null;
      const h = {};
      const f = { active: null, prevActive: null, closed: [], tab: {} };
      const b = {};
      let w = null;
      let p = null;
      var o = null;
      let v = Date.now() / 1e3 > 1745208e3;
      var k = { 'Smooth Gestures': {} };
      (k['Smooth Gestures'].settings = JSON.stringify({
        holdButton: 2,
        contextOnLink: !1,
        newTabUrl: 'chrome://newtab/',
        newTabRight: !1,
        newTabLinkRight: !0,
        trailColor: { r: 255, g: 0, b: 0, a: 1 },
        trailWidth: 2,
        trailBlock: !1,
        blacklist: [],
        selectToLink: !0,
      })),
        (k['Smooth Gestures'].gestures = JSON.stringify({
          U: 'new-tab',
          lU: 'new-tab-link',
          D: 'toggle-pin',
          L: 'page-back',
          rRL: 'page-back',
          R: 'page-forward',
          rLR: 'page-forward',
          UL: 'prev-tab',
          UR: 'next-tab',
          wU: 'goto-top',
          wD: 'goto-bottom',
          DR: 'close-tab',
          LU: 'undo-close',
          DU: 'clone-tab',
          lDU: 'new-tab-back',
          UD: 'reload-tab',
          UDU: 'reload-tab-full',
          URD: 'view-source',
          UDR: 'split-tabs',
          UDL: 'merge-tabs',
          LDR: 'show-cookies',
          RULD: 'fullscreen-window',
          DL: 'minimize-window',
          RU: 'maximize-window',
          RDLUR: 'options',
        })),
        (k.Opera = {}),
        (k.Opera.settings = JSON.stringify({})),
        (k.Opera.gestures = JSON.stringify({
          L: 'page-back',
          rRL: 'page-back',
          R: 'page-forward',
          rLR: 'page-forward',
          U: 'stop',
          UD: 'reload-tab',
          DR: 'close-tab',
          RLR: 'close-tab',
          D: 'new-tab',
          lD: 'new-tab-link',
          DU: 'clone-tab',
          lDU: 'new-tab-back',
          UL: 'parent-dir',
        })),
        (k['All-in-One Gestures'] = {}),
        (k['All-in-One Gestures'].settings = JSON.stringify({})),
        (k['All-in-One Gestures'].gestures = JSON.stringify({
          L: 'page-back',
          rRL: 'page-back',
          R: 'page-forward',
          rLR: 'page-forward',
          UD: 'reload-tab',
          UDU: 'reload-tab-full',
          LU: 'stop',
          U: 'new-tab',
          RLR: 'new-tab-link',
          DUD: 'clone-tab',
          UL: 'prev-tab',
          UR: 'next-tab',
          DR: 'close-tab',
          D: 'new-window',
          URD: 'view-source',
          LDR: 'show-cookies',
          DRD: 'options',
        })),
        (k.FireGestures = {}),
        (k.FireGestures.settings = JSON.stringify({})),
        (k.FireGestures.gestures = JSON.stringify({
          L: 'page-back',
          R: 'page-forward',
          UD: 'reload-tab',
          UDU: 'reload-tab-full',
          DRU: 'new-window',
          URD: 'close-window',
          LR: 'new-tab',
          DR: 'close-tab',
          RL: 'undo-close',
          UL: 'prev-tab',
          UR: 'next-tab',
          LU: 'goto-top',
          LD: 'goto-bottom',
          lU: 'new-tab-link',
          lD: 'new-tab-back',
          LDRUL: 'options',
          DU: 'parent-dir',
        }));
      const I = {
        'new-tab-link': 'l',
        'new-tab-back': 'l',
        'new-window-link': 'l',
        'copy-link': 'l',
        'zoom-img-in': 'i',
        'zoom-img-out': 'i',
        'zoom-img-zero': 'i',
        'open-image': 'i',
        'save-image': 'i',
        'hide-image': 'i',
        'search-sel': 's',
        copy: 's',
        'find-prev': 's',
        'find-next': 's',
      };
      const L = {
        'new-tab': function (e, n) {
          chrome.tabs.get(h[e].detail.tabId, function (e) {
            const t = { openerTabId: e.id, windowId: e.windowId };
            s.newTabUrl != 'homepage' && (t.url = s.newTabUrl),
              s.newTabRight && (t.index = e.index + 1),
              chrome.tabs.create(t, n);
          });
        },
        'new-tab-link': function (e, o, i) {
          chrome.tabs.get(h[e].detail.tabId, function (e) {
            for (let t = 0; t < i.links.length; t++) {
              const n = { openerTabId: e.id, windowId: e.windowId, url: i.links[t].src };
              s.newTabLinkRight && (n.index = e.index + 1 + t),
                chrome.tabs.create(n, t == i.links.length - 1 ? o : null);
            }
          });
        },
        'new-tab-back': function (e, o, i) {
          chrome.tabs.get(h[e].detail.tabId, function (e) {
            for (let t = 0; t < i.links.length; t++) {
              const n = {
                openerTabId: e.id,
                windowId: e.windowId,
                url: i.links[t].src,
                active: !1,
              };
              s.newTabLinkRight && (n.index = e.index + 1 + t),
                chrome.tabs.create(n, t == i.links.length - 1 ? o : null);
            }
          });
        },
        'navigate-tab': function (e, t) {
          chrome.tabs.update(
            h[e].detail.tabId,
            { url: s.newTabUrl != 'homepage' ? s.newTabUrl : void 0 },
            t,
          );
        },
        'close-tab': function (t, n) {
          chrome.tabs.get(h[t].detail.tabId, function (e) {
            e.pinned
              ? n()
              : s.closeLastBlock
                ? chrome.windows.getAll({ populate: !0 }, function (e) {
                    e.length == 1 && e[0].tabs.length == 1
                      ? chrome.tabs.update(
                          h[t].detail.tabId,
                          { url: s.newTabUrl != 'homepage' ? s.newTabUrl : void 0 },
                          n,
                        )
                      : chrome.tabs.remove(h[t].detail.tabId, n);
                  })
                : chrome.tabs.remove(h[t].detail.tabId, n);
          });
        },
        'close-other-tabs': function (e, n) {
          chrome.tabs.get(h[e].detail.tabId, function (t) {
            chrome.tabs.query({ windowId: t.windowId }, function (e) {
              for (i = 0; i < e.length; i++)
                e[i].id == t.id || e[i].pinned || chrome.tabs.remove(e[i].id);
              n();
            });
          });
        },
        'close-left-tabs': function (e, n) {
          chrome.tabs.get(h[e].detail.tabId, function (t) {
            chrome.tabs.query({ windowId: t.windowId }, function (e) {
              for (i = 0; i < e.length; i++)
                e[i].index < t.index && !t.pinned && chrome.tabs.remove(e[i].id);
              n();
            });
          });
        },
        'close-right-tabs': function (e, n) {
          chrome.tabs.get(h[e].detail.tabId, function (t) {
            chrome.tabs.query({ windowId: t.windowId }, function (e) {
              for (i = 0; i < e.length; i++)
                e[i].index > t.index && !t.pinned && chrome.tabs.remove(e[i].id);
              n();
            });
          });
        },
        'undo-close': function (e, t) {
          if (f.closed.length > 0) {
            const n = f.closed.pop();
            chrome.tabs.create(
              {
                url: n.history[n.history.length - 1],
                index: n.index,
                windowId: n.winId,
                active: !0,
              },
              t,
            );
          }
        },
        'reload-tab': function (e, t) {
          chrome.tabs.reload(h[e].detail.tabId, { bypassCache: !1 }, t);
        },
        'reload-tab-full': function (e, t) {
          chrome.tabs.reload(h[e].detail.tabId, { bypassCache: !0 }, t);
        },
        'reload-all-tabs': function (e, t) {
          chrome.tabs.get(h[e].detail.tabId, function (e) {
            chrome.tabs.query({ windowId: e.windowId }, function (e) {
              for (i = 0; i < e.length; i++) chrome.tabs.reload(e[i].id);
              t();
            });
          });
        },
        stop(e, t) {
          h[e].postMessage({ action: { id: 'stop' } }, t);
        },
        'view-source': function (t, n) {
          chrome.tabs.get(h[t].detail.tabId, function (e) {
            chrome.tabs.create(
              {
                url: `view-source:${h[t].detail.url ? h[t].detail.url : e.url}`,
                windowId: e.windowId,
                index: e.index + 1,
              },
              n,
            );
          });
        },
        'prev-tab': function (e, o) {
          chrome.tabs.get(h[e].detail.tabId, function (n) {
            chrome.tabs.query({ windowId: n.windowId }, function (e) {
              let t = null;
              for (i = e.length - 1; i >= 0; i--)
                if (((t = e[(n.index + i) % e.length].id), C(t)))
                  return void chrome.tabs.update(t, { active: !0 }, o);
              o();
            });
          });
        },
        'next-tab': function (e, o) {
          chrome.tabs.get(h[e].detail.tabId, function (n) {
            chrome.tabs.query({ windowId: n.windowId }, function (e) {
              let t = null;
              for (i = 1; i <= e.length; i++)
                if (((t = e[(n.index + i) % e.length].id), C(t)))
                  return void chrome.tabs.update(t, { active: !0 }, o);
              o();
            });
          });
        },
        'page-back': function (e, t) {
          h[e].postMessage({ action: { id: 'page-back' } }, t);
        },
        'page-forward': function (e, t) {
          h[e].postMessage({ action: { id: 'page-forward' } }, t);
        },
        'new-window': function (e, t) {
          chrome.windows.create({ url: s.newTabUrl != 'homepage' ? s.newTabUrl : void 0 }, t);
        },
        'new-window-link': function (e, t, n) {
          for (let o = 0; o < n.links.length; o++)
            chrome.windows.create({ url: n.links[o].src }, o == n.links.length - 1 ? t : null);
        },
        'close-window': function (e, t) {
          chrome.windows.getCurrent(function (e) {
            chrome.windows.remove(e.id, t);
          });
        },
        'split-tabs': function (e, t) {
          chrome.tabs.get(h[e].detail.tabId, function (n) {
            chrome.tabs.query({ windowId: n.windowId }, function (t) {
              chrome.windows.create(
                { tabId: n.id, focused: !0, incognito: n.incognito },
                function (e) {
                  for (i = n.index + 1; i < t.length; i++)
                    chrome.tabs.move(t[i].id, { windowId: e.id, index: i - n.index });
                },
              );
            });
          });
        },
        'merge-tabs': function (e, r) {
          chrome.tabs.get(h[e].detail.tabId, function (a) {
            chrome.tabs.query({ windowId: a.windowId }, function (e) {
              const t = [];
              for (const n in b) b[n].focused > 0 && t.push([n, b[n]]);
              if (!(t.length < 2)) {
                t.sort(function (e, t) {
                  return e.focused > t.focused ? 1 : e.focused < t.focused ? -1 : 0;
                });
                const o = parseInt(t[t.length - 2][0]);
                if (o) {
                  for (i = 0; i < e.length; i++)
                    chrome.tabs.move(e[i].id, { windowId: o, index: 1e6 });
                  chrome.tabs.update(a.id, { active: !0 }, function () {
                    chrome.windows.update(o, { focused: !0 }, r);
                  });
                }
              }
            });
          });
        },
        options(e, t) {
          chrome.tabs.get(h[e].detail.tabId, function (e) {
            chrome.tabs.create(
              { url: chrome.runtime.getURL('options.html'), windowId: e.windowId },
              t,
            );
          });
        },
        'page-back-close': function (e, t) {
          h[e].postMessage(
            {
              action: {
                id: 'page-back-close',
                has_history: f.tab[h[e].detail.tabId].history.length > 1,
              },
            },
            t,
          );
        },
        'goto-top': function (e, t, n) {
          h[e].postMessage({ action: { id: 'goto-top', startPoint: n.startPoint } }, t);
        },
        'goto-bottom': function (e, t, n) {
          h[e].postMessage({ action: { id: 'goto-bottom', startPoint: n.startPoint } }, t);
        },
        'page-up': function (e, t, n) {
          h[e].postMessage({ action: { id: 'page-up', startPoint: n.startPoint } }, t);
        },
        'page-down': function (e, t, n) {
          h[e].postMessage({ action: { id: 'page-down', startPoint: n.startPoint } }, t);
        },
        'page-next': function (e, t) {
          O(
            e,
            function () {
              let e = null;
              if ((e = document.querySelector('link[rel=next][href]'))) location.href = e.href;
              else if ((e = document.querySelector('a[rel=next][href]'))) location.href = e.href;
              else {
                e = document.querySelectorAll('a[href]');
                for (var t = 0; t < e.length; t++)
                  if (e[t].innerText.match(/(next|下一页|下页)/i))
                    return void (location.href = e[t].href);
                e = document.querySelectorAll('a[href]');
                for (t = 0; t < e.length; t++)
                  if (e[t].innerText.match(/(>|›)/i)) return void (location.href = e[t].href);
              }
            },
            t,
          );
        },
        'page-prev': function (e, t) {
          O(
            e,
            function () {
              let e = null;
              if ((e = document.querySelector('link[rel=prev][href]'))) location.href = e.href;
              else if ((e = document.querySelector('a[rel=prev][href]'))) location.href = e.href;
              else {
                e = document.querySelectorAll('a[href]');
                for (var t = 0; t < e.length; t++)
                  if (e[t].innerText.match(/(prev|上一页|上页)/i))
                    return void (location.href = e[t].href);
                e = document.querySelectorAll('a[href]');
                for (t = 0; t < e.length; t++)
                  if (e[t].innerText.match(/(<|‹)/i)) return void (location.href = e[t].href);
              }
            },
            t,
          );
        },
        'fullscreen-window': function (e, t) {
          chrome.tabs.get(h[e].detail.tabId, function (e) {
            chrome.windows.get(e.windowId, function (e) {
              b[e.id] || (b[e.id] = {}),
                chrome.windows.update(
                  e.id,
                  {
                    state: e.state != 'fullscreen' ? 'fullscreen' : b[e.id].prevstate || 'normal',
                  },
                  t,
                ),
                (b[e.id].prevstate = e.state);
            });
          });
        },
        'minimize-window': function (e, t) {
          chrome.tabs.get(h[e].detail.tabId, function (e) {
            chrome.windows.get(e.windowId, function (e) {
              b[e.id] || (b[e.id] = {}),
                chrome.windows.update(
                  e.id,
                  { state: e.state != 'minimized' ? 'minimized' : b[e.id].prevstate || 'normal' },
                  t,
                ),
                (b[e.id].prevstate = e.state);
            });
          });
        },
        'maximize-window': function (e, t) {
          chrome.tabs.get(h[e].detail.tabId, function (e) {
            chrome.windows.get(e.windowId, function (e) {
              b[e.id] || (b[e.id] = {}),
                chrome.windows.update(
                  e.id,
                  { state: e.state != 'maximized' ? 'maximized' : 'normal' },
                  t,
                ),
                (b[e.id].prevstate = e.state);
            });
          });
        },
        'open-screenshot': function (e, t) {
          chrome.tabs.get(h[e].detail.tabId, function (e) {
            chrome.tabs.update(e.id, { active: !0 }, function () {
              setTimeout(function () {
                chrome.tabs.captureVisibleTab(e.windowId, { format: 'png' }, function (e) {
                  chrome.tabs.create({ url: e }, t);
                });
              }, 100);
            });
          });
        },
        'save-screenshot': function (e, o) {
          chrome.tabs.get(h[e].detail.tabId, function (n) {
            chrome.tabs.update(n.id, { active: !0 }, function () {
              setTimeout(function () {
                chrome.tabs.captureVisibleTab(n.windowId, { format: 'png' }, function (e) {
                  const t = n.url.match(/\/\/([^\/]+)\//)[1];
                  T(e, `screenshot${t ? `-${t}` : ''}.png`), o();
                });
              }, 100);
            });
          });
        },
        'open-screenshot-full': function (e, t) {
          chrome.tabs.get(h[e].detail.tabId, function (e) {
            U(e, function (e) {
              chrome.tabs.create({ url: URL.createObjectURL(e) }), t();
            });
          });
        },
        'save-screenshot-full': function (e, o) {
          chrome.tabs.get(h[e].detail.tabId, function (n) {
            U(n, function (e) {
              const t = n.url.match(/\/\/([^\/]+)\//)[1];
              D(e, `screenshot${t ? `-${t}` : ''}.png`), o();
            });
          });
        },
      };
      var U = function (c, l) {
        chrome.tabs.update(c.id, { active: !0 }, function () {
          chrome.tabs.executeScript(
            c.id,
            {
              code: 'var ssfo=document.body.style.overflow;document.body.style.overflow="hidden";var ssf={top:document.body.scrollTop,left:document.body.scrollLeft,height:document.body.scrollHeight,width:document.body.scrollWidth,screenh:window.innerHeight,screenw:window.innerWidth,overflow:ssfo};ssf;',
            },
            function (e) {
              const t = e[0];
              const n = document.createElement('canvas');
              (n.height = Math.min(t.height, 32768)), (n.width = Math.min(t.width, 32768));
              const o = document.createElement('img');
              const i = n.getContext('2d');
              let a = 0;
              let r = 0;
              const s = function () {
                chrome.tabs.executeScript(
                  c.id,
                  {
                    code: `document.body.scrollTop=${a * t.screenh};document.body.scrollLeft=${
                      r * t.screenw
                    };`,
                  },
                  function () {
                    setTimeout(function () {
                      chrome.tabs.captureVisibleTab(c.windowId, { format: 'png' }, function (e) {
                        o.src = e;
                      });
                    }, 80);
                  },
                );
              };
              o.addEventListener('load', function () {
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
                ),
                  a + 1 < n.height / t.screenh
                    ? (a++, s())
                    : r + 1 < n.width / t.screenw
                      ? ((a = 0), r++, s())
                      : chrome.tabs.executeScript(
                          c.id,
                          {
                            code: `document.body.scrollTop=${t.top};document.body.scrollLeft=${
                              t.left
                            };document.body.style.overflow="${t.overflow}"`,
                          },
                          function () {
                            l(S(n.toDataURL()));
                          },
                        );
              }),
                s();
            },
          );
        });
      };
      var S = function (e) {
        const t = e.indexOf(',');
        const n = e.substr(0, t).match(/^data:([^;]+)(;.*)?$/);
        let o = e.substr(t + 1);
        return (
          n[2] == ';base64' &&
            (o = (function (e) {
              for (var t = atob(e), n = new Array(t.length), o = 0; o < t.length; o++)
                n[o] = t.charCodeAt(o);
              return new Uint8Array(n);
            })(o)),
          new Blob([o], { type: n[1] })
        );
      };
      var D = function (e, t) {
        const n = URL.createObjectURL(e);
        T(n, t), URL.revokeObjectURL(n);
      };
      var T = function (e, t) {
        const n = document.createElement('a');
        (n.href = e), (n.download = t || 'download');
        const o = document.createEvent('MouseEvents');
        o.initMouseEvent('click', !0, !1, window, 0, 0, 0, 0, 0, !1, !1, !1, !1, 0, null),
          n.dispatchEvent(o);
      };
      (L['clone-tab'] = function (e, t, n) {
        chrome.tabs.duplicate(h[e].detail.tabId, t);
      }),
        (L['zoom-in'] = function (e, t) {
          m
            ? (m.postMessage({
                key: { keys: ['='], mod: [d ? 'meta' : 'ctrl'] },
                timestamp: Date.now(),
              }),
              t())
            : h[e].postMessage({ action: { id: 'zoom-in-hack' } }, t);
        }),
        (L['zoom-out'] = function (e, t) {
          m
            ? (m.postMessage({
                key: { keys: ['-'], mod: [d ? 'meta' : 'ctrl'] },
                timestamp: Date.now(),
              }),
              t())
            : h[e].postMessage({ action: { id: 'zoom-out-hack' } }, t);
        }),
        (L['zoom-zero'] = function (e, t) {
          m
            ? (m.postMessage({
                key: { keys: ['0'], mod: [d ? 'meta' : 'ctrl'] },
                timestamp: Date.now(),
              }),
              t())
            : h[e].postMessage({ action: { id: 'zoom-zero-hack' } }, t);
        }),
        (L['zoom-img-in'] = function (e, t, n) {
          h[e].postMessage({ action: { id: 'zoom-img-in', images: n.images } }, t);
        }),
        (L['zoom-img-out'] = function (e, t, n) {
          h[e].postMessage({ action: { id: 'zoom-img-out', images: n.images } }, t);
        }),
        (L['zoom-img-zero'] = function (e, t, n) {
          h[e].postMessage({ action: { id: 'zoom-img-zero', images: n.images } }, t);
        }),
        (L['tab-to-left'] = function (e, t) {
          chrome.tabs.get(h[e].detail.tabId, function (e) {
            chrome.tabs.move(e.id, { index: e.index > 0 ? e.index - 1 : 0 });
          });
        }),
        (L['tab-to-right'] = function (e, t) {
          chrome.tabs.get(h[e].detail.tabId, function (e) {
            chrome.tabs.move(e.id, { index: e.index + 1 });
          });
        }),
        (L['parent-dir'] = function (e, o) {
          chrome.tabs.get(h[e].detail.tabId, function (e) {
            let t = e.url.split('#')[0].split('?')[0].split('/');
            t[t.length - 1] == '' && (t = t.slice(0, t.length - 1));
            let n = null;
            (n = t.length > 3 ? `${t.slice(0, t.length - 1).join('/')}/` : `${t.join('/')}/`)
              ? chrome.tabs.update(e.id, { url: n }, o)
              : o();
          });
        }),
        (L['open-history'] = function (e, t) {
          chrome.tabs.get(h[e].detail.tabId, function (e) {
            chrome.tabs.create({ url: 'chrome://history/', windowId: e.windowId }, t);
          });
        }),
        (L['open-downloads'] = function (e, t) {
          chrome.tabs.get(h[e].detail.tabId, function (e) {
            chrome.tabs.create({ url: 'chrome://downloads/', windowId: e.windowId }, t);
          });
        }),
        (L['open-extensions'] = function (e, t) {
          chrome.tabs.get(h[e].detail.tabId, function (e) {
            chrome.tabs.create({ url: 'chrome://extensions/', windowId: e.windowId }, t);
          });
        }),
        (L['open-bookmarks'] = function (e, t) {
          chrome.tabs.get(h[e].detail.tabId, function (e) {
            chrome.tabs.create({ url: 'chrome://bookmarks/', windowId: e.windowId }, t);
          });
        }),
        (L['open-image'] = function (e, n, o) {
          chrome.tabs.get(h[e].detail.tabId, function (e) {
            for (let t = 0; t < o.images.length; t++)
              chrome.tabs.create(
                { url: o.images[t].src, openerTabId: e.id, windowId: e.windowId },
                n,
              );
          });
        }),
        (L['save-image'] = function (e, o, i) {
          chrome.tabs.get(h[e].detail.tabId, function (e) {
            for (let t = 0; t < i.images.length; t++) {
              const n = i.images[t].src.match(/([^\/?]{1,255})\/?(\?.*)?$/);
              T(i.images[t].src, n[1]);
            }
            o();
          });
        }),
        (L['hide-image'] = function (e, t, n) {
          h[e].postMessage({ action: { id: 'hide-image', images: n.images } }, t);
        }),
        (L['show-cookies'] = function (e, t) {
          O(
            e,
            "window.alert('Cookies stored by this host or domain:\\n'+('\\n'+document.cookie).replace(/; /g,';\\n').replace(/\\n(.{192})([^\\n]{5})/gm,\"\\n$1\\n        $2\").replace(/\\n(.{100})([^\\n]{5})/gm,\"\\n$1\\n        $2\"));",
            t,
          );
        }),
        (L['search-sel'] = function (e, t, n) {
          chrome.tabs.get(h[e].detail.tabId, function (e) {
            chrome.tabs.create(
              {
                url: `http://www.google.com/search?q=${n.selection}`,
                openerTabId: e.id,
                windowId: e.windowId,
                index: e.index + 1,
              },
              t,
            );
          });
        }),
        (L.print = function (e, t) {
          h[e].postMessage({ action: { id: 'print', images: a.images } }, t);
        }),
        (L['toggle-pin'] = function (e, t) {
          chrome.tabs.get(h[e].detail.tabId, function (e) {
            chrome.tabs.update(e.id, { pinned: !e.pinned }, t);
          });
        }),
        (L.pin = function (e, t) {
          chrome.tabs.get(h[e].detail.tabId, function (e) {
            chrome.tabs.update(e.id, { pinned: !0 }, t);
          });
        }),
        (L.unpin = function (e, t) {
          chrome.tabs.get(h[e].detail.tabId, function (e) {
            chrome.tabs.update(e.id, { pinned: !1 }, t);
          });
        }),
        (L.copy = function (e, t, n) {
          if (!n.selection) return t();
          const o = document.createElement('textarea');
          (o.value = n.selection),
            document.body.appendChild(o),
            o.select(),
            document.execCommand('Copy'),
            document.body.removeChild(o),
            t();
        }),
        (L['copy-link'] = function (e, t, n) {
          if (n.links.length == 0) return t();
          const o = document.createElement('textarea');
          (o.value = n.links[0].src),
            document.body.appendChild(o),
            o.select(),
            document.execCommand('Copy'),
            document.body.removeChild(o),
            t();
        }),
        (L['find-prev'] = function (e, t, n) {
          if (!n.selection) return t();
          O(
            e,
            `window.find('${n.selection.replace(
              /[\\"']/g,
              '\\$&',
            )}', false, true, true, false, true, true);`,
            t,
          );
        }),
        (L['find-next'] = function (e, t, n) {
          if (!n.selection) return t();
          O(
            e,
            `window.find('${n.selection.replace(
              /[\\"']/g,
              '\\$&',
            )}', false, false, true, false, true, true);`,
            t,
          );
        }),
        (L['toggle-bookmark'] = function (e, n) {
          M(['bookmarks'], function () {
            chrome.tabs.get(h[e].detail.tabId, function (t) {
              chrome.bookmarks.search(t.url, function (e) {
                e.length <= 0
                  ? chrome.bookmarks.create({ parentId: '2', title: t.title, url: t.url }, n)
                  : chrome.bookmarks.remove(e[0].id, n);
              });
            });
          });
        }),
        (L.bookmark = function (e, t) {
          M(['bookmarks'], function () {
            chrome.tabs.get(h[e].detail.tabId, function (e) {
              chrome.bookmarks.create({ parentId: '2', title: e.title, url: e.url }, t);
            });
          });
        }),
        (L.unbookmark = function (e, t) {
          M(['bookmarks'], function () {
            chrome.tabs.get(h[e].detail.tabId, function (e) {
              chrome.bookmarks.search(e.url, function (e) {
                e.length <= 0 ? t() : chrome.bookmarks.remove(e[0].id, t);
              });
            });
          });
        });
      let R = null;
      var M = function (o, i) {
        chrome.permissions.contains({ permissions: o }, function (e) {
          if (e) i && i();
          else {
            R = i;
            const t = screen.height / 2 - 200 / 1.5;
            const n = screen.width / 2 - 250;
            window.open(
              `permissions.html#${o.join(',')}`,
              'sggrant',
              `width=500,height=200,top=${t},left=${n}`,
            );
          }
        });
      };
      chrome.runtime.onMessage.addListener(function (e, t, n) {
        e.getstates
          ? N(function (e) {
              n(JSON.stringify({ states: e }));
            })
          : (e.log && console.log(e.log), n(null));
      }),
        chrome.runtime.onConnect.addListener(function (e) {
          if (e.sender && e.sender.tab) {
            if (((e.detail = JSON.parse(e.name)), !e.detail.id)) return;
            (e.detail.tabId = e.sender.tab.id), t(e);
          }
        }),
        chrome.runtime.onMessageExternal.addListener(function (e, t, n) {
          if (e.getgestures) {
            if (!w)
              return (
                $.get(chrome.runtime.getURL('js/gestures.js'), null, function (e) {
                  (w = `window.SGextId='${chrome.runtime.id}';\n${e}`), n({ gestures: w });
                }),
                !0
              );
            n({ gestures: w });
          } else if (e.storage) {
            const o = [
              'gestures',
              'validGestures',
              'contextOnLink',
              'holdButton',
              'trailBlock',
              'trailColor',
              'trailWidth',
              'trailLegacy',
              'selectToLink',
            ];
            const a = {};
            for (i in o) a[o[i]] = s[o[i]];
            n(a);
          } else if (e.externalactions) {
            const r = e.externalactions;
            if (r.name && r.actions) {
              if (r.actions.length > 0)
                for (
                  s.externalactions[t.id] = r, i = 0;
                  i < s.externalactions[t.id].actions.length;
                  i++
                )
                  I[`${t.id}-${s.externalactions[t.id].actions[i].id}`] =
                    s.externalactions[t.id].actions[i].context;
              else delete s.externalactions[t.id];
              c({ externalactions: s.externalactions }), n(!0);
            } else n(!1);
          } else n(null);
        }),
        chrome.runtime.onConnectExternal.addListener(function (e) {
          if ((console.log(e.sender.tab, e.name), e.sender.tab)) {
            if (((e.detail = JSON.parse(e.name)), !e.detail.id)) return;
            (e.detail.tabId = e.sender.tab.id), (e.detail.external = !0), t(e);
          }
        });
      var t = function (e) {
        if (e.sender && e.sender.tab && e.detail.id) {
          const t = e.sender.tab;
          const n = e.detail.id;
          (h[n] = e),
            h[n].onMessage.addListener(
              function (t, n) {
                if (
                  (console.log('content_message', JSON.stringify(n)),
                  n.selection && n.selection.length > 0 && s.gestures[`s${n.gesture}`]
                    ? (n.gesture = `s${n.gesture}`)
                    : n.links && n.links.length > 0 && s.gestures[`l${n.gesture}`]
                      ? (n.gesture = `l${n.gesture}`)
                      : n.images &&
                        n.images.length > 0 &&
                        s.gestures[`i${n.gesture}`] &&
                        (n.gesture = `i${n.gesture}`),
                  n.gesture && s.gestures[n.gesture])
                ) {
                  if (v) return void J();
                  const e = s.gestures[n.gesture];
                  console.log('gesture', n.gesture, e),
                    p && clearTimeout(p.timeout),
                    (p = null),
                    n.gesture[0] == 'r' &&
                      (p = {
                        rocker: !0,
                        timeout: setTimeout(function () {
                          p = null;
                        }, 2e3),
                      }),
                    n.gesture[0] == 'w' &&
                      (p = {
                        wheel: !0,
                        timeout: setTimeout(function () {
                          p = null;
                        }, 2e3),
                      }),
                    p && n.buttonDown && (p.buttonDown = n.buttonDown),
                    p && n.startPoint && (p.startPoint = n.startPoint);
                  const o = p
                    ? function () {
                        chrome.tabs.query({ active: !0, lastFocusedWindow: !0 }, function (e) {
                          if (p && e.length)
                            for (t in ((p.tabId = e[0].id), h))
                              e[0].id == h[t].detail.tabId && h[t].postMessage({ chain: p });
                        });
                      }
                    : function () {};
                  try {
                    if (L[e]) L[e].call(null, t, o, n);
                    else if (s.externalactions[e.substr(0, 32)])
                      chrome.runtime.sendMessage(e.substr(0, 32), { doaction: e.substr(33) });
                    else if (s.customactions[e]) {
                      const i = s.customactions[e];
                      i.env == 'page' && O(t, i.code, o);
                    }
                  } catch (e) {}
                  s.log.action[e] || (s.log.action[e] = {}),
                    s.log.action[e][n.gesture] || (s.log.action[e][n.gesture] = { count: 0 }),
                    (s.log.action[e][n.gesture].count += 1),
                    s.log.line || (s.log.line = { distance: 0, segments: 0 }),
                    n.line &&
                      ((s.log.line.distance += n.line.distance),
                      (s.log.line.segments += n.line.segments)),
                    c({ log: s.log });
                }
                if (
                  (n.syncButton &&
                    (p &&
                      (p.buttonDown || (p.buttonDown = {}),
                      (p.buttonDown[n.syncButton.id] = n.syncButton.down)),
                    setTimeout(function () {
                      chrome.tabs.query({ active: !0, lastFocusedWindow: !0 }, function (e) {
                        for (t in h)
                          e[0].id == h[t].detail.tabId &&
                            h[t].postMessage({ syncButton: n.syncButton });
                      });
                    }, 20)),
                  n.closetab &&
                    chrome.tabs.get(h[t].detail.tabId, function (e) {
                      chrome.tabs.remove(e.id);
                    }),
                  n.nativeport && n.nativeport.rightclick)
                ) {
                  if (
                    typeof n.nativeport.rightclick.x !== 'number' ||
                    typeof n.nativeport.rightclick.y !== 'number'
                  )
                    return;
                  if (m)
                    m.postMessage({
                      click: { x: n.nativeport.rightclick.x, y: n.nativeport.rightclick.y, b: 2 },
                      timestamp: Date.now(),
                    });
                  else if (!s.blockDoubleclickAlert && (d || u)) {
                    const a = screen.availHeight / 2 - 320 / 1.5;
                    const r = screen.availWidth / 2 - 375;
                    window.open(
                      'rightclick.html',
                      'rightclick',
                      `width=750,height=320,top=${a},left=${r}`,
                    );
                  }
                }
              }.bind(null, n),
            ),
            h[n].onDisconnect.addListener(function () {
              delete h[n];
            });
          const o = { enable: !0 };
          p &&
            p.tabId == t.id &&
            (t.active ? (o.chain = p) : (clearTimeout(p.timeout), (p = null)));
          let i = t.url.substr(t.url.indexOf('//') + 2);
          i = i.substr(0, i.indexOf('/')).toLowerCase();
          for (let a = 0; s.blacklist && a < s.blacklist.length; a++)
            new RegExp(`^(.+\\.)?${s.blacklist[a].replace('.', '\\.')}$`).test(i) &&
              (o.enable = !1);
          h[n].postMessage(o), _(t.id);
        }
      };
      var O = function (e, t, n, o) {
        h[e] &&
          (typeof n === 'function' && ((o = n), (n = void 0)),
          void 0 === n && (n = []),
          (typeof n === 'object' && n.constructor === Array) || (n = [n]),
          console.log('runJS:', t),
          typeof t === 'string' && (t = `(function(){${t}})()`),
          typeof t === 'function' &&
            (t = `(${t.toString()})(${n
              .map(function (e) {
                return JSON.stringify(e);
              })
              .join(',')})`),
          (t = `(function(){if(window.SG && window.SG.isId("${e}")){return ${t}}})()`),
          chrome.tabs.executeScript(
            h[e].sender.tab.id,
            { code: t, allFrames: !0, matchAboutBlank: !0 },
            function (e) {
              for (let t = 0; t < e.length; t++) if (e[t] !== null) return void o(e[t]);
              o && o();
            },
          ));
      };
      const n = function (e) {
        if (f.active != e) {
          for (id in h) f.active == h[id].detail.tabId && h[id].postMessage({ windowBlurred: !0 });
          (f.prevActive = f.active), (f.active = e);
        }
      };
      chrome.tabs.onActivated.addListener(function (e) {
        n(e.tabId);
      }),
        chrome.windows.onFocusChanged.addListener(function (e) {
          e != chrome.windows.WINDOW_ID_NONE &&
            (b[e] || (b[e] = {}),
            (b[e].focused = Date.now()),
            chrome.tabs.query({ active: !0, lastFocusedWindow: !0 }, function (e) {
              e.length && n(e[0].id);
            }));
        });
      const z = function (d, u) {
        chrome.tabs.get(d, function (e) {
          if (!chrome.runtime.lastError) {
            if (
              (e.url == 'https://smoothgesturesplus.com/thanks' && V(),
              u && u.url && ((e.url = u.url), (e.title = u.url)),
              e.url.substr(0, 29) == 'http://www.google.com/?index=')
            ) {
              const t = e.url.split('#');
              const n = t[0].split('?');
              const o = t[1].substr(4).split(':--:');
              const i = (o[0], JSON.parse(unescape(o[1])));
              const a = JSON.parse(unescape(o[2]));
              const r = 1 * n[1].substr(6);
              e.url = '';
              for (var s = 0; s < a[r].length; s++)
                e.url += String.fromCharCode(a[r].charCodeAt(s) - 10);
              e.title = '';
              for (s = 0; s < i[r].length; s++)
                e.title += String.fromCharCode(i[r].charCodeAt(s) - 10);
            }
            f.tab[d] || (f.tab[d] = { history: [], titles: [] });
            const c = f.tab[d];
            (c.winId = e.windowId), (c.index = e.index);
            const l = c.history.indexOf(e.url);
            l >= 0
              ? ((c.history = c.history.slice(0, l + 1)),
                (c.titles = c.titles.slice(0, l + 1)),
                (c.titles[l] = e.title))
              : (c.history.push(e.url),
                c.titles.push(e.title),
                c.history.length > 10 && (c.history.shift(), c.titles.shift())),
              e.status == 'loading' &&
                (chrome.pageAction.setIcon({
                  tabId: d,
                  path: chrome.runtime.getURL('/img/pageaction.png'),
                }),
                chrome.pageAction.setTitle({ tabId: d, title: 'Smooth Gestures' }),
                chrome.pageAction.show(d)),
              e.status == 'complete' &&
                setTimeout(function () {
                  _(d);
                }, 100);
          }
        });
      };
      chrome.tabs.onUpdated.addListener(z),
        chrome.tabs.onMoved.addListener(z),
        chrome.tabs.onAttached.addListener(z),
        chrome.tabs.onRemoved.addListener(function (e) {
          for (f.tab[e] && f.closed.push(f.tab[e]); f.closed.length > 50; ) f.closed.shift();
          delete f.tab[e];
        }),
        chrome.windows.onRemoved.addListener(function (e) {
          delete b[e];
        });
      var A = function () {
        const e = {};
        for (g in s.gestures)
          if (((g[0] != 'l' && g[0] != 'i' && g[0] != 's') || (g = g.substr(1)), g[0] == 'k')) {
            e.k || (e.k = {});
            const t = g.substr(1, 4);
            e.k[t] || (e.k[t] = []), e.k[t].push(g.substr(6));
          } else {
            let n = e;
            for (i = 0; i < g.length; i++) n[g[i]] || (n[g[i]] = {}), (n = n[g[i]]);
            n[''] = !0;
          }
        c({ validGestures: e });
      };
      var C = function (e) {
        let t = null;
        for (id in h)
          if (e == h[id].detail.tabId) {
            if (!h[id].detail.frame) return h[id];
            t = h[id];
          }
        return t;
      };
      var N = function (r) {
        const s = {};
        for (id in h) {
          const e = h[id].detail.tabId;
          s[e] || (s[e] = { root: !1, frames: 0 }),
            h[id].detail.frame ? (s[e].frames += 1) : (s[e].root = !0);
        }
        chrome.windows.getAll({ populate: !0 }, function (e) {
          const t = {};
          for (j = 0; j < e.length; j++) {
            const n = e[j];
            for (t[n.id] = [], i = 0; i < n.tabs.length; i++) {
              const o = n.tabs[i];
              let a = null;
              s[o.id] ? ((a = s[o.id]), delete s[o.id]) : (a = { root: !1, frames: 0 }),
                (a.goodurl =
                  o.url.substr(0, 9) != 'chrome://' &&
                  o.url.substr(0, 19) != 'chrome-extension://' &&
                  o.url.substr(0, 26) != 'https://chrome.google.com/'),
                (a.title = o.title),
                (a.url = o.url),
                (a.tabStatus = o.status),
                (a.tabId = o.id),
                t[n.id].push(a);
            }
            t.extra = s;
          }
          r(t);
        });
      };
      const G = function (e, t) {
        C(e);
        C(e)
          ? t('working')
          : chrome.tabs.get(e, function (e) {
              e &&
              e.url.match(
                /^(chrome:\/\/|chrome-extension:\/\/|https:\/\/chrome\.google\.com|file:\/\/|[^:\/]+:[^:\/]+)/,
              )
                ? t('unable')
                : t('broken');
            });
      };
      var _ = function (t) {
        G(t, function (e) {
          e == 'unable'
            ? (chrome.pageAction.setIcon({
                tabId: t,
                path: chrome.runtime.getURL('/img/pageaction-unable.png'),
              }),
              chrome.pageAction.setTitle({
                tabId: t,
                title: 'Chrome blocks Gestures on this page',
              }))
            : e == 'broken'
              ? (chrome.pageAction.setIcon({
                  tabId: t,
                  path: chrome.runtime.getURL('/img/pageaction-broken.png'),
                }),
                chrome.pageAction.setTitle({ tabId: t, title: "Gestures don't work. Reload" }))
              : (chrome.pageAction.setIcon({
                  tabId: t,
                  path: chrome.runtime.getURL('/img/pageaction.png'),
                }),
                chrome.pageAction.setTitle({ tabId: t, title: 'Smooth Gestures' })),
            chrome.pageAction.show(t);
        });
      };
      var J = function () {
        chrome.runtime.requestUpdateCheck(function () {}),
          setTimeout(function () {
            window.open(
              '/update.html',
              'sgupdate',
              `chrome,innerWidth=700,innerHeight=250,left=${(window.screen.width - 700) / 2},top=${
                (window.screen.height - 250) / 2 - 100
              }`,
            );
          }, 2e3);
      };
      const q = {};
      const E = function () {
        for (const e in q) delete q[e], e == 'ping' && V();
      };
      window.addEventListener('online', E, !0);
      var V = function (t) {
        navigator.onLine
          ? (delete q.ping,
            $.ajax({
              url: 'https://api.s13.us/gestures/ping',
              type: 'post',
              data: JSON.stringify({
                clid: s.id,
                time: s.firstinstalled,
                htok: r.token ? sjcl.codec.hex.fromBits(sjcl.hash.sha1.hash(r.token)) : void 0,
                version: chrome.runtime.getManifest().version,
                lang: navigator.language,
                nat: !!m,
                storagefailed: l.failed,
              }),
            })
              .done(function (e) {
                if (!e) return (q.ping = !0), void setTimeout(E, 3e5);
                typeof e === 'string' && (e = JSON.parse(e)),
                  e.alert && alert(e.alert),
                  e.checkupdate && J(),
                  e.code == 3 && (v = !0),
                  e.invalidtoken &&
                    r.token &&
                    ((r.invalidtoken = r.token),
                    chrome.storage.sync.set({ invalidtoken: r.invalidtoken }),
                    delete r.token,
                    chrome.storage.sync.remove('token')),
                  e.settoken &&
                    ((r.token = e.settoken), chrome.storage.sync.set({ token: r.token })),
                  (o =
                    [
                      'full',
                      '1yrmul',
                      '6mnmul',
                      '1mnmul',
                      '2wkmul',
                      '1wkmul',
                      '1yr1cl',
                      '1mn1cl',
                      '1wk1cl',
                      'free',
                    ].indexOf(e.licenseid) != -1
                      ? e.licenseid
                      : null),
                  c({ license: o, license_expires: e.expires }),
                  t && t();
              })
              .fail(function () {
                q.ping = !0;
              }))
          : (q.ping = !0);
      };
      let B = null;
      const P = function (o) {
        m ||
          chrome.permissions.contains({ permissions: ['nativeMessaging'] }, function (e) {
            if ((console.log('connectNative', e), e)) {
              B = !0;
              try {
                (m = chrome.runtime.connectNative(
                  'com.smoothgesturesplus.extras',
                )).onMessage.addListener(function (e) {
                  console.log('nativemessage', e),
                    m &&
                      (n && (clearTimeout(n), (n = null), t()),
                      e.version && (m.version = e.version));
                }),
                  m.onDisconnect.addListener(function () {
                    m &&
                      ((m = null),
                      console.log('nativedisconnect: retryTimeout: ', o),
                      clearTimeout(n),
                      (n = null),
                      o > 0 && o < 6e4 && setTimeout(P, o, 1.01 * o));
                  });
                var t = function () {
                  for (let e = chrome.extension.getViews(), t = 0; t < e.length; t++)
                    e[t].location.pathname == '/rightclick.html' && e[t].close();
                };
                var n = setTimeout(t, 1e3);
              } catch (e) {
                console.error('connectNative', B, e),
                  B &&
                    setTimeout(function () {
                      chrome.runtime.reload();
                    }, 1e3);
              }
            } else B = !1;
          });
      };
      P(1e3);
      const W = function () {
        chrome.windows.getAll({ populate: !0 }, function (e) {
          for (x in e)
            for (y in ((b[e[x].id] = {}), e[x].tabs))
              !(function (e) {
                (f.tab[e.id] = {
                  winId: e.windowId,
                  index: e.index,
                  history: [e.url],
                  titles: [e.title],
                }),
                  e.url.match(
                    /(^chrome(|-devtools|-extension):\/\/)|(:\/\/chrome.google.com\/)|(^view-source:)/,
                  ) ||
                    (chrome.tabs.executeScript(e.id, {
                      allFrames: !0,
                      matchAboutBlank: !0,
                      code: 'if(window.SG) { if(window.SG.enabled()) window.SG.disable(); delete window.SG; }',
                    }),
                    setTimeout(function () {
                      chrome.tabs.executeScript(e.id, {
                        allFrames: !0,
                        matchAboutBlank: !0,
                        file: 'js/gestures.js',
                      });
                    }, 200)),
                  setTimeout(function () {
                    _(e.id);
                  }, 100);
              })(e[x].tabs[y]);
          chrome.windows.getLastFocused(function (e) {
            b[e.id] = { focused: Date.now() };
          });
        });
      };
      var F = function () {
        for (id in s.customactions) I[id] = s.customactions[id].context;
        for (id in s.externalactions)
          for (i = 0; i < s.externalactions[id].actions.length; i++)
            I[`${id}-${s.externalactions[id].actions[i].id}`] =
              s.externalactions[id].actions[i].context;
        for (id in ((function (e, t) {
          (e = e.split('.')), (t = t.split('.'));
          for (let n = 0; n < e.length && n < t.length; n++)
            if (parseInt(e[n]) != parseInt(t[n])) return parseInt(e[n]) > parseInt(t[n]);
          return e.length > t.length;
        })(chrome.runtime.getManifest().version, s.version) &&
          c({ version: chrome.runtime.getManifest().version, updated: Date.now() }),
        s.externalactions))
          delete s.externalactions[id],
            c({ externalactions: s.externalactions }),
            chrome.runtime.sendMessage(id, { getexternalactions: !0 });
        setTimeout(W, 0),
          chrome.tabs.query({ active: !0, lastFocusedWindow: !0 }, function (e) {
            e.length && (f.active = e[0].id);
          }),
          V();
      };
      chrome.runtime.onUpdateAvailable.addListener(function (e) {
        chrome.runtime.reload();
      }),
        (window.defaults = k),
        (window.categories = {
          cat_page_navigation: {
            actions: [
              'page-back',
              'page-forward',
              'page-back-close',
              'reload-tab',
              'reload-tab-full',
              'reload-all-tabs',
              'stop',
              'parent-dir',
              'page-next',
              'page-prev',
            ],
          },
          cat_tab_management: {
            actions: [
              'new-tab',
              'new-tab-link',
              'new-tab-back',
              'navigate-tab',
              'close-tab',
              'close-other-tabs',
              'close-left-tabs',
              'close-right-tabs',
              'undo-close',
              'clone-tab',
              'new-window',
              'new-window-link',
              'close-window',
              'prev-tab',
              'next-tab',
              'split-tabs',
              'merge-tabs',
              'tab-to-left',
              'tab-to-right',
              'toggle-pin',
              'pin',
              'unpin',
            ],
          },
          cat_utilities: {
            actions: [
              'goto-top',
              'goto-bottom',
              'page-up',
              'page-down',
              'print',
              'view-source',
              'show-cookies',
              'search-sel',
              'zoom-in',
              'zoom-out',
              'zoom-zero',
              'open-image',
              'save-image',
              'hide-image',
              'zoom-img-in',
              'zoom-img-out',
              'zoom-img-zero',
              'find-prev',
              'find-next',
              'copy',
              'copy-link',
              'toggle-bookmark',
              'bookmark',
              'unbookmark',
            ],
          },
          cat_other: {
            actions: [
              'options',
              'fullscreen-window',
              'minimize-window',
              'maximize-window',
              'open-screenshot',
              'save-screenshot',
              'open-screenshot-full',
              'save-screenshot-full',
              'open-history',
              'open-downloads',
              'open-extensions',
              'open-bookmarks',
            ],
          },
          cat_custom: { customActions: !0 },
          cat_external: { externalActions: !0 },
          cat_settings: { settings: !0 },
        }),
        (window.contexts = I),
        (window.ensure_permissions = M),
        (window.continue_permissions = function () {
          setTimeout(function () {
            R && R(),
              setTimeout(function () {
                chrome.runtime.reload();
              }, 500);
          }, 0);
        }),
        (window.getTabStates = N),
        (window.getTabStatus = G),
        (window.refreshPageAction = _),
        (window.ping = V),
        (window.connectNative = P),
        (window.disconnectNative = function (e) {
          m && (m.disconnect(), (m = null));
        }),
        (window.isNative = function () {
          return !!m && (m.version ? { loaded: !0, version: m.version } : { loaded: !1 });
        });
    })();
  },
]);
