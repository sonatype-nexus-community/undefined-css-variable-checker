(function() {
  const elementsBySelector = {},
      results = [];

  function getElementsBySelector(selector) {
    const cached = elementsBySelector[selector];
    if (cached) {
      return cached;
    }
    else {
      const elements = document.querySelectorAll(selector);
      elementsBySelector[selector] = elements;
      return elements;
    }
  }

  function checkCssValue(value, elOrSelector, location) {
    if (value instanceof CSSUnparsedValue) {
      for (const valueFragment of value) {
        if (valueFragment instanceof CSSVariableReferenceValue) {
          const { variable, fallback } = valueFragment;

          if (fallback) {
            // if there is a fallback, then its ok if the variable is not defined. But we still
            // need to check if the fallback itself relies on undefined variables
            checkCssValue(fallback, elOrSelector, location);
          }
          else {
            const elements = typeof elOrSelector === 'string' ? getElementsBySelector(elOrSelector) : [elOrSelector];

            for (const element of elements) {
              const variableValue = getComputedStyle(element).getPropertyValue(variable);

              if (!variableValue) {
                results.push({ variable, location });
              }
            }
          }
        }
      }
    }
  }

  // look through a StylePropertyMap for undefined vars
  function checkStyleMap(styleMap, elOrSelector, location) {
    for (const [value] of styleMap.values()) {
      checkCssValue(value, elOrSelector, location);
    }
  }

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

  // check for var() in stylesheets
  for (const styleSheet of document.styleSheets) {
    for (const rule of styleSheet.cssRules) {
      if (rule instanceof window.CSSStyleRule) {
        const { selectorText, styleMap } = rule;

        checkStyleMap(styleMap, selectorText, `Stylesheet selector: ${selectorText}`);
      }
    }
  }

  // check for var in style attrs
  for (const el of document.querySelectorAll('[style]')) {
    const { attributeStyleMap } = el;

    checkStyleMap(attributeStyleMap, el, `Style attribute on ${generateSelector(el)}`);
  }

  chrome.runtime.sendMessage({ type: 'checker-results', results });
})();
