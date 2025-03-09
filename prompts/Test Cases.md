---
purpose: to serve as a test prompt
---

# Test Cases 

## Context

- this repo puts all test files in the `tests` directory
- we use [Vitest]() as the test runner
- in our test files we include not only "runtime tests" (which Vitest is good at) but also include "type tests" which we use the `@type-challenges/utils` libraries for. 
  - The `expect()` tests inside of `it()` blocks are how runtime tests are tested
  - There is another library `typed-tester` which we use to test the type tests

::code parseMarkdown.ts

See the code block above.

## Books are Cool

::web https://github.com/inocan-group/inferred-types

