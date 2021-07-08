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

/**
 * checks to see if a CSSRule is of a type that is known not to support CSS variables
 */
function isIrrelevantRuleType(rule) {
  const irrelevantRuleTypes = [
    CSSFontFaceRule,
    CSSNamespaceRule,
    CSSCounterStyleRule,
    CSSKeyframesRule,
    CSSKeyframeRule
  ];

  return !!irrelevantRuleTypes.find(type => rule instanceof type);
}

/**
 * Given a CSSStyleValue and a selector or element on which it is used, find any cases on that selector/element
 * where an undefined CSS variable is used
 * @return an iterator of objects containing the variable name and the element where the issue was detected
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
          const elements = typeof elOrSelector === 'string' ? document.querySelectorAll(elOrSelector) : [elOrSelector];

          for (const element of elements) {
            const variableValue = getComputedStyle(element).getPropertyValue(variable);

            if (!variableValue) {
              yield { variable, element };
            }
          }
        }
      }
    }
  }
}

/**
 * look through a StylePropertyMap for undefined vars
 * @return an iterator of names of undefined CSS variables
 */
function* checkStyleMap(styleMap, elOrSelector) {
  // each entry in the map contains a list, hence the double loop
  for (const values of styleMap.values()) {
    for (const value of values) {
      yield* checkCssValue(value, elOrSelector);
    }
  }
}

function* checkStyleRule(rule) {
  const { selectorText, styleMap } = rule;

  const styleMapResults = checkStyleMap(styleMap, selectorText);

  for (const result of styleMapResults) {
    yield {
      ...result,
      selector: selectorText
    };
  }
}

function* checkImportRule(rule) {
  yield* checkStyleSheet(rule.stylesheet);
}

// checks rules that are subtypes of CSSGroupingRule, eg CSSMediaRule, CSSPageRule, etc.
// For our needs, CSSGroupingRule happens to have the same interface as CSSStyleSheet so
// just use the same function
const checkGroupingRule = checkStyleSheet;

function* checkRule(rule) {
  if (rule instanceof CSSStyleRule) {
    yield* checkStyleRule(rule);
  }
  else if (rule instanceof CSSImportRule) {
    yield* checkImportRule(rule);
  }
  else if (rule instanceof CSSGroupingRule) {
    yield* checkGroupingRule(rule);
  }
  else if (isIrrelevantRuleType(rule)) {
    // These rules don't use variables, so do nothing
  }
  else {
    console.warn('Unknown CSSRule found', rule);
  }
}

function* checkStyleSheet(styleSheet) {
  let rules;
  try {
    rules = styleSheet.cssRules;
  }
  catch (exception) {
    yield { exception, styleSheet };

    return;
  }

  for (const rule of rules) {
    yield* checkRule(rule);
  }
}

/**
 * Search all stylesheets loaded into the document for uses of undefined CSS variables.
 */
export function* checkStyleSheets() {
  for (const styleSheet of document.styleSheets) {
    for (const result of checkStyleSheet(styleSheet)) {
      yield { ...result, styleSheet };
    }
  }
}

/**
 * Search all inline style attributes in the document for uses of undefined CSS variables.
 */
export function* checkInlineStyles() {
  for (const el of document.querySelectorAll('[style]')) {
    const { attributeStyleMap } = el;

    yield* checkStyleMap(attributeStyleMap, el);
  }
}

export function* checkAllStyles() {
  const styleSheetResults = checkStyleSheets(),
      inlineResults = checkInlineStyles();

  for (const result of styleSheetResults) {
    yield { ...result, inline: false };
  }

  for (const result of inlineResults) {
    yield {
      ...result,
      inline: true,
      styleSheet: null,
      selector: null
    };
  }
}
