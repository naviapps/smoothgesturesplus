!(function () {
  'update_url' in chrome.runtime.getManifest() && (console.log = console.error = function () {});
  var o = {};
  chrome.storage.local.get(null, function (e) {
    (o = e), init();
  });
  chrome.storage.onChanged.addListener(function (e, t) {
    if ('local' == t) for (key in e) o[key] = e[key].newValue;
  });
  var s = function () {
    chrome.tabs.reload({ bypassCache: true }), window.close();
  };
  init = function () {
    chrome.runtime.getBackgroundPage(function (o) {
      chrome.tabs.query({ active: true, lastFocusedWindow: true }, function (e) {
        var t = e[0];
        o.getTabStatus(t.id, function (e) {
          console.log(t, e),
            'broken' == e
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
              : 'unable' == e
                ? ($('body')
                    .append('<div id=statuslight class=yellow>')
                    .append($('<h1>').text(chrome.i18n.getMessage('popup_status_unable_short')))
                    .append($('<p>').text(chrome.i18n.getMessage('popup_status_blocked_1'))),
                  'chrome://newtab/' == t.url &&
                    $('body').append(
                      $('<p>').html(
                        chrome.i18n.getMessage('popup_status_blocked_newtab2', [
                          "<a href='https://chrome.google.com/webstore/detail/djnmanljkopakfofdpmelbccmbpbocaa' target='_blank'>" +
                            chrome.i18n.getMessage('popup_status_blocked_newtab2_link') +
                            '</a>',
                        ]),
                      ),
                    ),
                  t.url.match(/^file:\/\//) &&
                    $('body').append(
                      $('<p>').html(
                        chrome.i18n.getMessage(
                          'popup_status_blocked_file2',
                          '<a href="chrome://extensions/" target="_blank">' +
                            chrome.i18n.getMessage('popup_status_blocked_file2_link') +
                            '</a>',
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
