!(function () {
  let t = null;
  const n = { elem: null, offset: 0 };
  const c = function () {
    $('#sidebar').css({ display: 'none' }),
      (n.elem = document.elementFromPoint(0.6 * window.innerWidth, 0 * window.innerHeight)),
      (n.offset =
        Math.max(document.documentElement.scrollTop, document.body.scrollTop) +
        0 * window.innerHeight -
        $(n.elem).offset().top),
      $('#sidebar').css({ display: '' });
  };
  const o = function () {
    if (n.elem) {
      const o =
        Math.max(document.documentElement.scrollTop, document.body.scrollTop) +
        0 * window.innerHeight -
        $(n.elem).offset().top;
      (document.body.scrollTop += n.offset - o),
        (document.documentElement.scrollTop += n.offset - o);
    }
  };
  const e = function () {
    if (!$('html, body').is(':animated')) {
      c(), $('html, body').stop();
      for (let o = $('.page'), n = 0; n < o.length; n++) {
        const e = $(o[n]);
        if (e.css('display') != 'none') {
          const t = e.attr('page');
          const i = Math.round(
            Math.max(document.documentElement.scrollTop, document.body.scrollTop) +
              window.innerHeight -
              e.position().top -
              e.height(),
          );
          const a = Math.round(
            Math.max(document.documentElement.scrollTop, document.body.scrollTop) -
              e.position().top,
          );
          if (i <= window.innerHeight / 2 + 25 && a > -window.innerHeight / 2 - 25) {
            s(t);
            break;
          }
        }
      }
    }
  };
  const i = function () {
    typeof pages.onresize === 'function' && pages.onresize(), o(), e();
  };
  var s = function (o) {
    (t = o),
      (location.hash = `#${o}`),
      $('.navbutton.active').removeClass('active'),
      $(`.navbutton[nav=${o}]`).addClass('active'),
      typeof pages.onactive === 'function' && pages.onactive(o);
  };
  $.easing.easeInExp = function (o, n, e, t, i) {
    return n == 0 ? e : t * 2 ** (10 * (n / i - 1)) + e;
  };
  const a = function (o, n) {
    o = o || location.hash.replace(/^#(.+)$/, '$1') || document.querySelector('.page').page;
    const e = $(`[page=${o}]`);
    e.length == 1 &&
      (o != t && s(o),
      e.position().top != Math.max(document.documentElement.scrollTop, document.body.scrollTop) &&
        $('html, body')
          .stop()
          .animate({ scrollTop: e.position().top }, n || 0, 'easeInExp'));
  };
  window.pages = {
    init() {
      $(function () {
        $(window).on('mousewheel', function (o) {
          $('html, body').stop();
        }),
          $(window).on('scroll', e),
          $(window).on('resize', i),
          $('.navbutton').on('click', function () {
            a($(this).attr('nav'), 300);
          }),
          $(window).on('hashchange', function () {
            const o = location.hash.match(/^#(.+)$/);
            o && a(o[1], 300);
          });
        const o = $.fx.off;
        ($.fx.off = !0), i(), c(), ($.fx.off = o);
      });
    },
    show: a,
    refpoint_set: c,
    refpoint_goto: o,
    resize: i,
    onresize: void 0,
    onactive: void 0,
  };
})();
