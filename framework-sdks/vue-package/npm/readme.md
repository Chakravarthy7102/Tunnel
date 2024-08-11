# Tunnel Vue.js SDK

Tunnel gives developers a better way to share their work with others. With Tunnel, you and your team can collaborate and give product feedback throughout the entire product lifecycle.

`@tunnel/vue` exports a Vue.js component that makes it easy to add Tunnel's collaboration and review tools to any Vue application.

## Getting Started

### Installation

```shell
npm install @tunnel/vue
```

## Usage

```vue
<script setup>
import { TunnelToolbar } from "@tunnel/vue";
</script>

<template>
  <h1>My App</h1>
  <TunnelToolbar
    v-if="process.env.APP_ENV === 'staging'"
    projectId='YOUR_PROJECT_ID'
  />
</template>
```

For more information and examples, visit our [Documentation](https://docs.tunnel.dev/sdks/vue).

## Support

Get in touch with us by:

- Joining our official [Discord server](https://discord.gg/zMw6ZF2qCf).
