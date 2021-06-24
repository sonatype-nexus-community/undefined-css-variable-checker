# CSS Undefined Variable Checker
This repository contains two closely related tools for checking webpages for uses of undefined CSS variables – that
is, CSS `var()` calls that refer to a custom CSS property that is not in scope.

The `npm-package` subdirectory contains a JavaScript library which implements the underlying detection logic. This
library is (planned to be) published on NPM under the name `@sonatype/undefined-css-variable-checker`.

The `chrome-extension` subdirectory contains the source code for a Chrome Devtools Extension which can be used to
interactively check a page and observe the results.
