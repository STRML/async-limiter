# Changelog

### v2.0.0 (2019-11-20)

> **This release contains minor breaking changes. These changes should not affect most applications.**

#### Breaking:

- Jobs will not start until the next tick (`process.nextTick`) after the first job is added. 
This allows you to order multiple jobs synchronously without unexpected effects.

This should align the limiter closer to programmer expectations, but
is technically breaking: the current code will immediately begin executing
the first job as soon as it is pushed.

This change also fixes a few edge-case bugs related to ordering & sync jobs:

- If an `onDone()` callback were added before any jobs were added in the same
tick, it would be immediately called.
- If a synchronous job were added, it would immediately execute completely
and potentially call `onDone()`.

#### Other changes:
- Internals refactoring
- Fix example calling `start()` (queue starts automatically)

### v1.0.1 (2019-08-02)

- Add `coverage` folder to npmignore for smaller bundle

### v1.0.0 (2017-09-11)

- Initial implementation