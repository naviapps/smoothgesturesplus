!(() => {
  'update_url' in chrome.runtime.getManifest() &&
    (console.log = console.error = () => {})
  var n = {}
  chrome.storage.local.get(null, (t) => {
    ;(n = t), l()
  })
  chrome.storage.onChanged.addListener((t, e) => {
    if ('local' == e) for (key in t) n[key] = t[key].newValue
  })
  var i = (t, e) => {
      var i = Date.now()
      for (key in t)
        (n[key] = t[key]),
          key.match(/\+ts$/) || (n[key + '+ts'] = t[key + '+ts'] = i)
      chrome.storage.local.set(t, e)
    },
    o =
      (navigator.platform.indexOf('Win'),
      -1 != navigator.platform.indexOf('Mac')),
    t = -1 != navigator.platform.indexOf('CrOS'),
    e = -1 != navigator.platform.indexOf('Linux')
  chrome.permissions.contains({ permissions: ['nativeMessaging'] }, (t) => {
    chrome.runtime.getBackgroundPage((t) => {
      t.connectNative()
    })
  })
  var l = () => {
    $(() => {
      $('#doubleclick, #chromeosdouble').click(() => {
        i({ blockDoubleclickAlert: true }), window.close()
      }),
        $('#installplugin').click(() => {
          i({ blockDoubleclickAlert: false }),
            chrome.permissions.request(
              { permissions: ['nativeMessaging'] },
              (t) => {
                if (t || n.forceInstallRightclick) {
                  n.forceInstallRightclick &&
                    i({ forceInstallRightclick: false }),
                    chrome.runtime.getBackgroundPage((t) => {
                      t.connectNative(10)
                    })
                  var e = document.createElement('a')
                  o
                    ? (e.setAttribute(
                        'href',
                        '/nat/SmoothGesturesPlusExtras-0.7.dmg',
                      ),
                      e.setAttribute(
                        'download',
                        'SmoothGesturesPlusExtras-0.7.dmg',
                      ))
                    : (e.setAttribute(
                        'href',
                        '/nat/smoothgesturesplus-extras-0.6.tar.gz',
                      ),
                      e.setAttribute(
                        'download',
                        'smoothgesturesplus-extras-0.6.tar.gz',
                      )),
                    e.click(),
                    $('p, div').css({ display: 'none' }),
                    $('#arrow, #instruct').css({ display: 'block' })
                }
              },
            )
        }),
        o &&
          $('#instruct').html(
            '<ul><li>Open the dmg file</li><li>Right-click the app > Open</li></ul>',
          ),
        e &&
          $('#instruct').html(
            '<ul><li>Extract the tar file</li><li>Run install.py</li></ul>',
          ),
        t && ($('#extras').hide(), $('#chromeos').show()),
        n.forceInstallRightclick && $('#installplugin').click()
    })
  }
})()
