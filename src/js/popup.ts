!(function () {
  'update_url' in chrome.runtime.getManifest() && (console.log = console.error = function () {});
  let o = {};
  chrome.storage.local.get(null, function (e) {
    (o = e), init();
  });
  chrome.storage.onChanged.addListener(function (e, t) {
    if (t == 'local') for (key in e) o[key] = e[key].newValue;
  });
  const s = function () {
    chrome.tabs.reload({ bypassCache: !0 }), window.close();
  };
  init = function () {
    chrome.runtime.getBackgroundPage(function (o) {
      chrome.tabs.query({ active: !0, lastFocusedWindow: !0 }, function (e) {
        const t = e[0];
        o.getTabStatus(t.id, function (e) {
          console.log(t, e),
            e == 'broken'
              ? $('body')
                  .append('<div id=statuslight class=red>')
                  .append($('<h1>').text(chrome.i18n.getMessage('popup_status_broken_short')))
                  .append($('<p>').text(chrome.i18n.getMessage('popup_status_broken')))
                  .append(
                    $('<div class=button>')
                      .text(chrome.i18n.getMessage('popup_button_options'))
                      .css({ float: 'right' })
                      .click(function () {
                        chrome.tabs.create({ url: 'options.html' }), window.close();
                      }),
                  )
                  .append(
                    $('<div class=button>')
                      .text(chrome.i18n.getMessage('popup_button_reload'))
                      .css({ float: 'left' })
                      .click(s),
                  )
              : e == 'unable'
                ? ($('body')
                    .append('<div id=statuslight class=yellow>')
                    .append($('<h1>').text(chrome.i18n.getMessage('popup_status_unable_short')))
                    .append($('<p>').text(chrome.i18n.getMessage('popup_status_blocked_1'))),
                  t.url == 'chrome://newtab/' &&
                    $('body').append(
                      $('<p>').html(
                        chrome.i18n.getMessage('popup_status_blocked_newtab2', [
                          `<a href='https://chrome.google.com/webstore/detail/djnmanljkopakfofdpmelbccmbpbocaa' target='_blank'>${chrome.i18n.getMessage(
                            'popup_status_blocked_newtab2_link',
                          )}</a>`,
                        ]),
                      ),
                    ),
                  t.url.match(/^file:\/\//) &&
                    $('body').append(
                      $('<p>').html(
                        chrome.i18n.getMessage(
                          'popup_status_blocked_file2',
                          `<a href="chrome://extensions/" target="_blank">${chrome.i18n.getMessage(
                            'popup_status_blocked_file2_link',
                          )}</a>`,
                        ),
                      ),
                    ),
                  $('body').append(
                    $('<div class=button>')
                      .text(chrome.i18n.getMessage('popup_button_options'))
                      .css({ float: 'right' })
                      .click(function () {
                        chrome.tabs.create({ url: 'options.html' }), window.close();
                      }),
                  ))
                : $('body')
                    .append('<div id=statuslight class=green>')
                    .append($('<h1>').text(chrome.i18n.getMessage('popup_status_working_short')))
                    .append($('<p>').text(chrome.i18n.getMessage('popup_status_working')))
                    .append(
                      $('<div class=button>')
                        .text(chrome.i18n.getMessage('popup_button_options'))
                        .css({ float: 'right' })
                        .click(function () {
                          chrome.tabs.create({ url: 'options.html' }), window.close();
                        }),
                    );
        });
      });
    });
  };
})();
