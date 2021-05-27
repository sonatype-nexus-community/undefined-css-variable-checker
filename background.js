// This service worker has permissions to execute code on the page in question. This listener does so
// any time the devtools page says to.
console.log('in background.js');
chrome.runtime.onConnect.addListener(function(devToolsConnection) {
console.log('in connect listener');
  function devToolsListener(message) {
    console.log('in devtools listener');
    if (message.type === 'check-css-vars') {
      console.log('executing script');
      chrome.tabs.executeScript(message.tabId, { file: 'checker.js' });
    }
  }

  devToolsConnection.onMessage.addListener(devToolsListener);

  devToolsConnection.onDisconnect.addListener(function() {
    devToolsConnection.onMessage.removeListener(devToolsListener);
  });
});
