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

  /**
   * Given a CSSStyleValue and a selector or element on which it is used, find any cases on that selector/element
   * where an undefined CSS custom property is used
   * @return an iterator of names of undefined CSS custom properties
   */
  function* checkCssValue(value, elOrSelector) {
    if (value instanceof CSSUnparsedValue) {
      for (const valueFragment of value) {
        if (valueFragment instanceof CSSVariableReferenceValue) {
          const { variable, fallback } = valueFragment;

          if (fallback) {
            // if there is a fallback, then it's ok if the variable is not defined. But we still
            // need to check if the fallback itself relies on undefined variables
            yield* checkCssValue(fallback, elOrSelector);
          }
          else {
            const elements = typeof elOrSelector === 'string' ? getElementsBySelector(elOrSelector) : [elOrSelector];

            for (const element of elements) {
              const variableValue = getComputedStyle(element).getPropertyValue(variable);

              if (!variableValue) {
                yield variable;
              }
            }
          }
        }
      }
    }
  }

  /**
   * look through a StylePropertyMap for undefined vars
   * @return an iterator of names of undefined CSS custom properties
   */
  function* checkStyleMap(styleMap, elOrSelector) {
    for (const [value] of styleMap.values()) {
      yield* checkCssValue(value, elOrSelector);
    }
  }

  /**
   * Search all stylesheets loaded into the document for uses of undefined CSS custom properties.
   * @return an iterator of objects specifying the variable name, an info string about the stylesheet, and
   * the selector within the stylesheet where the issue was found.
   */
  function* checkStylesheets() {
    for (const styleSheet of document.styleSheets) {
      const styleSheetLabel = styleSheet.title ? `${styleSheet.title}: ${styleSheet.href}` : styleSheet.href;

      for (const rule of styleSheet.cssRules) {
        if (rule instanceof window.CSSStyleRule) {
          const { selectorText, styleMap } = rule;

          const badVars = checkStyleMap(styleMap, selectorText);

          for (const variable of badVars) {
            yield {
              variable,
              styleSheet: styleSheetLabel,
              selector: selectorText
            };
          }
        }
      }
    }
  }

  /**
   * Search all inline style attributes in the document for uses of undefined CSS custom properties.
   * @return an iterator of objects specifying the variable name, an info string about the stylesheet (just "(inline)"
   * in this case), and a selector for the element where the issue was found.
   */
  function* checkInlineStyles() {
    for (const el of document.querySelectorAll('[style]')) {
      const { attributeStyleMap } = el;

      const badVars = checkStyleMap(attributeStyleMap, el);

      for (const variable of badVars) {
        yield {
          variable,
          styleSheet: '(inline)',
          selector: generateSelector(el)
        };
      }
    }
  }

  function* checkAllStyles() {
    yield* checkStylesheets();
    yield* checkInlineStyles();
  }

  chrome.runtime.sendMessage({ type: 'checker-results', results: Array.from(checkAllStyles()) });
})();
