let settings = {};
const index = (e) => {
  for (const key in e) {
    settings[key] = e[key];
  }
  chrome.storage.local.set(e);
};
chrome.storage.local.get(null, (items) => {
  settings = items;
  chrome.storage.onChanged.addListener(onLocalChange);
  o();
});

const onLocalChange = (changes, areaName) => {
  if (areaName === 'local') {
    for (const key in changes) {
      settings[key] = changes[key].newValue;
    }
  }
};

const n = () => {
  $('#blacklist.setting .button').on('click', () => {
    const e = $('#blacklist.setting textarea').val().split(/[\n,]/);
    for (let t = 0; t < e.length; t += 1) {
      e[t] = e[t].trim();
    }
    index({ blacklist: e });
  });

  const allowedKeys = new Set([
    'gestures',
    'customactions',
    'blacklist',
    'contextOnLink',
    'holdButton',
    'newTabLinkRight',
    'newTabRight',
    'newTabUrl',
    'selectToLink',
    'stroke',
    'strokeWidth',
  ]);
  $('#importbutton.button input[type=file]').on('change', () => {
    const t = reader.result;
    let n = null;
    try {
      n = JSON.parse(atob(t));
    } catch {}
    if (n) {
      for (label in n.sgplus) {
        if (allowedKeys.has(label)) {
          settings[label] = n.sgplus[label];
        }
      }
      index(settings);
      alert('Import Successful');
    }
    hGesture();
  });
};

const s = () => {
  $('#extras.setting select').val(settings.blockDoubleclickAlert ? 0 : 1);
  const n = navigator.platform.includes('Mac') ? '0.7' : '0.6';
  chrome.runtime.getBackgroundPage((backgroundPage) => {
    const t = backgroundPage.isNative();
    console.log('native', t);
    $('#note_extras_installed').css({
      display: t && (!t.loaded || t.version >= n) ? 'block' : 'none',
    });
    $('#note_extras_update').css({
      display: t && t.loaded && t.version < n ? 'block' : 'none',
    });
    $('#note_extras_notinstalled').css({ display: t ? 'none' : 'block' });
  });
};

const o = () => {
  $(() => {
    const e = globalThis.location.hash.replace(/^#(.+)$/, '$1') || 'config';
    $.fx.off = true;
    pages.init();
    $('.upgradebutton').remove();
    d.init();
    $('.addgesture')
      .html(`<span>+</span> ${i18n.t('options_button_startaddgesture')}`)
      .click(d.open.bind(null, null));
    (() => {
      $('.note_remindrate .close').click(() => {
        $('.note_remindrate').css({ display: 'none' });
      });
      settings.hideNotePrint && $('#note_print').css({ display: 'none' });
      $('#note_print .close').click(() => {
        $('#note_print').css({ display: 'none' });
        index({ hideNotePrint: true });
      });
      $('#note_print .button').click(() => {
        globalThis.print();
      });
    })();
    (() => {
      let e = $('.pagesection[pagesection=actions]');
      const t = ['page', 'tabs', 'utilities', 'others', 'customs'];
      for (const element of t) {
        $('#navactions').append(
          $('<div class=navbutton>')
            .attr('nav', element)
            .text(i18n.t(`cat_${element}`)),
        );
        const s = $('<div class=page>').attr('page', element);
        s.append($('<div class=pagetitle>').text(i18n.t(`cat_${element}`)));
        s.append(
          "<div class=content><div class='actiongroup enabled'></div><div class=actiongrouptitle></div><div class='actiongroup disabled'></div></div>",
        );
        s.append('<div class=clear>');
        $('.actiongrouptitle', s).text(i18n.t('options_moreactions'));
        s.insertAfter(e);
        e = s;
      }
      $('.page[page=custom] .pagetitle').append(
        $("<div id=addaction class='button gray'>")
          .html(`<span>+</span> ${i18n.t('options_button_addcustomaction')}`)
          .on('click', a),
      );
      m();
    })();

    n();

    (() => {
      s();
      const isWin = navigator.platform.includes('Win');
      const isMac = navigator.platform.includes('Mac');
      const isCrOS = navigator.platform.includes('CrOS');
      if (isWin || isCrOS) {
        $('.page[page=extras]').css({ display: 'none' });
      }
      $('#extras.setting select').on('change', () => {
        index({ blockDoubleclickAlert: $(this).val() === 0 });
      });
      $('#installplugin,#updateplugin').click(() => {
        index({ blockDoubleclickAlert: false });
        chrome.permissions.request({ permissions: ['nativeMessaging'] }, (e) => {
          if (e) {
            chrome.runtime.getBackgroundPage((backgroundPage) => {
              backgroundPage.connectNative(1000);
            });
            const t = document.createElement('a');
            if (isMac) {
              t.setAttribute('href', '/nat/SmoothGesturesPlusExtras-0.7.dmg');
              t.setAttribute('download', 'SmoothGesturesPlusExtras-0.7.dmg');
            }
            t.click();
          }
        });
      });
    })();
    pages.show(e);
    setTimeout(() => {
      pages.show(e);
    }, 100);
    setTimeout(() => {
      pages.show(e);
    }, 500);
    setTimeout(() => {
      pages.show(e);
      $.fx.off = false;
    }, 900);
  });
};

const a = () => {
  const e = {
    title: 'Navigate to Page',
    descrip: 'Go to Google',
    code: 'location.href = "http://www.google.com";',
    env: 'page',
    share: true,
    context: '',
  };
  const t = `custom${Math.floor(Math.random() * 2 ** 30).toString(32)}`;
  settings.customactions[t] = e;
  index({ customactions: settings.customactions });
  m();
  setTimeout(u.bind(null, t), 500);
};

const r = (t) => {
  if (confirm('Delete this custom action?')) {
    delete settings.customactions[t];
    index({ customactions: settings.customactions });
    for (const e in settings.gestures) {
      settings.gestures[e] === t && p(e);
    }
    chrome.runtime.getBackgroundPage((backgroundPage) => {
      delete backgroundPage.contexts[t];
    });
    m();
  }
};

const u = (e) => {
  const t = settings.customactions[e];
  const n = $(`.action[action=${e}]`);
  $('#customedit').remove();
  $('.page[page=custom] .action').css({ display: '' });
  n.css({ display: 'none' });
  n.after(
    $('<div id=customedit>')
      .append(
        $("<div class='button gray customsave' tabindex=0>")
          .text('save')
          .on('click', () => {
            t.title = $('.customtitle').val();
            t.descrip = $('.customdescrip').val();
            t.code = $('.customcode').val();
            t.context = $('.customcontext').val();
            settings.customactions[e] = t;
            index({ customactions: settings.customactions });
            $('#customedit').remove();
            $('.page[page=custom] .action').css({ display: '' });
            m();
          }),
      )
      .append(
        $("<div class='button gray customcancel' tabindex=0>")
          .text('cancel')
          .on('click', () => {
            $('#customedit').remove();
            $('.page[page=custom] .action').css({ display: '' });
          }),
      )
      .append($('<input type=text class=customtitle placeholder=Title>').val(t.title))
      .append($('<input type=text class=customdescrip placeholder=Description>').val(t.descrip))
      .append($("<textarea class=customcode placeholder='Javascript Code'>").text(t.code)),
  );
};

var d = {
  action: null,
  gesture: null,
  init() {
    $('#drawingcanvas .close').on('click', d.close);
    $('#tryagain').on('click', () => {
      $('#nowwhat').css({ display: 'none' });
      $('#canvasdescrip').css({ display: 'table' });
      setTimeout(() => {
        globalThis.SG.callback = d.gesturecallback;
      }, 0);
    });
    $('#doaddgesture').on('click', d.choose);
    $('#chooseaction').on('change', () => {
      d.action = $('#chooseaction').val();
      d.choose();
    });
    chrome.runtime.getBackgroundPage((backgroundPage) => {
      for (const categoryKey in backgroundPage.categories)
        if (backgroundPage.categories[categoryKey].actions) {
          $('#chooseaction').append($('<option>').text(i18n.t(categoryKey)).prop('disabled', true));
          for (let n = 0; n < backgroundPage.categories[categoryKey].actions.length; n += 1)
            $('#chooseaction').append(
              $('<option>')
                .text(`- ${i18n.t(`action_${backgroundPage.categories[categoryKey].actions[n]}`)}`)
                .val(backgroundPage.categories[categoryKey].actions[n]),
            );
        } else if (backgroundPage.categories[categoryKey].customActions) {
          $('#chooseaction').append($('<option>').text('Custom Actions').prop('disabled', true));
          for (const s in settings.customactions) {
            $('#chooseaction').append(
              $('<option>').text(`- ${settings.customactions[s].title}`).val(s),
            );
          }
        }
    });
  },
  close() {
    d.action = null;
    d.gesture = null;
    globalThis.SG.callback = null;
    $('#drawingcanvas').css({ display: 'none' });
    globalThis.removeEventListener('mousewheel', d.blockevent, false);
    document.removeEventListener('keydown', d.blockevent, true);
  },
  choose() {
    if (d.action && d.gesture) {
      if (settings.gestures[d.gesture]) {
        p(d.gesture);
      }
      settings.gestures[d.gesture] = d.action;
      index({ gestures: settings.gestures });
      d.close();
      hGesture();
    }
  },
  gesturecallback(s) {
    chrome.runtime.getBackgroundPage((backgroundPage) => {
      backgroundPage.contexts[d.action] && (s = backgroundPage.contexts[d.action] + s);
      globalThis.SG.callback = null;
      d.gesture = s;
      let t = null;
      if (settings.gestures[s]) {
        t = i18n.t('options_button_overwrite');
        $('#gestureoverwrite')
          .css({ display: 'block' })
          .text(
            i18n.t(
              'options_addgesture_overwrite',
              i18n.t(`action_${settings.gestures[s]}`) ||
                (settings.customactions[settings.gestures[s]]
                  ? settings.customactions[settings.gestures[s]].title
                  : ''),
            ),
          );
      } else {
        t = i18n.t('options_button_addgesture');
        $('#gestureoverwrite').css({ display: 'none' });
      }
      t = settings.gestures[s]
        ? i18n.t('options_button_overwrite')
        : i18n.t('options_button_addgesture');
      if (d.action) {
        $('#doaddgesture').css({ display: 'block' }).text(t);
        $('#chooseaction').css({ display: 'none' });
      } else {
        $('#doaddgesture').css({ display: 'none' });
        $('#chooseaction').css({ display: 'block' });
        $('#chooseaction option:nth-child(1)').prop('disabled', true).text(t);
      }
      $('#canvasdescrip').css({ display: 'none' });
      $('#nowwhat').css({ display: 'block' });
      const n = Math.min((0.8 * window.innerWidth) / 2, (0.8 * window.innerHeight) / 2);
      $('#gesturedisplay')
        .empty()
        .append(drawGesture(s, n, n));
    });
  },
  blockevent(e) {
    e.preventDefault();
  },
  open(e) {
    if (globalThis.SG && !globalThis.SG.callback) {
      d.action = e;
      d.gesture = null;
      globalThis.addEventListener('mousewheel', d.blockevent, false);
      document.addEventListener('keydown', d.blockevent, true);
      $('#canvastitle').text(
        i18n.t(
          'options_addgesture_title',
          i18n.t(`action_${e}`) ||
            (settings.customactions[e] ? settings.customactions[e].title : ''),
        ),
      );
      $('#canvasdescrip li:nth-child(1)').text(
        i18n.t(
          'options_addgesture_instruct_2',
          i18n.t(`options_mousebutton_${settings.holdButton}`),
        ),
      );
      $('#canvasdescrip li:nth-child(2)').text(
        i18n.t(
          'options_addgesture_instruct_3',
          i18n.t(`options_mousebutton_${settings.holdButton}`),
        ),
      );
      $('#drawingcanvas').css({ display: 'block' });
      $('#canvasdescrip').css({ display: 'table' });
      $('#nowwhat').css({ display: 'none' });
      globalThis.SG.callback = d.gesturecallback;
    }
  },
};

const p = (e) => {
  $(
    `.gesture[gesture=${e.replaceAll(':', String.raw`\:`).replaceAll('+', String.raw`\+`)}]`,
  ).remove();
  delete settings.gestures[e];
  index({ gestures: settings.gestures });
  hGesture();
};

const g = [
  {
    id: 'pages',
    actions: [
      'pageBack',
      'pageForward',
      'pageBackClose',
      'reloadTab',
      'reloadTabFull',
      'reloadAllTabs',
      'stop',
      'parentDirectory',
      'pageNext',
      'pagePrevious',
    ],
  },
  {
    id: 'tabs',
    actions: [
      'newTab',
      'newTabLink',
      'newTabBack',
      'navigateTab',
      'closeTab',
      'closeOtherTabs',
      'closeLeftTabs',
      'closeRightTabs',
      'undoClose',
      'cloneTab',
      'newWindow',
      'newWindowLink',
      'closeWindow',
      'previousTab',
      'nextTab',
      'splitTabs',
      'mergeTabs',
      'tabToLeft',
      'tabToRight',
      'togglePin',
      'pin',
      'unpin',
    ],
  },
  {
    id: 'utilities',
    actions: [
      'gotoTop',
      'gotoBottom',
      'pageUp',
      'pageDown',
      'print',
      'parentDirectory',
      'viewSource',
      'showCookies',
      'searchSel',
      'zoomIn',
      'zoomOut',
      'zoomZero',
      'openImage',
      'saveImage',
      'hideImage',
      'zoomImgIn',
      'zoomImgOut',
      'zoomImgZero',
      'findPrevious',
      'findNext',
      'copy',
      'copyLink',
      'toggleBookmark',
      'bookmark',
      'unbookmark',
    ],
  },
  {
    id: 'others',
    actions: [
      'options',
      'fullscreenWindow',
      'minimizeWindow',
      'maximizeWindow',
      'openScreenshot',
      'saveScreenshot',
      'openScreenshotFull',
      'saveScreenshotFull',
      'openHistory',
      'openDownloads',
      'openExtensions',
      'openBookmarks',
    ],
  },
];

const m = () => {
  chrome.runtime.getBackgroundPage((backgroundPage) => {
    for (var t = 0; t < g.length; t += 1) {
      var n = $(`.page[page=${g[t].id}]`);
      $('.action', n).remove();
      for (let s = 0; s < g[t].actions.length; s += 1) {
        var o = g[t].actions[s];
        var a = backgroundPage.contexts[o];
        $('.actiongroup.disabled', n).append(
          $('<div class=action>')
            .attr('action', o)
            .attr('sectionindex', s)
            .append('<div class=gestures>')
            .append(
              $("<div class='button gray addactiongesture' tabindex=0>+</div>").on(
                'click',
                d.open.bind(null, o),
              ),
            )
            .append(
              a
                ? $('<img class=context>').attr(
                    'src',
                    `/img/icon-${a === 'l' ? 'link' : a === 'i' ? 'image' : a === 's' ? 'selection' : ''}.png`,
                  )
                : null,
            )
            .append($('<div class=headtitle>').text(i18n.t(`action_${o}`)))
            .append($('<p class=sub>').text(i18n.t(`descrip_${o}`)))
            .append('<div class=clear>'),
        );
      }
    }
    n = $('.page[page=custom]');
    $('.action', n).remove();
    t = 0;
    for (var o in settings.customactions) {
      const index = settings.customactions[o];
      a = backgroundPage.contexts[o];
      $('.actiongroup.disabled', n).append(
        $('<div class=action>')
          .attr('action', o)
          .attr('sectionindex', t)
          .append(
            $("<div class='button gray delcustomaction' tabindex=0>&times;</div>").on(
              'click',
              r.bind(null, o),
            ),
          )
          .append(
            $("<div class='button gray editcustomaction' tabindex=0>edit</div>").on(
              'click',
              u.bind(null, o),
            ),
          )
          .append('<div class=gestures>')
          .append(
            $("<div class='button gray addactiongesture' tabindex=0>+</div>").on(
              'click',
              d.open.bind(null, o),
            ),
          )
          .append(
            a
              ? $('<img class=context alt="">').attr(
                  'src',
                  `/img/icon-${a === 'l' ? 'link' : a === 'i' ? 'image' : a === 's' ? 'selection' : ''}.png`,
                )
              : null,
          )
          .append($('<div class=headtitle>').text(index.title))
          .append($('<p class=sub>').text(index.descrip))
          .append('<div class=clear>'),
      );
      t += 1;
    }
    hGesture();
  });
};

const hGesture = () => {
  $('.action .gesture').remove();
  for (gesture in settings.gestures) {
    e(gesture);
  }
};

const e = (e) => {
  const n = $(`.action[action=${settings.gestures[e]}]`);
  $('.gestures', n).append(
    $('<div class=gesture>')
      .attr('gesture', e)
      .append(
        $("<div class='button gray removegesture' tabindex=0>&times;</div>").on(
          'click',
          p.bind(null, e),
        ),
      )
      .append(drawGesture(e, 100, 100)),
  );
  if (n.parent().hasClass('disabled')) {
    const t = $('.actiongroup.enabled', n.parent().parent());
    const s = $('.action', t);
    if (s.length === 0) t.append(n);
    else {
      let o = null;
      s.each((e, t) => {
        $(t).attr('sectionindex') < n.attr('sectionindex') &&
          (!o || $(t).attr('sectionindex') > o.attr('sectionindex')) &&
          (o = $(t));
      });
      if (o) {
        n.insertAfter(o);
      } else {
        t.prepend(n);
      }
    }
  }
};
