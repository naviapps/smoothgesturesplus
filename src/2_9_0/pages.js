!(() => {
  var t = null,
    n = { elem: null, offset: 0 },
    c = () => {
      $('#sidebar').css({ display: 'none' }),
        (n.elem = document.elementFromPoint(
          0.6 * window.innerWidth,
          0 * window.innerHeight,
        )),
        (n.offset =
          Math.max(
            document.documentElement.scrollTop,
            document.body.scrollTop,
          ) +
          0 * window.innerHeight -
          $(n.elem).offset().top),
        $('#sidebar').css({ display: '' })
    },
    o = () => {
      if (n.elem) {
        var o =
          Math.max(
            document.documentElement.scrollTop,
            document.body.scrollTop,
          ) +
          0 * window.innerHeight -
          $(n.elem).offset().top
        ;(document.body.scrollTop += n.offset - o),
          (document.documentElement.scrollTop += n.offset - o)
      }
    },
    e = () => {
      if (!$('html, body').is(':animated')) {
        c(), $('html, body').stop()
        for (var o = $('.page'), n = 0; n < o.length; n++) {
          var e = $(o[n])
          if ('none' != e.css('display')) {
            var t = e.attr('page'),
              i = Math.round(
                Math.max(
                  document.documentElement.scrollTop,
                  document.body.scrollTop,
                ) +
                  window.innerHeight -
                  e.position().top -
                  e.height(),
              ),
              a = Math.round(
                Math.max(
                  document.documentElement.scrollTop,
                  document.body.scrollTop,
                ) - e.position().top,
              )
            if (
              i <= window.innerHeight / 2 + 25 &&
              a > -window.innerHeight / 2 - 25
            ) {
              s(t)
              break
            }
          }
        }
      }
    },
    i = () => {
      'function' == typeof pages.onresize && pages.onresize(), o(), e()
    },
    s = (o) => {
      ;(t = o),
        (location.hash = '#' + o),
        $('.navbutton.active').removeClass('active'),
        $('.navbutton[nav=' + o + ']').addClass('active'),
        'function' == typeof pages.onactive && pages.onactive(o)
    }
  $.easing.easeInExp = (o, n, e, t, i) => {
    return 0 == n ? e : t * Math.pow(2, 10 * (n / i - 1)) + e
  }
  var a = (o, n) => {
    o =
      o ||
      location.hash.replace(/^#(.+)$/, '$1') ||
      document.querySelector('.page').page
    var e = $('[page=' + o + ']')
    1 == e.length &&
      (o != t && s(o),
      e.position().top !=
        Math.max(document.documentElement.scrollTop, document.body.scrollTop) &&
        $('html, body')
          .stop()
          .animate({ scrollTop: e.position().top }, n || 0, 'easeInExp'))
  }
  window.pages = {
    init: () => {
      $(() => {
        $(window).on('mousewheel', (o) => {
          $('html, body').stop()
        }),
          $(window).on('scroll', e),
          $(window).on('resize', i),
          $('.navbutton').on('click', () => {
            a($(this).attr('nav'), 300)
          }),
          $(window).on('hashchange', () => {
            var o = location.hash.match(/^#(.+)$/)
            o && a(o[1], 300)
          })
        var o = $.fx.off
        ;($.fx.off = true), i(), c(), ($.fx.off = o)
      })
    },
    show: a,
    refpoint_set: c,
    refpoint_goto: o,
    resize: i,
    onresize: void 0,
    onactive: void 0,
  }
})()
