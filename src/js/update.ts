$(function () {
  'update_url' in chrome.runtime.getManifest() && (console.log = console.error = function () {}),
    $('#openextensions').click(function (e) {
      chrome.tabs.create({ url: 'chrome://extensions/' }), e.preventDefault();
    });
});
