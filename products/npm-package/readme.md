# @-/npm-package

`@-/npm-package` (published as `@tunnel/cli` on [npm](https://npm.im/)) allows users to install the Tunnel CLI via npm. It supports both global installations (`npm install -g @tunnel/cli`) and local installations inside a project's `package.json` file (`npm install --save-dev @tunnel/cli`).

`@-/npm-package` contains a single script which is aliased to the `tunnel` command via the "bin" property in the `package.json` file.

When executed, this script performs the following steps:

1. Retrieves the latest version of the Tunnel CLI by checking `@tunnel/cli-source`
2. Checks if the latest version of `@tunnel/cli-single-executable-application-<target>` has been installed at `~/.tunnel/cli-single-executable-application/<target>/<version>`
   - If it hasn't been installed, download it from npm

## Implementation

Because it can be included in a user's `package.json` file, its version should rarely change (and when it does, it should not force users on an older version to update).
