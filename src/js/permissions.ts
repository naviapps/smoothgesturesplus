!(function () {
  'update_url' in chrome.runtime.getManifest() && (console.log = console.error = function () {});
  let o = {};
  chrome.storage.local.get(null, function (n) {
    (o = n), e();
  });
  chrome.storage.onChanged.addListener(function (n, e) {
    if (e == 'local') for (key in n) o[key] = n[key].newValue;
  });
  const n = location.hash.substr(1).split(',');
  n[0] == '' && window.close(),
    chrome.permissions.contains({ permissions: n }, function (n) {
      n && window.close();
    });
  var e = function () {
    $(function () {
      $('body')
        .append(
          $(
            "<h2><img src='/img/icon32.png'> <span class=sgtitle>Smooth Gestures <span class=sgplus>plus</span></span></h2>",
          ),
        )
        .append($('<p>').html('New permissions are needed')),
        $('body').append(
          $('<div id=continue class=button>')
            .text('Continue')
            .click(function () {
              chrome.permissions.request({ permissions: n }, function (n) {
                n &&
                  chrome.runtime.getBackgroundPage(function (n) {
                    n.continue_permissions(), window.close();
                  });
              });
            }),
        );
    });
  };
})();
