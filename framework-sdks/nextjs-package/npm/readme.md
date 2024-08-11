## Overview

Tunnel is a better way for developers to share and review their work. Tunnel makes it easy to collaborate and give them product feedback throughout the entire product lifecycle.

`@tunnel/nextjs` is an SDK for enabling Tunnel collaboration and review tools in your app with just one line of code.

## Getting Started

### Installation

```bash
npm install @tunnel/nextjs
```

## Usage

```javascript
import { TunnelToolbar } from '@tunnel/nextjs';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        {process.env.APP_ENV === 'staging' && (
          <TunnelToolbar projectId="YOUR_PROJECT_ID" />
        )}
      </body>
    </html>
  );
}
```

For more information and examples, visit our [Documentation](https://docs.tunnel.dev/sdks/nextjs).

## Support

Get in touch with us by:

- Joining our official [Discord server](https://discord.gg/zMw6ZF2qCf).
