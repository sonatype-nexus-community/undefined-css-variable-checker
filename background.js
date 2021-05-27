// This service worker has permissions to execute code on the page in question. This listener does so
// any time the devtools page says to.
chrome.runtime.onConnect.addListener(function(devToolsConnection) {
  function devToolsListener(message) {
    if (message.type === 'check-css-vars') {
      chrome.tabs.executeScript(message.tabId, { file: 'checker.js' });
    }
  }

  devToolsConnection.onMessage.addListener(devToolsListener);

  devToolsConnection.onDisconnect.addListener(function() {
    devToolsConnection.onMessage.removeListener(devToolsListener);
  });
});
