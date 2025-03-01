$(() => {
  $('#openextensions').click((e) => {
    chrome.tabs.create({ url: 'chrome://extensions/' });
    e.preventDefault();
  });
});
