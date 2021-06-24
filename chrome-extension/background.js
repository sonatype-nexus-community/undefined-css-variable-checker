// This service worker has permissions to execute code on the page in question. This listener does so
// any time the devtools page says to.
chrome.runtime.onConnect.addListener(function(devToolsConnection) {
  function devToolsListener(message) {
    switch (message.type) {
      case 'check-css-vars':
        chrome.scripting.executeScript({
          target: { tabId: message.tabId, allFrames: true },
          files: ['checker.js']
        });
        break;
      case 'highlight-element':
        console.log('received highlight-element message', message);
        chrome.runtime.sendMessage(message);
        break;
    }

  }

  function resultListener(message) {
    if (message.type === 'checker-results') {
      console.log('devToolsConnection', devToolsConnection);
      devToolsConnection.postMessage(message.results);
    }
  }

  chrome.runtime.onMessage.addListener(resultListener);

  devToolsConnection.onMessage.addListener(devToolsListener);

  devToolsConnection.onDisconnect.addListener(function() {
    devToolsConnection.onMessage.removeListener(devToolsListener);
  });
});
