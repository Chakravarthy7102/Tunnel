# Tunnel React SDK

Tunnel gives developers a better way to share their work with others. With Tunnel, you and your team can collaborate and give product feedback throughout the entire product lifecycle.

`@tunnel/react` exports a React component that makes it easy to add Tunnel's collaboration and review tools to any React application.

## Getting Started

### Installation

```shell
npm install @tunnel/react
```

## Usage

```javascript
import { TunnelToolbar } from '@tunnel/react';

export default function App() {
  return (
    <>
      <h1>My App</h1>
      {process.env.APP_ENV === 'staging' && (
        <TunnelToolbar projectId="YOUR_PROJECT_ID" />
      )}
    </>
  );
}
```

For more information and examples, visit our [Documentation](https://docs.tunnel.dev/sdks/react).

## Support

Get in touch with us by:

- Joining our official [Discord server](https://discord.gg/zMw6ZF2qCf).
