let settings = {};
const index = (e) => {
  for (key in e) {
    settings[key] = e[key];
  }
  chrome.storage.local.set(e);
};
chrome.storage.local.get(null, (items) => {
  settings = items;
  chrome.storage.onChanged.addListener(t);
  o();
});

const t = (changes, areaName) => {
  if (areaName === 'local') {
    for (key in changes) {
      settings[key] = changes[key].newValue;
    }
  }
};

const c = (e, t) => {
  return chrome.i18n.getMessage(e.replaceAll('-', '_'), t);
};

$(() => {
  const e = t.match(/__MSG_([a-zA-Z0-9_\-@]+)(\{\{([^|}]+(\|\|[^|}]+)*)\}\})?__/);
  let t = $('body').html();
  for (let n = 0; e; ) {
    const s = [e[1], e[3] ? e[3].split('||') : undefined];
    t = t.replace(new RegExp(`__MSG_${e[1]}(\\{\\{([^|}]+(\\|\\|[^|}]+)*)\\}\\})?__`), c.apply(null, s));
    if (++n > 500) {
      break;
    }
  }
  $('body').html(t);
});

const n = () => {
  initialize();
  $('#newtab_url.setting select, #newtab_url.setting .button').on('change click', () => {
    let e = $('#newtab_url.setting select').val();
    if (e === 'custom') {
      e = $('#newtab_url.setting input[type=text]').val();
    }
    if (!/:/.test(e) && /\./.test(e)) {
      e = `http://${e}`;
    }
    if (!/:/.test(e) && e !== 'homepage') {
      e = 'http://www.google.com/';
    }
    index({ newTabUrl: e });
    initialize();
  });
  $('#newtab_right.setting select').on('change', () => {
    index({ newTabRight: $(this).val() == 1 });
  });
  $('#newtab_linkright.setting select').on('change', () => {
    index({ newTabLinkRight: $(this).val() == 1 });
  });
  $('#trail_draw.setting select').on('change', () => {
    index({ trailBlock: $(this).val() != 1 });
    initialize();
  });
  let e = null;
  $(
    '#trail_color_r input[type=range], #trail_color_g input[type=range], #trail_color_b input[type=range], #trail_color_a input[type=range]',
  ).on('change', () => {
    clearTimeout(e);
    e = setTimeout(() => {
      index({
        trailColor: {
          r: 1 * $('#trail_color_r input').val(),
          g: 1 * $('#trail_color_g input').val(),
          b: 1 * $('#trail_color_b input').val(),
          a: 1 * $('#trail_color_a input').val(),
        },
      });
      setTimeout(() => {
        initialize();
        h();
      }, 100);
    }, 100);
  });
  let t = null;
  $('#trail_width input[type=range]').on('change', () => {
    clearTimeout(t);
    t = setTimeout(() => {
      index({ trailWidth: 1 * $('#trail_width input').val() });
      initialize();
    }, 100);
  });
  $('#trail_style select').on('change', () => {
    index({ trailLegacy: $(this).val() === 'legacy' });
  });
  $('#force_context.setting select').on('change', () => {
    index({ contextOnLink: $(this).val() == 1 });
  });
  $('#closelastblock.setting select').on('change', () => {
    index({ closeLastBlock: $(this).val() == 1 });
  });
  $('#selecttolink.setting select').on('change', () => {
    index({ selectToLink: $(this).val() == 1 });
  });
  $('#blacklist.setting .button').on('click', () => {
    const e = $('#blacklist.setting textarea').val().split(/[\n,]/);
    for (let t = 0; t < e.length; t += 1) {
      e[t] = e[t].trim();
    }
    index({ blacklist: e });
    initialize();
  });
  $('#blacklist.setting textarea').on('keydown click', () => {
    $('#blacklist.setting .button').css({ visibility: 'visible' });
  });
  $('#hold_button.setting select').on('change', () => {
    index({ holdButton: $(this).val() });
  });
  $('#reset.setting .button').on('click', () => {
    if (confirm(c('setting_warning_reset'))) {
      chrome.runtime.getBackgroundPage((backgroundPage) => {
        index({ gestures: JSON.parse(backgroundPage.defaults.gestures) });
        h();
        initialize();
      });
    }
  });
  const a = new Set([
    'gestures',
    'customactions',
    'blacklist',
    'contextOnLink',
    'holdButton',
    'newTabLinkRight',
    'newTabRight',
    'newTabUrl',
    'selectToLink',
    'trailBlock',
    'trailColor',
    'trailWidth',
    'trailLegacy',
  ]);
  $('#exportbutton.button').on('click', () => {
    let e = { version: chrome.runtime.getManifest().version, sgplus: {} };
    for (label in settings) a.has(label) && (e.sgplus[label] = settings[label]);
    e = btoa(JSON.stringify(e));
    const t = new Blob([e], { type: 'text/plain;charset=utf-8' });
    const n = URL.createObjectURL(t);
    const s = document.createElement('a');
    s.href = n;
    s.download = 'Smooth Gestures Plus Settings.txt';
    const o = document.createEvent('MouseEvents');
    o.initMouseEvent('click', true, false, globalThis, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    s.dispatchEvent(o);
    URL.revokeObjectURL(n);
  });
  $('#importbutton.button input[type=file]').on('change', () => {
    if (!(this.files.length <= 0)) {
      const s = new FileReader();
      s.addEventListener('load', (e) => {
        $('#importbutton.button input[type=file]').val('');
        const t = s.result;
        let n = null;
        try {
          n = JSON.parse(atob(t));
        } catch {
          ((e) => {
            let t;
            let n;
            try {
              e = e.substring(e.indexOf('{'), e.lastIndexOf('}') + 1);
              t = e;
              n = document.createElement('div');
              n.innerHTML = t.replaceAll('<', '[leftangle]');
              e = n.childNodes[0].nodeValue.replaceAll('[leftangle]', '<');
              const s = JSON.parse(e);
              if (s.title !== 'Smooth Gestures Settings') {
                return false;
              }
              if (s.gestures) {
                settings.gestures = s.gestures;
              }
              for (const o in s.settings) {
                if (a.has(o)) {
                  settings[o] = s.settings[o];
                }
              }
              index(settings);
              alert('Import Successful');
              return true;
            } catch {}
            return false;
          })(t) || alert('Import Failed');
        }
        if (n) {
          for (label in n.sgplus) {
            if (a.has(label)) {
              settings[label] = n.sgplus[label];
            }
          }
          index(settings);
          alert('Import Successful');
        }
        h();
        initialize();
      });
      s.readAsText(this.files[0]);
    }
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
    const e = globalThis.location.hash.replace(/^#(.+)$/, '$1') || settings.lastpage || 'config';
    $.fx.off = true;
    pages.init();
    $('.upgradebutton').remove();
    d.init();
    $('.addgesture')
      .html(`<span>+</span> ${c('options_button_startaddgesture')}`)
      .click(d.open.bind(null, null));
    (() => {
      if (settings.showNoteUpdated) {
        $('#note_updated p:first-child').html(
          c('options_note_updated', [
            `<span class=sgtitle>${c('name')}<span class=sgplus> plus</span></span>`,
            chrome.runtime.getManifest().version,
          ]),
        );
        index({ showNoteUpdated: false });
      } else {
        $('#note_updated').css({ display: 'none' });
      }
      const e = 336 - Math.ceil((Date.now() - settings.firstinstalled) / 1000 / 60 / 60);
      $('#expirein').append(
        $('<span>')
          .css({
            'background-color': e < 0 ? 'rgba(255,0,0,.2)' : e < 120 ? 'rgba(255,255,0,.2)' : 'rgba(0,255,0,.2)',
            'font-weight': 'bold',
          })
          .text(
            `Your trial period ${
              e < 0
                ? 'has expired'
                : `will expire in ${
                    e >= 24 ? `${Math.round(e / 24)} days` : e > 0 ? `${e} hours` : 'less than an hour'
                  }`
            }`,
          ),
      );
      $('.note_remindrate .close').click(() => {
        $('.note_remindrate').css({ display: 'none' });
        index({ hideNoteRemindRate: true });
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
      for (
        let e = $('.pagesection[pagesection=actions]'),
          t = ['page_navigation', 'tab_management', 'utilities', 'other', 'custom'],
          n = 0;
        n < t.length;
        n += 1
      ) {
        $('#navactions').append(
          $('<div class=navbutton>')
            .attr('nav', t[n])
            .text(c(`cat_${t[n]}`)),
        );
        const s = $('<div class=page>').attr('page', t[n]);
        s.append($('<div class=pagetitle>').text(c(`cat_${t[n]}`)));
        s.append(
          "<div class=content><div class='actiongroup enabled'></div><div class=actiongrouptitle></div><div class='actiongroup disabled'></div></div>",
        );
        s.append('<div class=clear>');
        $('.actiongrouptitle', s).text(c('options_moreactions'));
        s.insertAfter(e);
        e = s;
      }
      $('.page[page=custom] .pagetitle').append(
        $("<div id=addaction class='button gray'>")
          .html(`<span>+</span> ${c('options_button_addcustomaction')}`)
          .on('click', a),
      );
      m();
    })();
    n();
    (() => {
      s();
      const e = navigator.platform.includes('Win');
      const n = navigator.platform.includes('Mac');
      const t = navigator.platform.includes('CrOS');
      navigator.platform.indexOf('Linux');
      if (e || t) {
        $('.navbutton[nav=extras]').css({ display: 'none' });
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
            if (n) {
              t.setAttribute('href', '/nat/SmoothGesturesPlusExtras-0.7.dmg');
              t.setAttribute('download', 'SmoothGesturesPlusExtras-0.7.dmg');
            } else {
              t.setAttribute('href', '/nat/smoothgesturesplus-extras-0.6.tar.gz');
              t.setAttribute('download', 'smoothgesturesplus-extras-0.6.tar.gz');
            }
            t.click();
          }
        });
      });
    })();
    $('#currentversion').html(
      c('options_note_updated', [
        `<span class=sgtitle>${c('name')}<span class=sgplus> plus</span></span>`,
        chrome.runtime.getManifest().version,
      ]),
    );
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
      for (const t in backgroundPage.categories)
        if (backgroundPage.categories[t].actions) {
          $('#chooseaction').append($('<option>').text(c(t)).prop('disabled', true));
          for (let n = 0; n < backgroundPage.categories[t].actions.length; n += 1)
            $('#chooseaction').append(
              $('<option>')
                .text(`- ${c(`action_${backgroundPage.categories[t].actions[n]}`)}`)
                .val(backgroundPage.categories[t].actions[n]),
            );
        } else if (backgroundPage.categories[t].customActions) {
          $('#chooseaction').append($('<option>').text('Custom Actions').prop('disabled', true));
          for (const s in settings.customactions) {
            $('#chooseaction').append($('<option>').text(`- ${settings.customactions[s].title}`).val(s));
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
      h();
    }
  },
  gesturecallback(s) {
    chrome.runtime.getBackgroundPage((backgroundPage) => {
      backgroundPage.contexts[d.action] && (s = backgroundPage.contexts[d.action] + s);
      globalThis.SG.callback = null;
      d.gesture = s;
      let t = null;
      if (settings.gestures[s]) {
        t = c('options_button_overwrite');
        $('#gestureoverwrite')
          .css({ display: 'block' })
          .text(
            c(
              'options_addgesture_overwrite',
              c(`action_${settings.gestures[s]}`) ||
                (settings.customactions[settings.gestures[s]]
                  ? settings.customactions[settings.gestures[s]].title
                  : ''),
            ),
          );
      } else {
        t = c('options_button_addgesture');
        $('#gestureoverwrite').css({ display: 'none' });
      }
      t = settings.gestures[s] ? c('options_button_overwrite') : c('options_button_addgesture');
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
        c(
          'options_addgesture_title',
          c(`action_${e}`) || (settings.customactions[e] ? settings.customactions[e].title : ''),
        ),
      );
      $('#canvasdescrip li:nth-child(1)').text(
        c('options_addgesture_instruct_2', c(`options_mousebutton_${settings.holdButton}`)),
      );
      $('#canvasdescrip li:nth-child(2)').text(
        c('options_addgesture_instruct_3', c(`options_mousebutton_${settings.holdButton}`)),
      );
      $('#drawingcanvas').css({ display: 'block' });
      $('#canvasdescrip').css({ display: 'table' });
      $('#nowwhat').css({ display: 'none' });
      globalThis.SG.callback = d.gesturecallback;
    }
  },
};

const p = (e) => {
  $(`.gesture[gesture=${e.replaceAll(':', String.raw`\:`).replaceAll('+', String.raw`\+`)}]`).remove();
  delete settings.gestures[e];
  index({ gestures: settings.gestures });
  h();
};

const g = [
  {
    id: 'page_navigation',
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
    id: 'tab_management',
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
    id: 'other',
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
            .append($("<div class='button gray addactiongesture' tabindex=0>+</div>").on('click', d.open.bind(null, o)))
            .append(
              a
                ? $('<img class=context>').attr(
                    'src',
                    `/img/icon-${a === 'l' ? 'link' : a === 'i' ? 'image' : a === 's' ? 'selection' : ''}.png`,
                  )
                : null,
            )
            .append($('<div class=headtitle>').text(c(`action_${o}`)))
            .append($('<p class=sub>').text(c(`descrip_${o}`)))
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
          .append($("<div class='button gray delcustomaction' tabindex=0>&times;</div>").on('click', r.bind(null, o)))
          .append($("<div class='button gray editcustomaction' tabindex=0>edit</div>").on('click', u.bind(null, o)))
          .append('<div class=gestures>')
          .append($("<div class='button gray addactiongesture' tabindex=0>+</div>").on('click', d.open.bind(null, o)))
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
    h();
  });
};

const h = () => {
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
      .append($("<div class='button gray removegesture' tabindex=0>&times;</div>").on('click', p.bind(null, e)))
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

const initialize = () => {
  $('#newtab_url.setting select').val(settings.newTabUrl);
  if ($('#newtab_url.setting select').val() === settings.newTabUrl) {
    $('#newtab_url.setting input[type=text], #newtab_url.setting .button').css({
      display: 'none',
    });
  } else {
    $('#newtab_url.setting select').val('custom');
    $('#newtab_url.setting input[type=text]').val(settings.newTabUrl);
    $('#newtab_url.setting input[type=text], #newtab_url.setting .button').css({
      display: '',
    });
  }
  $('#newtab_right.setting select').val(settings.newTabRight ? 1 : 0);
  $('#newtab_linkright.setting select').val(settings.newTabLinkRight ? 1 : 0);
  $('#trail_draw.setting select').val(settings.trailBlock ? 0 : 1);
  $('#trail_properties').css({ display: settings.trailBlock ? 'none' : 'block' });
  $('#trail_color_r input[type=range]').val(settings.trailColor.r);
  $('#trail_color_g input[type=range]').val(settings.trailColor.g);
  $('#trail_color_b input[type=range]').val(settings.trailColor.b);
  $('#trail_color_a input[type=range]').val(settings.trailColor.a);
  $('#trail_width input[type=range]').val(settings.trailWidth);
  $('#trail_color_r').css({
    'background-image': `linear-gradient(to right, rgba(0,${settings.trailColor.g},${settings.trailColor.b},${
      settings.trailColor.a
    }), rgba(255,${settings.trailColor.g},${settings.trailColor.b},${settings.trailColor.a}))`,
  });
  $('#trail_color_g').css({
    'background-image': `linear-gradient(to right, rgba(${settings.trailColor.r},0,${settings.trailColor.b},${
      settings.trailColor.a
    }), rgba(${settings.trailColor.r},255,${settings.trailColor.b},${settings.trailColor.a}))`,
  });
  $('#trail_color_b').css({
    'background-image': `linear-gradient(to right, rgba(${settings.trailColor.r},${settings.trailColor.g},0,${
      settings.trailColor.a
    }), rgba(${settings.trailColor.r},${settings.trailColor.g},255,${settings.trailColor.a}))`,
  });
  $('#trail_color_a').css({
    'background-image': `linear-gradient(to right, rgba(${settings.trailColor.r},${settings.trailColor.g},${
      settings.trailColor.b
    },0), rgba(${settings.trailColor.r},${settings.trailColor.g},${settings.trailColor.b},255))`,
  });
  $('#trail_example')
    .empty()
    .append(drawGesture('URU', 100, 100, settings.trailWidth));
  $('#trail_style select').val(settings.trailLegacy ? 'legacy' : 'default');
  $('#force_context.setting select').val(settings.contextOnLink ? 1 : 0);
  $('#closelastblock.setting select').val(settings.closeLastBlock ? 1 : 0);
  $('#selecttolink.setting select').val(settings.selectToLink ? 1 : 0);
  $('#blacklist.setting textarea').val(settings.blacklist.join('\n'));
  $('#hold_button.setting select').val(settings.holdButton);
};
