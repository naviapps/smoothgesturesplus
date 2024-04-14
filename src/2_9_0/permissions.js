!(() => {
  'update_url' in chrome.runtime.getManifest() &&
    (console.log = console.error = () => {})
  var o = {}
  chrome.storage.local.get(null, (n) => {
    ;(o = n), e()
  })
  chrome.storage.onChanged.addListener((n, e) => {
    if ('local' == e) for (key in n) o[key] = n[key].newValue
  })
  var n = location.hash.substr(1).split(',')
  '' == n[0] && window.close(),
    chrome.permissions.contains({ permissions: n }, (n) => {
      n && window.close()
    })
  var e = () => {
    $(() => {
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
            .click(() => {
              chrome.permissions.request({ permissions: n }, (n) => {
                n &&
                  chrome.runtime.getBackgroundPage((n) => {
                    n.continue_permissions(), window.close()
                  })
              })
            }),
        )
    })
  }
})()
