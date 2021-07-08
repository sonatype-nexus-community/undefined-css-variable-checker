# Undefined CSS Variable Checker

This package provides utility functions to check the current state of a webpage for any uses of undefined
CSS variables. Note that because a property could be defined in a completely different place than it is used,
this check must be performed on a live webpage, and not statically on a stylesheet alone.

Also soon to be available as a Chrome devtools extension!

## Installation
```
yarn add @sonatype/undefined-css-variable-checker
```

## API
This module exports three ECMAscript exports as follows. Each of these functions takes no parameters and returns
an iterator of objects as described farther below.

### Functions

#### checkInlineStyles
This function checks all HTML `style` attributes present on the page for uses of undefined CSS variables. The
objects which it returns contain the following fields:

<dl>
  <dt>variable</dt>
  <dd>The name of the undefined CSS variable that was found</dd>
  <dt>element</dt>
  <dd>the DOM element on which the variable was used where it was found to be undefined</dd>
</dl>

#### checkStyleSheets
This function checks all uses of CSS variables within stylesheets present on the page. For each variable
found, all elements matching the selector for that CSS block are checked to see whether the variable is defined
for that element. The objects which it returns contain the following fields:

<dl>
  <dt>variable</dt>
  <dd>The name of the undefined CSS variable that was found</dd>
  <dt>element</dt>
  <dd>the DOM element on which the variable was used where it was found to be undefined</dd>
  <dt>styleSheet</dt>
  <dd>The styleSheet object for the stylesheet where the undefined variable was found</dd>
  <dt>selector</dt>
  <dd>The selector on the CSS block where the variable was found</dd>
</dl>

Additionally, the iterator may return objects like the following in order to report errors:

<dl>
  <dt>exception</dt>
  <dd>The Exception object that was caught</dd>
  <dt>styleSheet</dt>
  <dd>The stylesheet being processed when the exception occurred</dd>
</dl>

#### checkAllStyles
An aggregate of the other two functions. The objects which it returns contain the following fields:

<dl>
  <dt>variable</dt>
  <dd>The name of the undefined CSS variable that was found</dd>
  <dt>element</dt>
  <dd>the DOM element on which the variable was used where it was found to be undefined</dd>
  <dt>inline</dt>
  <dd>boolean value for whether this object pertains to an inline `style` attribute or a stylesheet</dd>
  <dt>styleSheet</dt>
  <dd>The styleSheet object for the stylesheet where the undefined variable was found. Null for inline styles</dd>
  <dt>selector</dt>
  <dd>The selector on the CSS block where the variable was found. Null for inline styles</dd>
</dl>

Additionally, the iterator may return objects like the following in order to report errors:

<dl>
  <dt>exception</dt>
  <dd>The Exception object that was caught</dd>
  <dt>styleSheet</dt>
  <dd>The stylesheet being processed when the exception occurred</dd>
</dl>

## Browser Support
This package makes use of ES2015+ language features including generators, as well as
the [CSS Typed Object Model API](https://developer.mozilla.org/en-US/docs/Web/API/CSS_Typed_OM_API). Support for the
latter in particular is limited as of time of writing, so this package will only work in recent versions of
Chromium-based browsers.
