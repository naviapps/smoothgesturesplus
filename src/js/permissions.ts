let settings = {};
chrome.storage.local.get(null, (items) => {
  settings = items;
  e();
});
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local') {
    for (key in changes) {
      settings[key] = changes[key].newValue;
    }
  }
});
const n = window.location.hash.substr(1).split(',');
if (n[0] === '') {
  window.close();
}
chrome.permissions.contains({ permissions: n }, (n) => {
  if (n) {
    window.close();
  }
});

const e = () => {
  $(() => {
    $('body')
      .append(
        $(
          '<h2><img src="/img/icon32.png" alt=""> <span class=sgtitle>Smooth Gestures <span class=sgplus>plus</span></span></h2>',
        ),
      )
      .append($('<p>').html('New permissions are needed'));
    $('body').append(
      $('<div id=continue class=button>')
        .text('Continue')
        .click(() => {
          chrome.permissions.request({ permissions: n }, (n) => {
            if (n) {
              chrome.runtime.getBackgroundPage((n) => {
                n.continue_permissions();
                window.close();
              });
            }
          });
        }),
    );
  });
};
