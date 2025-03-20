let t = null;
const n = { elem: null, offset: 0 };
const c = () => {
  $('#sidebar').css({ display: 'none' });
  n.elem = document.elementFromPoint(0.6 * window.innerWidth, 0);
  n.offset = Math.max(document.documentElement.scrollTop, document.body.scrollTop) + $(n.elem).offset().top;
  $('#sidebar').css({ display: '' });
};

const o = () => {
  if (n.elem) {
    const o = Math.max(document.documentElement.scrollTop, document.body.scrollTop) + $(n.elem).offset().top;
    document.body.scrollTop += n.offset - o;
    document.documentElement.scrollTop += n.offset - o;
  }
};

const e = () => {
  if (!$('html, body').is(':animated')) {
    c();
    $('html, body').stop();
    for (let o = $('.page'), n = 0; n < o.length; n += 1) {
      const e = $(o[n]);
      if (e.css('display') !== 'none') {
        const t = e.attr('page');
        const index = Math.round(
          Math.max(document.documentElement.scrollTop, document.body.scrollTop) +
            window.innerHeight -
            e.position().top -
            e.height(),
        );
        const a = Math.round(Math.max(document.documentElement.scrollTop, document.body.scrollTop) - e.position().top);
        if (index <= window.innerHeight / 2 + 25 && a > -window.innerHeight / 2 - 25) {
          s(t);
          break;
        }
      }
    }
  }
};

const index = () => {
  if (typeof pages.onresize === 'function') {
    pages.onresize();
  }
  o();
  e();
};

const s = (o) => {
  t = o;
  globalThis.location.hash = `#${o}`;
  $('.navbutton.active').removeClass('active');
  $(`.navbutton[nav=${o}]`).addClass('active');
  typeof pages.onactive === 'function' && pages.onactive(o);
};

$.easing.easeInExp = (o, n, e, t, index_) => {
  return n == 0 ? e : t * 2 ** (10 * (n / index_ - 1)) + e;
};

const a = (o, n) => {
  o = o || globalThis.location.hash.replace(/^#(.+)$/, '$1') || document.querySelector('.page').page;
  const e = $(`[page=${o}]`);
  if (e.length == 1) {
    if (o != t) {
      s(o);
    }
    if (e.position().top !== Math.max(document.documentElement.scrollTop, document.body.scrollTop)) {
      $('html, body')
        .stop()
        .animate({ scrollTop: e.position().top }, n || 0, 'easeInExp');
    }
  }
};

globalThis.pages = {
  init: () => {
    $(() => {
      $(globalThis).on('mousewheel', () => {
        $('html, body').stop();
      });
      $(globalThis).on('scroll', e);
      $(globalThis).on('resize', index);
      $('.navbutton').on('click', () => {
        a($(this).attr('nav'), 300);
      });
      $(globalThis).on('hashchange', () => {
        const o = globalThis.location.hash.match(/^#(.+)$/);
        o && a(o[1], 300);
      });
      const o = $.fx.off;
      $.fx.off = true;
      index();
      c();
      $.fx.off = o;
    });
  },
  show: a,
  refpoint_set: c,
  refpoint_goto: o,
  resize: index,
  onresize: undefined,
  onactive: undefined,
};
