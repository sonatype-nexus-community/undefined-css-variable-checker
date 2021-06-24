# CSS Undefined Variable Checker
This repository contains two closely related tools for checking webpages for uses of undefined CSS variables – that
is, CSS `var()` calls that refer to a custom CSS property that is not in scope.

The `npm-package` subdirectory contains a JavaScript library which implements the underlying detection logic. This
library is (planned to be) published on NPM under the name `@sonatype/undefined-css-variable-checker`.

The `chrome-extension` subdirectory contains the source code for a Chrome Devtools Extension which can be used to
interactively check a page and observe the results.

## The Fine Print

It is worth noting that this is **NOT SUPPORTED** by Sonatype, and is a contribution of ours
to the open source community (read: you!)

Remember:

* Use this contribution at the risk tolerance that you have
* Do NOT file Sonatype support tickets related to support of this library and/or Chrome extension
* DO file issues here on GitHub, so that the community can pitch in
