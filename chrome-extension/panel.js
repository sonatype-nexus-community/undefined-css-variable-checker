/*
 * Copyright 2021-present Sonatype, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function mkSelectorClickEventListener(counter) {
  return () => {
    chrome.devtools.inspectedWindow.eval(`inspect(results[${counter}].element)`, { useContentScriptContext: true });
  };
}

function renderResults(results) {
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
    elementLink.classList.add('nx-text-link');

    row.classList.add('nx-table-row');
    [variableCell, stylesheetCell, selectorCell].forEach(cell => cell.classList.add('nx-cell'));

    row.appendChild(variableCell);
    row.appendChild(stylesheetCell);
    row.appendChild(selectorCell);

    tableContent.appendChild(row);

    counter++;
  }

  if (!counter) {
    const row = document.createElement('tr'),
        cell = document.createElement('td');

    row.classList.add('nx-table-row');

    cell.colSpan = 3;
    cell.classList.add('nx-cell');
    cell.classList.add('nx-cell--meta-info');

    // the thing on the end is a party popper emoji
    cell.textContent = 'No undefined CSS variables found! \u{1F389}';

    row.appendChild(cell);
    tableContent.appendChild(row);
  }

  document.getElementById('results-body').replaceChildren(tableContent);
}

chrome.runtime.onMessage.addListener(message => {
  if (message.type === 'checker-results') {
    renderResults(message.results);
  }
});

document.getElementById('check-btn').addEventListener('click', function() {
  const tabId = chrome.devtools.inspectedWindow.tabId;

  chrome.scripting.executeScript({
    target: { tabId, allFrames: true },
    files: ['./content.js']
  });
});

