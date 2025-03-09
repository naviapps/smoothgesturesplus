import { SmoothGestures } from './smooth-gestures';

const A = chrome.runtime.getManifest().short_name !== 'Smooth Gestures Plus';
const B =
  'update_url' in chrome.runtime.getManifest()
    ? 'kdcjmllhmhnnadianfhhnoefgcdbpdap'
    : (chrome.runtime.id, 'ijgdgeacmjiigjjepffiijkleklaapfl');
let settings = {};
if (A) {
  chrome.extension.sendMessage(B, { storage: true }, (e) => {
    if (e && e.gestures && e.validGestures) {
      settings = e;
      l();
    }
  });
} else {
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
}
chrome.runtime.onMessage.addListener((e, t, n) => {
  e.ping && n({ pong: true });
});

if (window.SGinjectscript && window.SGinjectscript.constructor === HTMLScriptElement) {
  const match = window.SGinjectscript.src.match(/([^a-p]|^)([a-p]{32})([^a-p]|$)/);
  if (match) {
    window.SGextId = match[2];
  }
  const scripts = document.querySelectorAll('script[src^=chrome-extension\\:\\/\\/]');
  for (let i = 0; i < scripts.length; i += 1) {
    scripts[i].parentNode.removeChild(scripts[i]);
  }
}

const l = () => {
  if (window.SG) {
    if (!window.SG.enabled()) {
      window.SG.connect();
    }
  } else {
    window.SG = new SmoothGestures();
  }
};
