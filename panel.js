// This script that runs in the devtools itself is not allowed to interact directly with the
// page, it must go through the registered service worker. At the same time, only this script knows the tabId
// of the page
console.log('in panel.js');
document.getElementById('check-btn').addEventListener('click', function() {
  console.log('in button handler');
  chrome.runtime.sendMessage({
    type: 'check-css-vars',
    tabId: chrome.devtools.inspectedWindow.tabId
  });
});
