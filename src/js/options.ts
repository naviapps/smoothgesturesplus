!(function () {
  'update_url' in chrome.runtime.getManifest() && (console.log = console.error = function () {});
  let l = {};
  const i = function (e) {
    for (key in e) l[key] = e[key];
    chrome.storage.local.set(e);
  };
  chrome.storage.local.get(null, function (e) {
    (l = e), chrome.storage.onChanged.addListener(t), o();
  });
  var t = function (e, t) {
    if (t == 'local') {
      for (key in e) l[key] = e[key].newValue;
      (e.license ||
        e.license_expires ||
        e.license_showactivated ||
        e.license_showexpired ||
        e.license_showdeactivated) &&
        f();
    }
  };
  const c = function (e, t) {
    return chrome.i18n.getMessage(e.replace(/-/g, '_'), t);
  };
  chrome.runtime.getBackgroundPage(function (e) {
    e.ping();
  }),
    $(function () {
      for (
        var e, t = $('body').html(), n = 0;
        (e = t.match(/__MSG_([a-zA-Z0-9_\-@]+)(\{\{([^|}]+(\|\|[^|}]+)*)\}\})?__/));

      ) {
        console.log(e);
        const s = [e[1], e[3] ? e[3].split('||') : void 0];
        if (
          ((t = t.replace(
            new RegExp(`__MSG_${e[1]}(\\{\\{([^|}]+(\\|\\|[^|}]+)*)\\}\\})?__`),
            c.apply(null, s),
          )),
          ++n > 500)
        )
          break;
      }
      $('body').html(t);
    });
  const n = function () {
    v(),
      $('#newtab_url.setting select, #newtab_url.setting .button').on('change click', function () {
        let e = $('#newtab_url.setting select').val();
        e == 'custom' && (e = $('#newtab_url.setting input[type=text]').val()),
          !e.match(/:/) && e.match(/\./) && (e = `http://${e}`),
          e.match(/:/) || e == 'homepage' || (e = 'http://www.google.com/'),
          i({ newTabUrl: e }),
          v();
      }),
      $('#newtab_right.setting select').on('change', function () {
        i({ newTabRight: $(this).val() == 1 });
      }),
      $('#newtab_linkright.setting select').on('change', function () {
        i({ newTabLinkRight: $(this).val() == 1 });
      }),
      $('#trail_draw.setting select').on('change', function () {
        i({ trailBlock: $(this).val() != 1 }), v();
      });
    let e = null;
    $(
      '#trail_color_r input[type=range], #trail_color_g input[type=range], #trail_color_b input[type=range], #trail_color_a input[type=range]',
    ).on('change', function () {
      clearTimeout(e),
        (e = setTimeout(function () {
          i({
            trailColor: {
              r: 1 * $('#trail_color_r input').val(),
              g: 1 * $('#trail_color_g input').val(),
              b: 1 * $('#trail_color_b input').val(),
              a: 1 * $('#trail_color_a input').val(),
            },
          }),
            setTimeout(function () {
              v(), h();
            }, 100);
        }, 100));
    });
    let t = null;
    $('#trail_width input[type=range]').on('change', function () {
      clearTimeout(t),
        (t = setTimeout(function () {
          i({ trailWidth: 1 * $('#trail_width input').val() }), v();
        }, 100));
    }),
      $('#trail_style select').on('change', function () {
        i({ trailLegacy: $(this).val() == 'legacy' });
      }),
      $('#force_context.setting select').on('change', function () {
        i({ contextOnLink: $(this).val() == 1 });
      }),
      $('#closelastblock.setting select').on('change', function () {
        i({ closeLastBlock: $(this).val() == 1 });
      }),
      $('#selecttolink.setting select').on('change', function () {
        i({ selectToLink: $(this).val() == 1 });
      }),
      $('#blacklist.setting .button').on('click', function () {
        for (
          var e = $('#blacklist.setting textarea').val().split(/[\n,]/), t = 0;
          t < e.length;
          t++
        )
          e[t] = e[t].trim();
        i({ blacklist: e }), v();
      }),
      $('#blacklist.setting textarea').on('keydown click', function () {
        $('#blacklist.setting .button').css({ visibility: 'visible' });
      }),
      $('#hold_button.setting select').on('change', function () {
        i({ holdButton: $(this).val() });
      }),
      $('#reset.setting .button').on('click', function () {
        confirm(c('setting_warning_reset')) &&
          chrome.runtime.getBackgroundPage(function (e) {
            i({ gestures: JSON.parse(e.defaults['Smooth Gestures'].gestures) }), h(), v();
          });
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
    $('#exportbutton.button').on('click', function () {
      let e = { version: chrome.runtime.getManifest().version, sgplus: {} };
      for (label in l) a.indexOf(label) != -1 && (e.sgplus[label] = l[label]);
      e = btoa(JSON.stringify(e));
      const t = new Blob([e], { type: 'text/plain;charset=utf-8' });
      const n = URL.createObjectURL(t);
      const s = document.createElement('a');
      (s.href = n), (s.download = 'Smooth Gestures Plus Settings.txt');
      const o = document.createEvent('MouseEvents');
      o.initMouseEvent('click', !0, !1, window, 0, 0, 0, 0, 0, !1, !1, !1, !1, 0, null),
        s.dispatchEvent(o),
        URL.revokeObjectURL(n);
    }),
      $('#importbutton.button input[type=file]').on('change', function () {
        if (!(this.files.length <= 0)) {
          const s = new FileReader();
          (s.onload = function (e) {
            $('#importbutton.button input[type=file]').val('');
            const t = s.result;
            let n = null;
            try {
              n = JSON.parse(atob(t));
            } catch (e) {
              (function (e) {
                let t;
                let n;
                try {
                  (e = e.substring(e.indexOf('{'), e.lastIndexOf('}') + 1)),
                    (t = e),
                    ((n = document.createElement('div')).innerHTML = t.replace(
                      /</g,
                      '[leftangle]',
                    )),
                    (e = n.childNodes[0].nodeValue.replace(/\[leftangle\]/g, '<'));
                  const s = JSON.parse(e);
                  if (s.title != 'Smooth Gestures Settings') return !1;
                  for (const o in (s.gestures && (l.gestures = s.gestures), s.settings))
                    a.indexOf(o) != -1 && (l[o] = s.settings[o]);
                  return i(l), alert('Import Successful'), !0;
                } catch (e) {}
                return !1;
              })(t) || alert('Import Failed');
            }
            if (n) {
              for (label in n.sgplus) a.indexOf(label) != -1 && (l[label] = n.sgplus[label]);
              i(l), alert('Import Successful');
            }
            h(), v();
          }),
            s.readAsText(this.files[0]);
        }
      });
  };
  const s = function () {
    $('#extras.setting select').val(l.blockDoubleclickAlert ? 0 : 1);
    const n = navigator.platform.indexOf('Mac') != -1 ? '0.7' : '0.6';
    chrome.runtime.getBackgroundPage(function (e) {
      const t = e.isNative();
      console.log('native', t),
        $('#note_extras_installed').css({
          display: t && (!t.loaded || t.version >= n) ? 'block' : 'none',
        }),
        $('#note_extras_update').css({
          display: t && t.loaded && t.version < n ? 'block' : 'none',
        }),
        $('#note_extras_notinstalled').css({ display: t ? 'none' : 'block' });
    });
  };
  var o = function () {
    $(function () {
      const e = location.hash.replace(/^#(.+)$/, '$1') || l.lastpage || 'config';
      ($.fx.off = !0),
        pages.init(),
        $('.upgradebutton').remove(),
        d.init(),
        $('.addgesture')
          .html(`<span>+</span> ${c('options_button_startaddgesture')}`)
          .click(d.open.bind(null, null)),
        (function () {
          l.showNoteUpdated
            ? ($('#note_updated p:first-child').html(
                c('options_note_updated', [
                  `<span class=sgtitle>${c('name')}<span class=sgplus> plus</span></span>`,
                  chrome.runtime.getManifest().version,
                ]),
              ),
              i({ showNoteUpdated: !1 }))
            : $('#note_updated').css({ display: 'none' });
          const e = 336 - Math.ceil((Date.now() - l.firstinstalled) / 1e3 / 60 / 60);
          l.license && $('#trialperiod').css({ display: 'none' }),
            $('#expirein').append(
              $('<span>')
                .css({
                  'background-color':
                    e < 0
                      ? 'rgba(255,0,0,.2)'
                      : e < 120
                        ? 'rgba(255,255,0,.2)'
                        : 'rgba(0,255,0,.2)',
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
            ),
            (l.hideNoteRemindRate || ['full', '1yrmul'].indexOf(l.license) == -1) &&
              $('.note_remindrate').css({ display: 'none' }),
            $('.note_remindrate .close').click(function () {
              $('.note_remindrate').css({ display: 'none' }), i({ hideNoteRemindRate: !0 });
            }),
            l.hideNotePrint && $('#note_print').css({ display: 'none' }),
            $('#note_print .close').click(function () {
              $('#note_print').css({ display: 'none' }), i({ hideNotePrint: !0 });
            }),
            $('#note_print .button').click(function () {
              window.print();
            }),
            $('.page[page=about] .content').append(
              $('<div>')
                .attr('class', 'footer')
                .html(
                  `You have gestured approximately ${(
                    254e-6 * (l.log.line ? l.log.line.distance : 0)
                  ).toFixed(2)} meters.`,
                ),
            );
        })(),
        (function () {
          for (
            let e = $('.pagesection[pagesection=actions]'),
              t = ['page_navigation', 'tab_management', 'utilities', 'other', 'custom'],
              n = 0;
            n < t.length;
            n++
          ) {
            $('#navactions').append(
              $('<div class=navbutton>')
                .attr('nav', t[n])
                .text(c(`cat_${t[n]}`)),
            );
            const s = $('<div class=page>').attr('page', t[n]);
            s.append($('<div class=pagetitle>').text(c(`cat_${t[n]}`))),
              s.append(
                "<div class=content><div class='actiongroup enabled'></div><div class=actiongrouptitle></div><div class='actiongroup disabled'></div></div>",
              ),
              s.append('<div class=clear>'),
              $('.actiongrouptitle', s).text(c('options_moreactions')),
              s.insertAfter(e),
              (e = s);
          }
          $('.page[page=custom] .pagetitle').append(
            $("<div id=addaction class='button gray'>")
              .html(`<span>+</span> ${c('options_button_addcustomaction')}`)
              .on('click', a),
          ),
            m();
        })(),
        n(),
        (function () {
          s();
          const e = navigator.platform.indexOf('Win') != -1;
          const n = navigator.platform.indexOf('Mac') != -1;
          const t = navigator.platform.indexOf('CrOS') != -1;
          navigator.platform.indexOf('Linux');
          (e || t) &&
            ($('.navbutton[nav=extras]').css({ display: 'none' }),
            $('.page[page=extras]').css({ display: 'none' })),
            $('#extras.setting select').on('change', function () {
              i({ blockDoubleclickAlert: $(this).val() == 0 });
            }),
            $('#installplugin,#updateplugin').click(function () {
              i({ blockDoubleclickAlert: !1 }),
                chrome.permissions.request({ permissions: ['nativeMessaging'] }, function (e) {
                  if (e) {
                    chrome.runtime.getBackgroundPage(function (e) {
                      e.connectNative(1e3);
                    });
                    const t = document.createElement('a');
                    n
                      ? (t.setAttribute('href', '/nat/SmoothGesturesPlusExtras-0.7.dmg'),
                        t.setAttribute('download', 'SmoothGesturesPlusExtras-0.7.dmg'))
                      : (t.setAttribute('href', '/nat/smoothgesturesplus-extras-0.6.tar.gz'),
                        t.setAttribute('download', 'smoothgesturesplus-extras-0.6.tar.gz')),
                      t.click();
                  }
                });
            });
        })(),
        b(),
        $('#currentversion').html(
          c('options_note_updated', [
            `<span class=sgtitle>${c('name')}<span class=sgplus> plus</span></span>`,
            chrome.runtime.getManifest().version,
          ]),
        ),
        pages.show(e),
        setTimeout(function () {
          pages.show(e);
        }, 100),
        setTimeout(function () {
          pages.show(e);
        }, 500),
        setTimeout(function () {
          pages.show(e), ($.fx.off = !1);
        }, 900);
    });
  };
  var a = function () {
    const e = {
      title: 'Navigate to Page',
      descrip: 'Go to Google',
      code: 'location.href = "http://www.google.com";',
      env: 'page',
      share: !0,
      context: '',
    };
    const t = `custom${Math.floor(Math.random() * 2 ** 30).toString(32)}`;
    (l.customactions[t] = e),
      i({ customactions: l.customactions }),
      m(),
      setTimeout(u.bind(null, t), 500);
  };
  const r = function (t) {
    if (confirm('Delete this custom action?')) {
      for (const e in (delete l.customactions[t],
      i({ customactions: l.customactions }),
      l.gestures))
        l.gestures[e] == t && p(e);
      chrome.runtime.getBackgroundPage(function (e) {
        delete e.contexts[t];
      }),
        m();
    }
  };
  var u = function (e) {
    const t = l.customactions[e];
    const n = $(`.action[action=${e}]`);
    $('#customedit').remove(),
      $('.page[page=custom] .action').css({ display: '' }),
      n.css({ display: 'none' }),
      n.after(
        $('<div id=customedit>')
          .append(
            $("<div class='button gray customsave' tabindex=0>")
              .text('save')
              .on('click', function () {
                (t.title = $('.customtitle').val()),
                  (t.descrip = $('.customdescrip').val()),
                  (t.code = $('.customcode').val()),
                  (t.context = $('.customcontext').val()),
                  (l.customactions[e] = t),
                  i({ customactions: l.customactions }),
                  $('#customedit').remove(),
                  $('.page[page=custom] .action').css({ display: '' }),
                  m();
              }),
          )
          .append(
            $("<div class='button gray customcancel' tabindex=0>")
              .text('cancel')
              .on('click', function () {
                $('#customedit').remove(), $('.page[page=custom] .action').css({ display: '' });
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
      $('#drawingcanvas .close').on('click', d.close),
        $('#tryagain').on('click', function () {
          $('#nowwhat').css({ display: 'none' }),
            $('#canvasdescrip').css({ display: 'table' }),
            setTimeout(function () {
              window.SG.callback = d.gesturecallback;
            }, 0);
        }),
        $('#doaddgesture').on('click', d.choose),
        $('#chooseaction').on('change', function () {
          (d.action = $('#chooseaction').val()), d.choose();
        }),
        chrome.runtime.getBackgroundPage(function (e) {
          for (const t in e.categories)
            if (e.categories[t].actions) {
              $('#chooseaction').append($('<option>').text(c(t)).prop('disabled', !0));
              for (let n = 0; n < e.categories[t].actions.length; n++)
                $('#chooseaction').append(
                  $('<option>')
                    .text(`- ${c(`action_${e.categories[t].actions[n]}`)}`)
                    .val(e.categories[t].actions[n]),
                );
            } else if (e.categories[t].customActions)
              for (const s in ($('#chooseaction').append(
                $('<option>').text('Custom Actions').prop('disabled', !0),
              ),
              l.customactions))
                $('#chooseaction').append(
                  $('<option>').text(`- ${l.customactions[s].title}`).val(s),
                );
        });
    },
    close() {
      (d.action = null),
        (d.gesture = null),
        (window.SG.callback = null),
        $('#drawingcanvas').css({ display: 'none' }),
        window.removeEventListener('mousewheel', d.blockevent, !1),
        document.removeEventListener('keydown', d.blockevent, !0);
    },
    choose() {
      d.action &&
        d.gesture &&
        (l.gestures[d.gesture] && p(d.gesture),
        (l.gestures[d.gesture] = d.action),
        i({ gestures: l.gestures }),
        d.close(),
        h());
    },
    gesturecallback(s) {
      chrome.runtime.getBackgroundPage(function (e) {
        e.contexts[d.action] && (s = e.contexts[d.action] + s),
          (window.SG.callback = null),
          (d.gesture = s);
        let t = null;
        l.gestures[s]
          ? ((t = c('options_button_overwrite')),
            $('#gestureoverwrite')
              .css({ display: 'block' })
              .text(
                c(
                  'options_addgesture_overwrite',
                  c(`action_${l.gestures[s]}`) ||
                    (l.customactions[l.gestures[s]] ? l.customactions[l.gestures[s]].title : ''),
                ),
              ))
          : ((t = c('options_button_addgesture')), $('#gestureoverwrite').css({ display: 'none' }));
        t = l.gestures[s] ? c('options_button_overwrite') : c('options_button_addgesture');
        d.action
          ? ($('#doaddgesture').css({ display: 'block' }).text(t),
            $('#chooseaction').css({ display: 'none' }))
          : ($('#doaddgesture').css({ display: 'none' }),
            $('#chooseaction').css({ display: 'block' }),
            $('#chooseaction option:nth-child(1)').prop('disabled', !0).text(t)),
          $('#canvasdescrip').css({ display: 'none' }),
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
      window.SG &&
        !window.SG.callback &&
        ((d.action = e),
        (d.gesture = null),
        window.addEventListener('mousewheel', d.blockevent, !1),
        document.addEventListener('keydown', d.blockevent, !0),
        $('#canvastitle').text(
          c(
            'options_addgesture_title',
            c(`action_${e}`) || (l.customactions[e] ? l.customactions[e].title : ''),
          ),
        ),
        $('#canvasdescrip li:nth-child(1)').text(
          c('options_addgesture_instruct_2', c(`options_mousebutton_${l.holdButton}`)),
        ),
        $('#canvasdescrip li:nth-child(2)').text(
          c('options_addgesture_instruct_3', c(`options_mousebutton_${l.holdButton}`)),
        ),
        $('#drawingcanvas').css({ display: 'block' }),
        $('#canvasdescrip').css({ display: 'table' }),
        $('#nowwhat').css({ display: 'none' }),
        (window.SG.callback = d.gesturecallback));
    },
  };
  var p = function (e) {
    $(`.gesture[gesture=${e.replace(/\:/g, '\\:').replace(/\+/g, '\\+')}]`).remove(),
      delete l.gestures[e],
      i({ gestures: l.gestures }),
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
  var m = function () {
    chrome.runtime.getBackgroundPage(function (e) {
      for (var t = 0; t < g.length; t++) {
        var n = $(`.page[page=${g[t].id}]`);
        $('.action', n).remove();
        for (let s = 0; s < g[t].actions.length; s++) {
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
                        a == 'l' ? 'link' : a == 'i' ? 'image' : a == 's' ? 'selection' : ''
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
      for (var o in l.customactions) {
        const i = l.customactions[o];
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
                ? $('<img class=context>').attr(
                    'src',
                    `/img/icon-${
                      a == 'l' ? 'link' : a == 'i' ? 'image' : a == 's' ? 'selection' : ''
                    }.png`,
                  )
                : null,
            )
            .append($('<div class=headtitle>').text(i.title))
            .append($('<p class=sub>').text(i.descrip))
            .append('<div class=clear>'),
        ),
          t++;
      }
      h();
    });
  };
  var h = function () {
    for (gesture in ($('.action .gesture').remove(), l.gestures)) e(gesture);
  };
  var e = function (e) {
    const n = $(`.action[action=${l.gestures[e]}]`);
    if (
      ($('.gestures', n).append(
        $('<div class=gesture>')
          .attr('gesture', e)
          .append(
            $("<div class='button gray removegesture' tabindex=0>&times;</div>").on(
              'click',
              p.bind(null, e),
            ),
          )
          .append(drawGesture(e, 100, 100)),
      ),
      n.parent().hasClass('disabled'))
    ) {
      const t = $('.actiongroup.enabled', n.parent().parent());
      const s = $('.action', t);
      if (s.length == 0) t.append(n);
      else {
        let o = null;
        s.each(function (e, t) {
          $(t).attr('sectionindex') < n.attr('sectionindex') &&
            (!o || $(t).attr('sectionindex') > o.attr('sectionindex')) &&
            (o = $(t));
        }),
          o ? n.insertAfter(o) : t.prepend(n);
      }
    }
  };
  var v = function () {
    $('#newtab_url.setting select').val(l.newTabUrl),
      $('#newtab_url.setting select').val() != l.newTabUrl
        ? ($('#newtab_url.setting select').val('custom'),
          $('#newtab_url.setting input[type=text]').val(l.newTabUrl),
          $('#newtab_url.setting input[type=text], #newtab_url.setting .button').css({
            display: '',
          }))
        : $('#newtab_url.setting input[type=text], #newtab_url.setting .button').css({
            display: 'none',
          }),
      $('#newtab_right.setting select').val(l.newTabRight ? 1 : 0),
      $('#newtab_linkright.setting select').val(l.newTabLinkRight ? 1 : 0),
      $('#trail_draw.setting select').val(l.trailBlock ? 0 : 1),
      $('#trail_properties').css({ display: l.trailBlock ? 'none' : 'block' }),
      $('#trail_color_r input[type=range]').val(l.trailColor.r),
      $('#trail_color_g input[type=range]').val(l.trailColor.g),
      $('#trail_color_b input[type=range]').val(l.trailColor.b),
      $('#trail_color_a input[type=range]').val(l.trailColor.a),
      $('#trail_width input[type=range]').val(l.trailWidth),
      $('#trail_color_r').css({
        'background-image': `linear-gradient(to right, rgba(0,${l.trailColor.g},${l.trailColor.b},${
          l.trailColor.a
        }), rgba(255,${l.trailColor.g},${l.trailColor.b},${l.trailColor.a}))`,
      }),
      $('#trail_color_g').css({
        'background-image': `linear-gradient(to right, rgba(${l.trailColor.r},0,${l.trailColor.b},${
          l.trailColor.a
        }), rgba(${l.trailColor.r},255,${l.trailColor.b},${l.trailColor.a}))`,
      }),
      $('#trail_color_b').css({
        'background-image': `linear-gradient(to right, rgba(${l.trailColor.r},${l.trailColor.g},0,${
          l.trailColor.a
        }), rgba(${l.trailColor.r},${l.trailColor.g},255,${l.trailColor.a}))`,
      }),
      $('#trail_color_a').css({
        'background-image': `linear-gradient(to right, rgba(${l.trailColor.r},${l.trailColor.g},${
          l.trailColor.b
        },0), rgba(${l.trailColor.r},${l.trailColor.g},${l.trailColor.b},255))`,
      }),
      $('#trail_example')
        .empty()
        .append(drawGesture('URU', 100, 100, l.trailWidth)),
      $('#trail_style select').val(l.trailLegacy ? 'legacy' : 'default'),
      $('#force_context.setting select').val(l.contextOnLink ? 1 : 0),
      $('#closelastblock.setting select').val(l.closeLastBlock ? 1 : 0),
      $('#selecttolink.setting select').val(l.selectToLink ? 1 : 0),
      $('#blacklist.setting textarea').val(l.blacklist.join('\n')),
      $('#hold_button.setting select').val(l.holdButton);
  };
  var b = function () {
    $('#keybutton').on('click', function () {
      $('#keybutton').css({ display: 'none' }), $('#key').css({ display: 'table' });
    }),
      $('#setkey .start').on('click', function () {
        $('#setkey input, #setkey .submit').css({ display: 'block' }),
          $('#setkey .start').css({ display: 'none' });
      }),
      $('#setkey .submit').on('click', function () {
        const e = $('#setkey input').val().toLowerCase().trim();
        e.length < 10 ||
          chrome.storage.sync.set({ token: e }, function () {
            chrome.runtime.getBackgroundPage(function (e) {
              e.ping(),
                $('#setkey input, #setkey .submit').css({ display: '' }),
                $('#setkey .start').css({ display: '' });
            });
          });
      }),
      f();
  };
  var f = function () {
    if (
      ($('.upgradebutton').html(
        `${
          l.license ? 'Buy' : 'Activate'
        } <span class=sgtitle>Smooth Gestures <span class=sgplus>plus<span class=arrow></span></span></span></span>`,
      ),
      setTimeout(function () {
        i({ license_showactivated: !1, license_showexpired: !1, license_showdeactivated: !1 });
      }, 1e3),
      l.license == 'full'
        ? ($('#note_licensestatus .title').html('You have the full license!'),
          $('#note_licensestatus').addClass('green').removeClass('yellow'),
          $('#noplus').css({ display: 'none' }))
        : l.license == '1yrmul'
          ? ($('#note_licensestatus .title').html('You have the 1 year license'),
            $('#note_licensestatus').addClass('green').removeClass('yellow'))
          : l.license == '6mnmul'
            ? ($('#note_licensestatus .title').html('You have the 6 month license'),
              $('#note_licensestatus').addClass('green').removeClass('yellow'))
            : l.license == '1mnmul'
              ? ($('#note_licensestatus .title').html('You have the 1 month license'),
                $('#note_licensestatus').addClass('green').removeClass('yellow'))
              : l.license == '2wkmul'
                ? ($('#note_licensestatus .title').html('You have the 2 week license'),
                  $('#note_licensestatus').addClass('green').removeClass('yellow'))
                : l.license == '1wkmul'
                  ? ($('#note_licensestatus .title').html('You have the 1 week license'),
                    $('#note_licensestatus').addClass('green').removeClass('yellow'))
                  : l.license == '1yr1cl'
                    ? ($('#note_licensestatus .title').html(
                        'You have the 1 year / 1 install license',
                      ),
                      $('#note_licensestatus').addClass('green').removeClass('yellow'))
                    : l.license == '1mn1cl'
                      ? ($('#note_licensestatus .title').html(
                          'You have the 1 month / 1 install license',
                        ),
                        $('#note_licensestatus').addClass('green').removeClass('yellow'))
                      : l.license == '1wk1cl'
                        ? ($('#note_licensestatus .title').html(
                            'You have the 1 week / 1 install license',
                          ),
                          $('#note_licensestatus').addClass('green').removeClass('yellow'))
                        : l.license == 'free'
                          ? ($('#note_licensestatus .title').html('You have the free license'),
                            $('#note_licensestatus').addClass('green').removeClass('yellow'))
                          : l.license
                            ? ($('#note_licensestatus .title').html('You have an unknown license'),
                              $('#note_licensestatus').addClass('yellow').removeClass('green'),
                              $('#nolicense').css({ display: 'block' }))
                            : ($('#note_licensestatus .title').html(
                                'You do not have an active license',
                              ),
                              $('#note_licensestatus').addClass('yellow').removeClass('green')),
      l.license_expires)
    ) {
      const e = (l.license_expires - Date.now()) / 1e3 / 60 / 60;
      $('#note_licensestatus .descrip').html(
        `This license expires in ${
          e > 24 ? `${Math.round(e / 24)} days` : `${Math.round(2 * e) / 2} hours`
        }`,
      );
    } else
      $('#note_licensestatus .descrip').html(
        '<span class="sgtitle">Smooth Gestures <span class="sgplus">plus</span></span> enables quick and easy control of your web browser through mouse gestures.',
      );
    $('#showkey').css({ display: l.license ? '' : 'none' }),
      $('#keybutton').css({ display: '' }),
      $('#key').css({ display: '' }),
      chrome.storage.sync.get(null, function (e) {
        $('#key')
          .html(`Save this key: <span class=key>${e.token || 'no license key'}</span>`)
          .css({ display: 'none' });
        !l.license && e.token ? e.token : e.invalidtoken != e.token && e.invalidtoken;
      }),
      $('#clid').text(`id: ${l.id}z${l.firstinstalled.toString(32)}`);
  };
})();
