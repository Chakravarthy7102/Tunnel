# @-/cli-single-executable-application

The single executable application that's executed when the user runs the `tunnel` command.

Benefits of using a single executable application:

- Doesn't require the user to have Node.js installed
- We support other methods of installation (not just npm)

## Implementation

`@tunnel/cli-single-executable-application` contains a minimal Node.js script that performs the following steps:

1. Fetches the active version of the `@tunnel/cli-source` package (by querying <https://tunnel.dev/api/cli-metadata>) and checks if a folder exists at `~/.tunnel/cli-source/<target>/<active-version>`.
   - If the folder doesn't exist, dynamically downloads the latest version of `@tunnel/cli-source-<target>` from NPM based on the user's OS and architecture.
2. Runs `~/.tunnel/cli-source/<target>/<active-version>/bin/tunnel.js` via a Node.js `require` call.

Because a Node.js SEA can be quite large (~30MB compressed), `@tunnel/sea` is only downloaded once and saved to `~/.tunnel/cli-single-executable-application/<target>/<version>/tunnel`.

### For non-supported architectures

We also publish a target-agnostic `@tunnel/cli-single-executable-application` package which only ships the Node.js script without Node.js bundled (i.e. it will fall back to using `#!/usr/bin/env node`).

## Updates

If we publish a new version of `@tunnel/cli-single-executable-application`, all users will be forced to re-download it as part of the `@tunnel/cli` script.

## `.build/` folders

`.build/`: Contains the transpiled + bundled JavaScript code which is saved as `.build/tunnel.js`
