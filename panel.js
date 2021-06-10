// This script that runs in the devtools itself is not allowed to interact directly with the
// page, it must go through the registered service worker. At the same time, only this script knows the tabId
// of the page
const port = chrome.runtime.connect({
  name: 'css-custom-property-checker'
});

document.getElementById('check-btn').addEventListener('click', function() {
  port.postMessage({
    type: 'check-css-vars',
    tabId: chrome.devtools.inspectedWindow.tabId
  });
});

console.log('port', port);
port.onMessage.addListener(results => {
  console.log('panel listener');
  const tableContent = document.createDocumentFragment();

  for (const { variable, element } of results) {
    const row = document.createElement('tr'),
        variableCell = document.createElement('td'),
        elementCell = document.createElement('td');

    variableCell.textContent = variable;
    elementCell.textContent = element;

    console.log('element', element);

    row.appendChild(variableCell);
    row.appendChild(elementCell);

    tableContent.appendChild(row);
  }

  document.getElementById('results-body').replaceChildren(tableContent);
});
