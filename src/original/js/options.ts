let settings = {};
const i = (e) => {
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
  return chrome.i18n.getMessage(e.replace(/-/g, '_'), t);
};

chrome.runtime.getBackgroundPage((e) => {
  e.ping();
});

$(() => {
  const e = t.match(/__MSG_([a-zA-Z0-9_\-@]+)(\{\{([^|}]+(\|\|[^|}]+)*)\}\})?__/);
  let t = $('body').html();
  for (let n = 0; e; ) {
    console.log(e);
    const s = [e[1], e[3] ? e[3].split('||') : undefined];
    t = t.replace(
      new RegExp(`__MSG_${e[1]}(\\{\\{([^|}]+(\\|\\|[^|}]+)*)\\}\\})?__`),
      c.apply(null, s),
    );
    if (++n > 500) {
      break;
    }
  }
  $('body').html(t);
});

const n = () => {
  v();
  $('#newtab_url.setting select, #newtab_url.setting .button').on('change click', () => {
    let e = $('#newtab_url.setting select').val();
    if (e === 'custom') {
      e = $('#newtab_url.setting input[type=text]').val();
    }
    if (!e.match(/:/) && e.match(/\./)) {
      e = `http://${e}`;
    }
    if (!e.match(/:/) && e !== 'homepage') {
      e = 'http://www.google.com/';
    }
    i({ newTabUrl: e });
    v();
  });
  $('#newtab_right.setting select').on('change', () => {
    i({ newTabRight: $(this).val() == 1 });
  });
  $('#newtab_linkright.setting select').on('change', () => {
    i({ newTabLinkRight: $(this).val() == 1 });
  });
  $('#trail_draw.setting select').on('change', () => {
    i({ trailBlock: $(this).val() != 1 });
    v();
  });
  let e = null;
  $(
    '#trail_color_r input[type=range], #trail_color_g input[type=range], #trail_color_b input[type=range], #trail_color_a input[type=range]',
  ).on('change', () => {
    clearTimeout(e);
    e = setTimeout(() => {
      i({
        trailColor: {
          r: 1 * $('#trail_color_r input').val(),
          g: 1 * $('#trail_color_g input').val(),
          b: 1 * $('#trail_color_b input').val(),
          a: 1 * $('#trail_color_a input').val(),
        },
      });
      setTimeout(() => {
        v();
        h();
      }, 100);
    }, 100);
  });
  let t = null;
  $('#trail_width input[type=range]').on('change', () => {
    clearTimeout(t);
    t = setTimeout(() => {
      i({ trailWidth: 1 * $('#trail_width input').val() });
      v();
    }, 100);
  });
  $('#trail_style select').on('change', () => {
    i({ trailLegacy: $(this).val() === 'legacy' });
  });
  $('#force_context.setting select').on('change', () => {
    i({ contextOnLink: $(this).val() == 1 });
  });
  $('#closelastblock.setting select').on('change', () => {
    i({ closeLastBlock: $(this).val() == 1 });
  });
  $('#selecttolink.setting select').on('change', () => {
    i({ selectToLink: $(this).val() == 1 });
  });
  $('#blacklist.setting .button').on('click', () => {
    const e = $('#blacklist.setting textarea').val().split(/[\n,]/);
    for (let t = 0; t < e.length; t += 1) {
      e[t] = e[t].trim();
    }
    i({ blacklist: e });
    v();
  });
  $('#blacklist.setting textarea').on('keydown click', () => {
    $('#blacklist.setting .button').css({ visibility: 'visible' });
  });
  $('#hold_button.setting select').on('change', () => {
    i({ holdButton: $(this).val() });
  });
  $('#reset.setting .button').on('click', () => {
    if (confirm(c('setting_warning_reset'))) {
      chrome.runtime.getBackgroundPage((e) => {
        i({ gestures: JSON.parse(e.defaults.gestures) });
        h();
        v();
      });
    }
  });
  const a = [
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
  ];
  $('#exportbutton.button').on('click', () => {
    let e = { version: chrome.runtime.getManifest().version, sgplus: {} };
    for (label in settings) a.indexOf(label) !== -1 && (e.sgplus[label] = settings[label]);
    e = btoa(JSON.stringify(e));
    const t = new Blob([e], { type: 'text/plain;charset=utf-8' });
    const n = URL.createObjectURL(t);
    const s = document.createElement('a');
    s.href = n;
    s.download = 'Smooth Gestures Plus Settings.txt';
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
    s.dispatchEvent(o);
    URL.revokeObjectURL(n);
  });
  $('#importbutton.button input[type=file]').on('change', () => {
    if (!(this.files.length <= 0)) {
      const s = new FileReader();
      s.onload = (e) => {
        $('#importbutton.button input[type=file]').val('');
        const t = s.result;
        let n = null;
        try {
          n = JSON.parse(atob(t));
        } catch (e) {
          ((e) => {
            let t;
            let n;
            try {
              e = e.substring(e.indexOf('{'), e.lastIndexOf('}') + 1);
              t = e;
              n = document.createElement('div');
              n.innerHTML = t.replace(/</g, '[leftangle]');
              e = n.childNodes[0].nodeValue.replace(/\[leftangle\]/g, '<');
              const s = JSON.parse(e);
              if (s.title !== 'Smooth Gestures Settings') {
                return false;
              }
              if (s.gestures) {
                settings.gestures = s.gestures;
              }
              for (const o in s.settings) {
                if (a.indexOf(o) !== -1) {
                  settings[o] = s.settings[o];
                }
              }
              i(settings);
              alert('Import Successful');
              return true;
            } catch (e) {}
            return false;
          })(t) || alert('Import Failed');
        }
        if (n) {
          for (label in n.sgplus) {
            if (a.indexOf(label) !== -1) {
              settings[label] = n.sgplus[label];
            }
          }
          i(settings);
          alert('Import Successful');
        }
        h();
        v();
      };
      s.readAsText(this.files[0]);
    }
  });
};

const s = () => {
  $('#extras.setting select').val(settings.blockDoubleclickAlert ? 0 : 1);
  const n = navigator.platform.indexOf('Mac') !== -1 ? '0.7' : '0.6';
  chrome.runtime.getBackgroundPage((e) => {
    const t = e.isNative();
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
    const e = window.location.hash.replace(/^#(.+)$/, '$1') || settings.lastpage || 'config';
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
        i({ showNoteUpdated: false });
      } else {
        $('#note_updated').css({ display: 'none' });
      }
      const e = 336 - Math.ceil((Date.now() - settings.firstinstalled) / 1000 / 60 / 60);
      $('#expirein').append(
        $('<span>')
          .css({
            'background-color':
              e < 0 ? 'rgba(255,0,0,.2)' : e < 120 ? 'rgba(255,255,0,.2)' : 'rgba(0,255,0,.2)',
            'font-weight': 'bold',
          })
          .text(
            `Your trial period ${
              e < 0
                ? 'has expired'
                : `will expire in ${
                    e >= 24
                      ? `${Math.round(e / 24)} days`
                      : e > 0
                        ? `${e} hours`
                        : 'less than an hour'
                  }`
            }`,
          ),
      );
      $('.note_remindrate .close').click(() => {
        $('.note_remindrate').css({ display: 'none' });
        i({ hideNoteRemindRate: true });
      });
      settings.hideNotePrint && $('#note_print').css({ display: 'none' });
      $('#note_print .close').click(() => {
        $('#note_print').css({ display: 'none' });
        i({ hideNotePrint: true });
      });
      $('#note_print .button').click(() => {
        window.print();
      });
      $('.page[page=about] .content').append(
        $('<div>')
          .attr('class', 'footer')
          .html(
            `You have gestured approximately ${(
              254e-6 * (settings.log.line ? settings.log.line.distance : 0)
            ).toFixed(2)} meters.`,
          ),
      );
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
      const e = navigator.platform.indexOf('Win') !== -1;
      const n = navigator.platform.indexOf('Mac') !== -1;
      const t = navigator.platform.indexOf('CrOS') !== -1;
      navigator.platform.indexOf('Linux');
      if (e || t) {
        $('.navbutton[nav=extras]').css({ display: 'none' });
        $('.page[page=extras]').css({ display: 'none' });
      }
      $('#extras.setting select').on('change', () => {
        i({ blockDoubleclickAlert: $(this).val() === 0 });
      });
      $('#installplugin,#updateplugin').click(() => {
        i({ blockDoubleclickAlert: false });
        chrome.permissions.request({ permissions: ['nativeMessaging'] }, (e) => {
          if (e) {
            chrome.runtime.getBackgroundPage((e) => {
              e.connectNative(1000);
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
  i({ customactions: settings.customactions });
  m();
  setTimeout(u.bind(null, t), 500);
};

const r = (t) => {
  if (confirm('Delete this custom action?')) {
    delete settings.customactions[t];
    i({ customactions: settings.customactions });
    for (const e in settings.gestures) {
      settings.gestures[e] === t && p(e);
    }
    chrome.runtime.getBackgroundPage((e) => {
      delete e.contexts[t];
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
            i({ customactions: settings.customactions });
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
        window.SG.callback = d.gesturecallback;
      }, 0);
    });
    $('#doaddgesture').on('click', d.choose);
    $('#chooseaction').on('change', () => {
      d.action = $('#chooseaction').val();
      d.choose();
    });
    chrome.runtime.getBackgroundPage((e) => {
      for (const t in e.categories)
        if (e.categories[t].actions) {
          $('#chooseaction').append($('<option>').text(c(t)).prop('disabled', true));
          for (let n = 0; n < e.categories[t].actions.length; n += 1)
            $('#chooseaction').append(
              $('<option>')
                .text(`- ${c(`action_${e.categories[t].actions[n]}`)}`)
                .val(e.categories[t].actions[n]),
            );
        } else if (e.categories[t].customActions) {
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
    window.SG.callback = null;
    $('#drawingcanvas').css({ display: 'none' });
    window.removeEventListener('mousewheel', d.blockevent, false);
    document.removeEventListener('keydown', d.blockevent, true);
  },
  choose() {
    if (d.action && d.gesture) {
      if (settings.gestures[d.gesture]) {
        p(d.gesture);
      }
      settings.gestures[d.gesture] = d.action;
      i({ gestures: settings.gestures });
      d.close();
      h();
    }
  },
  gesturecallback(s) {
    chrome.runtime.getBackgroundPage((e) => {
      e.contexts[d.action] && (s = e.contexts[d.action] + s);
      window.SG.callback = null;
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
    if (window.SG && !window.SG.callback) {
      d.action = e;
      d.gesture = null;
      window.addEventListener('mousewheel', d.blockevent, false);
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
      window.SG.callback = d.gesturecallback;
    }
  },
};

const p = (e) => {
  $(`.gesture[gesture=${e.replace(/\:/g, '\\:').replace(/\+/g, '\\+')}]`).remove();
  delete settings.gestures[e];
  i({ gestures: settings.gestures });
  h();
};

const g = [
  {
    id: 'page_navigation',
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
  {
    id: 'tab_management',
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
  {
    id: 'utilities',
    actions: [
      'goto-top',
      'goto-bottom',
      'page-up',
      'page-down',
      'print',
      'parent-dir',
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
  {
    id: 'other',
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
];

const m = () => {
  chrome.runtime.getBackgroundPage((e) => {
    for (var t = 0; t < g.length; t += 1) {
      var n = $(`.page[page=${g[t].id}]`);
      $('.action', n).remove();
      for (let s = 0; s < g[t].actions.length; s += 1) {
        var o = g[t].actions[s];
        var a = e.contexts[o];
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
                    `/img/icon-${
                      a === 'l' ? 'link' : a === 'i' ? 'image' : a === 's' ? 'selection' : ''
                    }.png`,
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
      const i = settings.customactions[o];
      a = e.contexts[o];
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
                  `/img/icon-${
                    a === 'l' ? 'link' : a === 'i' ? 'image' : a === 's' ? 'selection' : ''
                  }.png`,
                )
              : null,
          )
          .append($('<div class=headtitle>').text(i.title))
          .append($('<p class=sub>').text(i.descrip))
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
    if (s.length == 0) t.append(n);
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

const v = () => {
  $('#newtab_url.setting select').val(settings.newTabUrl);
  if ($('#newtab_url.setting select').val() !== settings.newTabUrl) {
    $('#newtab_url.setting select').val('custom');
    $('#newtab_url.setting input[type=text]').val(settings.newTabUrl);
    $('#newtab_url.setting input[type=text], #newtab_url.setting .button').css({
      display: '',
    });
  } else {
    $('#newtab_url.setting input[type=text], #newtab_url.setting .button').css({
      display: 'none',
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
