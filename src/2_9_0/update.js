$(() => {
  'update_url' in chrome.runtime.getManifest() &&
    (console.log = console.error = () => {}),
    $('#openextensions').click((e) => {
      chrome.tabs.create({ url: 'chrome://extensions/' }), e.preventDefault()
    })
})
