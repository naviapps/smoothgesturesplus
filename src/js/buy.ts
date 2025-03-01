!(function () {
  'update_url' in chrome.runtime.getManifest() && (console.log = console.error = function () {});
  let e = {};
  chrome.storage.local.get(null, function (s) {
    (e = s), a();
  });
  chrome.storage.onChanged.addListener(function (s, a) {
    if (a == 'local') for (key in s) e[key] = s[key].newValue;
  });
  chrome.runtime.getBackgroundPage(function (s) {
    s.ping();
  });
  var a = function () {
    $(function () {
      const s = 336 - Math.ceil((Date.now() - e.firstinstalled) / 1e3 / 60 / 60);
      $('body')
        .append(
          $('<div class=section>')
            .addClass('upgradeinfo')
            .append(
              $('<div>')
                .css({ margin: '0 auto 2em', display: 'table' })
                .html(
                  "<span class=sglogo><img src='/img/icon48.png'> <span class=sgtitle>Smooth<br>Gestures <span class=sgplus>plus</span></span></span>",
                ),
            )
            .append(
              $('<div class=descrip>').html(
                'You must activate <span class=sgtitle>Smooth Gestures <span class=sgplus>plus</span></span> to continue using it after the two week trial period.',
              ),
            )
            .append(
              $('<ul class=subdescrip>')
                .append(
                  $('<li>').append(
                    $('<span>')
                      .css({
                        'background-color':
                          s < 0
                            ? 'rgba(255,0,0,.2)'
                            : s < 120
                              ? 'rgba(255,255,0,.2)'
                              : 'rgba(0,255,0,.2)',
                        'font-weight': 'bold',
                      })
                      .text(
                        `Your trial period ${
                          s < 0
                            ? 'has expired'
                            : `will expire in ${
                                s >= 24
                                  ? `${Math.round(s / 24)} days`
                                  : s > 0
                                    ? `${s} hours`
                                    : 'less than an hour'
                              }`
                        }`,
                      ),
                  ),
                )
                .append(
                  "<li>Ad-free and <a href='https://smoothgesturesplus.com/privacy' target='_blank'>Privacy-friendly</a></li>",
                ),
            )
            .append(
              $('<div class=upgradeplus>').append(
                $(
                  `<span class=upgradebutton>${
                    e.license ? 'Buy' : 'Activate'
                  } <span class=sgtitle>Smooth Gestures <span class=sgplus>plus<span class=arrow></span></span></span></span>`,
                )
                  .click(function () {
                    chrome.tabs.create(
                      {
                        url: `https://smoothgesturesplus.com/id/?clid=${e.id}&fi=${
                          e.firstinstalled
                        }&n=/pay/`,
                      },
                      function () {
                        window.close();
                      },
                    );
                  })
                  .mouseenter(function () {
                    $('.sgplus', this).stop().animate({ left: '.4em' }, 100);
                  })
                  .mouseleave(function () {
                    $('.sgplus', this).stop().animate({ left: '0' }, 200);
                  }),
              ),
            ),
        )
        .append(
          $('<div class=section>')
            .append($('<div class=descrip>').text('FAQ'))
            .append(
              $('<ul class=subdescrip>')
                .append(
                  $('<li>')
                    .append(
                      '<div class=faqtitle>Can I use <span class=sgtitle>Smooth Gestures <span class=sgplus>plus</span></span> on more than one computer?</div>',
                    )
                    .append(
                      '<div class=faqdescrip>Yes! This <span class=sgtitle>Smooth Gestures <span class=sgplus>plus</span></span> upgrade will work on any computer which has Chrome syncing to the same Google account.</div>',
                    ),
                )
                .append(
                  $('<li>')
                    .append('<div class=faqtitle>What about privacy?</div>')
                    .append(
                      '<div class=faqdescrip><span class=sgtitle>Smooth Gestures <span class=sgplus>plus</span></span> is focused on keeping extension permissions to a minimum and only requesting additional permissions as needed.</div>',
                    ),
                )
                .append(
                  $('<li>')
                    .append('<div class=faqtitle>How can I contact you?</div>')
                    .append(
                      "<div class=faqdescrip>Please contact me at <a href='mailto:scott@smoothgesturesplus.com'>scott@smoothgesturesplus.com</a>. Send me more questions!</div>",
                    ),
                ),
            ),
        );
    });
  };
})();
