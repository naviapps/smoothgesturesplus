let settings = {};
chrome.storage.local.get(null, (items) => {
  settings = items;
  init();
});
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local') {
    for (key in changes) {
      settings[key] = changes[key].newValue;
    }
  }
});

const s = () => {
  chrome.tabs.reload({ bypassCache: true });
  window.close();
};

const init = () => {
  chrome.runtime.getBackgroundPage((o) => {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (e) => {
      const t = e[0];
      o.getTabStatus(t.id, (e) => {
        console.log(t, e);
        if (e === 'broken') {
          $('body')
            .append('<div id=statuslight class=red>')
            .append($('<h1>').text(chrome.i18n.getMessage('popup_status_broken_short')))
            .append($('<p>').text(chrome.i18n.getMessage('popup_status_broken')))
            .append(
              $('<div class=button>')
                .text(chrome.i18n.getMessage('popup_button_options'))
                .css({ float: 'right' })
                .click(() => {
                  chrome.tabs.create({ url: 'options.html' });
                  window.close();
                }),
            )
            .append(
              $('<div class=button>')
                .text(chrome.i18n.getMessage('popup_button_reload'))
                .css({ float: 'left' })
                .click(s),
            );
        } else if (e === 'unable') {
          $('body')
            .append('<div id=statuslight class=yellow>')
            .append($('<h1>').text(chrome.i18n.getMessage('popup_status_unable_short')))
            .append($('<p>').text(chrome.i18n.getMessage('popup_status_blocked_1')));
          if (t.url === 'chrome://newtab/') {
            $('body').append(
              $('<p>').html(
                chrome.i18n.getMessage('popup_status_blocked_newtab2', [
                  `<a href='https://chrome.google.com/webstore/detail/djnmanljkopakfofdpmelbccmbpbocaa' target='_blank'>${chrome.i18n.getMessage(
                    'popup_status_blocked_newtab2_link',
                  )}</a>`,
                ]),
              ),
            );
          }
          if (/^file:\/\//.test(t.url)) {
            $('body').append(
              $('<p>').html(
                chrome.i18n.getMessage(
                  'popup_status_blocked_file2',
                  `<a href="chrome://extensions/" target="_blank">${chrome.i18n.getMessage(
                    'popup_status_blocked_file2_link',
                  )}</a>`,
                ),
              ),
            );
            $('body').append(
              $('<div class=button>')
                .text(chrome.i18n.getMessage('popup_button_options'))
                .css({ float: 'right' })
                .click(() => {
                  chrome.tabs.create({ url: 'options.html' });
                  window.close();
                }),
            );
          }
        } else {
          $('body')
            .append('<div id=statuslight class=green>')
            .append($('<h1>').text(chrome.i18n.getMessage('popup_status_working_short')))
            .append($('<p>').text(chrome.i18n.getMessage('popup_status_working')))
            .append(
              $('<div class=button>')
                .text(chrome.i18n.getMessage('popup_button_options'))
                .css({ float: 'right' })
                .click(() => {
                  chrome.tabs.create({ url: 'options.html' });
                  window.close();
                }),
            );
        }
      });
    });
  });
};
