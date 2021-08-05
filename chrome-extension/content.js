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
import { checkAllStyles } from '@sonatype/undefined-css-variable-checker';

// given an element in the document, create a selector consisting of the tag, id, and classes of that element
// and all ancestors
function generateSelector(el) {
  function selectorForEl(el) {
    const { tagName, classList, id } = el,
        classSelector = classList.length ? `.${Array.from(classList).join('.')}` : '',
        idSelector = id ? `#${id}` : '';

    return tagName.toLowerCase() + idSelector + classSelector;
  }

  function* getSelectorParts(el) {
    if (el.parentElement) {
      yield* getSelectorParts(el.parentElement);
    }

    yield selectorForEl(el);
  }

  return Array.from(getSelectorParts(el)).join(' > ');
}

const getStyleSheetLabel = styleSheet => styleSheet.title ?
  `${styleSheet.title}: ${styleSheet.href}` : styleSheet.href;

function* getResults() {
  const rawResults = checkAllStyles();
  for (const result of rawResults) {
    if (result.exception) {
      yield {
        error: true,
        styleSheet: getStyleSheetLabel(result.styleSheet)
      }
    }
    else {
      yield {
        ...result,
        selector: result.selector || generateSelector(result.element),
        styleSheet: result.inline ? '(inline)' : getStyleSheetLabel(result.styleSheet)
      };
    }
  }
}

// save as a global var so that it's accessible in the highlight-element eval script. Note that the global
// context here is separate from that of the actual page.
self.results = Array.from(getResults());

chrome.runtime.sendMessage({ type: 'checker-results', results: self.results });
