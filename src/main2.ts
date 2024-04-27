'update_url' in chrome.runtime.getManifest() &&
  (console.log = console.error = () => {})
let settings: SmoothGesturesSettings = {}
chrome.storage.local.get(null, (items) => {
  settings = items
})
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local') {
    for (const key in changes) {
      settings[key] = changes[key].newValue
    }
  }
})
