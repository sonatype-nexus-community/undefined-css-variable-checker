import { checkAllStyles } from '@sonatype/undefined-css-custom-property-checker';

// TODO at the moment this is a dumping ground for things in the main checker file which are specific
// to the chrome extension and not the utility lib. Will be refactored to use the utility lib later

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
    yield {
      ...result,
      selector: result.selector || generateSelector(result.element),
      styleSheet: result.inline ? '(inline)' : getStyleSheetLabel(result.styleSheet)
    };
  }
}

const results = Array.from(getResults());

chrome.runtime.sendMessage({ type: 'checker-results', results });
//chrome.runtime.onMessage.addListener(message => {
  //console.log('received message in checker', message);
  //if (message.type === 'highlight-element') {
    //const { element } = results[message.elementIndex];

    //// inspect is a global that is available when the dev tools are open, I think
    //inspect(element);
  //}
//});
