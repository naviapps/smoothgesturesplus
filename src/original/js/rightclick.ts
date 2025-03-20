let settings = {};
chrome.storage.local.get(null, (items) => {
  settings = items;
  l();
});
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local') {
    for (key in changes) {
      settings[key] = changes[key].newValue;
    }
  }
});

const index = (t, e) => {
  const index_ = Date.now();
  for (key in t) {
    settings[key] = t[key];
  }
  chrome.storage.local.set(t, e);
};

const isMac = navigator.userAgent.includes('Mac');
const isChromeOS = navigator.userAgent.includes('CrOS');
const isLinux = navigator.userAgent.includes('Linux');
chrome.permissions.contains({ permissions: ['nativeMessaging'] }, (t) => {
  chrome.runtime.getBackgroundPage((t) => {
    t.connectNative();
  });
});

const l = () => {
  $(() => {
    $('#doubleclick, #chromeosdouble').click(() => {
      index({ blockDoubleclickAlert: true });
      window.close();
    });
    $('#installplugin').click(() => {
      index({ blockDoubleclickAlert: false });
      chrome.permissions.request({ permissions: ['nativeMessaging'] }, (t) => {
        if (t || settings.forceInstallRightclick) {
          if (settings.forceInstallRightclick) {
            index({ forceInstallRightclick: false });
          }
          chrome.runtime.getBackgroundPage((t) => {
            t.connectNative(10);
          });
          const e = document.createElement('a');
          if (isMac) {
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
    if (isMac) {
      $('#instruct').html('<ul><li>Open the dmg file</li><li>Right-click the app > Open</li></ul>');
    }
    if (isLinux) {
      $('#instruct').html('<ul><li>Extract the tar file</li><li>Run install.py</li></ul>');
    }
    if (isChromeOS) {
      $('#extras').hide();
      $('#chromeos').show();
    }
    if (settings.forceInstallRightclick) {
      $('#installplugin').click();
    }
  });
};
