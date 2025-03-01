!(function () {
  'update_url' in chrome.runtime.getManifest() && (console.log = console.error = function () {});
  let n = {};
  chrome.storage.local.get(null, function (t) {
    (n = t), l();
  });
  chrome.storage.onChanged.addListener(function (t, e) {
    if (e == 'local') for (key in t) n[key] = t[key].newValue;
  });
  const i = function (t, e) {
    const i = Date.now();
    for (key in t) (n[key] = t[key]), key.match(/\+ts$/) || (n[`${key}+ts`] = t[`${key}+ts`] = i);
    chrome.storage.local.set(t, e);
  };
  const o = (navigator.platform.indexOf('Win'), navigator.platform.indexOf('Mac') != -1);
  const t = navigator.platform.indexOf('CrOS') != -1;
  const e = navigator.platform.indexOf('Linux') != -1;
  chrome.permissions.contains({ permissions: ['nativeMessaging'] }, function (t) {
    chrome.runtime.getBackgroundPage(function (t) {
      t.connectNative();
    });
  });
  var l = function () {
    $(function () {
      $('#doubleclick, #chromeosdouble').click(function () {
        i({ blockDoubleclickAlert: !0 }), window.close();
      }),
        $('#installplugin').click(function () {
          i({ blockDoubleclickAlert: !1 }),
            chrome.permissions.request({ permissions: ['nativeMessaging'] }, function (t) {
              if (t || n.forceInstallRightclick) {
                n.forceInstallRightclick && i({ forceInstallRightclick: !1 }),
                  chrome.runtime.getBackgroundPage(function (t) {
                    t.connectNative(10);
                  });
                const e = document.createElement('a');
                o
                  ? (e.setAttribute('href', '/nat/SmoothGesturesPlusExtras-0.7.dmg'),
                    e.setAttribute('download', 'SmoothGesturesPlusExtras-0.7.dmg'))
                  : (e.setAttribute('href', '/nat/smoothgesturesplus-extras-0.6.tar.gz'),
                    e.setAttribute('download', 'smoothgesturesplus-extras-0.6.tar.gz')),
                  e.click(),
                  $('p, div').css({ display: 'none' }),
                  $('#arrow, #instruct').css({ display: 'block' });
              }
            });
        }),
        o &&
          $('#instruct').html(
            '<ul><li>Open the dmg file</li><li>Right-click the app > Open</li></ul>',
          ),
        e && $('#instruct').html('<ul><li>Extract the tar file</li><li>Run install.py</li></ul>'),
        t && ($('#extras').hide(), $('#chromeos').show()),
        n.forceInstallRightclick && $('#installplugin').click();
    });
  };
})();
