# Tunnel Svelte SDK

Tunnel gives developers a better way to share their work with others. With Tunnel, you and your team can collaborate and give product feedback throughout the entire product lifecycle.

`@tunnel/svelte` exports a Svelte component that makes it easy to add Tunnel's collaboration and review tools to any Svelte application.

## Getting Started

### Installation

```shell
npm install @tunnel/svelte
```

## Usage

```svelte
<script>
  import { TunnelToolbar } from '@tunnel/svelte';
</script>

{#if process.env.APP_ENV === 'staging'}
  <TunnelToolbar
    projectId='YOUR_PROJECT_ID'
    branch='YOUR_BRANCH'
  />
{/if}
```

For more information and examples, visit our [Documentation](https://docs.tunnel.dev/sdks/svelte).

## Support

Get in touch with us by:

- Joining our official [Discord server](https://discord.gg/zMw6ZF2qCf).
