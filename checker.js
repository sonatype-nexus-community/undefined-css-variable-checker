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

  function checkCssValue(value, selectorText) {
    if (value instanceof CSSUnparsedValue) {
      for (const valueFragment of value) {
        if (valueFragment instanceof CSSVariableReferenceValue) {
          const { variable, fallback } = valueFragment;

          if (fallback) {
            // if there is a fallback, then its ok if the variable is not defined. But we still
            // need to check if the fallback itself relies on undefined variables
            checkCssValue(fallback);
          }
          else {
            for (const element of getElementsBySelector(selectorText)) {
              const variableValue = getComputedStyle(element).getPropertyValue(variable);

              if (!variableValue) {
                results.push({ variable, selectorText });
              }
            }
          }
        }
      }
    }
  }

  for (const styleSheet of document.styleSheets) {
    for (const rule of styleSheet.cssRules) {
      if (rule instanceof window.CSSStyleRule) {
        const { selectorText, styleMap } = rule;


        for (const [value] of Array.from(styleMap.values())) {
          checkCssValue(value, selectorText);
        }
      }
    }
  }

  chrome.runtime.sendMessage({ type: 'checker-results', results });
})();
