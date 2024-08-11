# @tunnel/cli-development

`@tunnel/cli-development` lets you easily add `tunneld` to your terminal for development.

## Installation

Install `@tunnel/cli-development` globally using your favorite package manager.

```sh
# npm
npm install -g @tunnel/cli-development

# yarn
yarn add -g @tunnel/cli-development

# pnpm
pnpm add -g @tunnel/cli-development
```

## Configuration

The configuration for `@tunnel/cli-development` is stored in `~/.tunnel/.env.development`. You can modify this file directly to update the configuration, which will be loaded immediately the next time `tunneld` is run.

### `TUNNEL_MONOREPO_DIRPATH`

The full path to the Tunnel monorepo on your machine.
