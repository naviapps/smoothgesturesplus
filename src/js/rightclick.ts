let n = {};
chrome.storage.local.get(null, (items) => {
  n = items;
  l();
});
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local') {
    for (key in changes) {
      n[key] = changes[key].newValue;
    }
  }
});

const i = (t, e) => {
  const i = Date.now();
  for (key in t) {
    n[key] = t[key];
  }
  if (!key.match(/\+ts$/)) {
    n[`${key}+ts`] = t[`${key}+ts`] = i;
  }
  chrome.storage.local.set(t, e);
};

const o = navigator.platform.indexOf('Mac') !== -1;
const t = navigator.platform.indexOf('CrOS') !== -1;
const e = navigator.platform.indexOf('Linux') !== -1;
chrome.permissions.contains({ permissions: ['nativeMessaging'] }, (t) => {
  chrome.runtime.getBackgroundPage((t) => {
    t.connectNative();
  });
});

const l = () => {
  $(() => {
    $('#doubleclick, #chromeosdouble').click(() => {
      i({ blockDoubleclickAlert: true });
      window.close();
    });
    $('#installplugin').click(() => {
      i({ blockDoubleclickAlert: false });
      chrome.permissions.request({ permissions: ['nativeMessaging'] }, (t) => {
        if (t || n.forceInstallRightclick) {
          if (n.forceInstallRightclick) {
            i({ forceInstallRightclick: false });
          }
          chrome.runtime.getBackgroundPage((t) => {
            t.connectNative(10);
          });
          const e = document.createElement('a');
          if (o) {
            e.setAttribute('href', '/nat/SmoothGesturesPlusExtras-0.7.dmg');
            e.setAttribute('download', 'SmoothGesturesPlusExtras-0.7.dmg');
          } else {
            e.setAttribute('href', '/nat/smoothgesturesplus-extras-0.6.tar.gz');
            e.setAttribute('download', 'smoothgesturesplus-extras-0.6.tar.gz');
          }
          e.click();
          $('p, div').css({ display: 'none' });
          $('#arrow, #instruct').css({ display: 'block' });
        }
      });
    });
    if (o) {
      $('#instruct').html('<ul><li>Open the dmg file</li><li>Right-click the app > Open</li></ul>');
    }
    if (e) {
      $('#instruct').html('<ul><li>Extract the tar file</li><li>Run install.py</li></ul>');
    }
    if (t) {
      $('#extras').hide();
      $('#chromeos').show();
    }
    n.forceInstallRightclick && $('#installplugin').click();
  });
};
