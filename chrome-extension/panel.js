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

function mkSelectorClickEventListener(counter) {
  return () => {
    console.log('link click', counter);
    port.postMessage({
      type: 'highlight-element',
      elementIndex: counter,
      tabId: chrome.devtools.inspectedWindow.tabId
    });
  };
}

port.onMessage.addListener(results => {
  const tableContent = document.createDocumentFragment();

  let counter = 0;
  for (const { variable, styleSheet, selector } of results) {
    const row = document.createElement('tr'),
        variableCell = document.createElement('td'),
        stylesheetCell = document.createElement('td'),
        selectorCell = document.createElement('td'),
        elementLink = document.createElement('a');

    variableCell.textContent = variable;
    stylesheetCell.textContent = styleSheet;
    elementLink.textContent = selector;
    selectorCell.appendChild(elementLink);

    elementLink.addEventListener('click', mkSelectorClickEventListener(counter));

    row.classList.add('nx-table-row');
    [variableCell, stylesheetCell, selectorCell].forEach(cell => cell.classList.add('nx-cell'));

    row.appendChild(variableCell);
    row.appendChild(stylesheetCell);
    row.appendChild(selectorCell);

    tableContent.appendChild(row);

    counter++;
  }

  document.getElementById('results-body').replaceChildren(tableContent);
});