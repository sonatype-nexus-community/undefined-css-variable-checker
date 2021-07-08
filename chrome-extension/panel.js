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

function separateErrorResults(results) {
  const normalResults = [],
      errorResults = [];

  for (const result of results) {
    (result.error ? errorResults : normalResults).push(result);
  }

  return [normalResults, errorResults];
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

function renderErrors(results) {
  const errorContainer = document.getElementById('error-container');

  if (!results.length) {
    errorContainer.replaceChildren();
  }
  else {
    const alertEl = document.createElement('div'),
        paragraph = document.createElement('p'),
        list = document.createElement('ol');

    alertEl.id = 'error-alert';
    alertEl.classList.add('nx-alert', 'nx-alert--error');
    paragraph.classList.add('nx-p');

    paragraph.textContent = `The following stylesheets could not be inspected. This most commonly
      indicates that the stylesheets are cross-domain resources which were not served up with the necessary CORS
      headers for access from this domain. Any undefined CSS variables in these stylesheets will not be reported
      above.`;

    for (const result of results) {
      const listItem = document.createElement('li');
      listItem.textContent = result.styleSheet;
      list.append(listItem);
    }

    alertEl.append(paragraph);
    alertEl.append(list);

    errorContainer.replaceChildren(alertEl);
  }
}

chrome.runtime.onMessage.addListener(message => {
  if (message.type === 'checker-results') {
    const [results, errorResults] = separateErrorResults(message.results);
    renderResults(results);
    renderErrors(errorResults);
  }
});

document.getElementById('check-btn').addEventListener('click', function() {
  const tabId = chrome.devtools.inspectedWindow.tabId;

  chrome.scripting.executeScript({
    target: { tabId, allFrames: true },
    files: ['./content.js']
  });
});

