# @-/cli-source

The source of truth for the latest version for the cli source. `@tunnel/cli-source` also contains the default package that is installed when we don't have a prebuilt binary release (`@tunnel/cli-source-*`) for the user's operating system.

## Releases

Builds the source/distribution code for `@tunnel/cli-source` for various platform and architecture combinations.

The reason why this is needed is because we depend on a few Node.js native modules that should be built in advance.

## Wrapper command

> **Note:** We require the user to explicitly pass Tunnel's temporary port to their local development application, either by reading the `TUNNEL_PORT` environment variable (which is automatically added when using the wrapper command), or by specifying the `PORT` constant to be statically replaced in their dev script (e.g. `next dev --port PORT`).
