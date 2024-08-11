# Tunnel Angular SDK

Tunnel gives developers a better way to share their work with others. With Tunnel, you and your team can collaborate and give product feedback throughout the entire product lifecycle.

`@tunnel/angular` exports a Angular component that makes it easy to add Tunnel's collaboration and review tools to any Angular application.

## Getting Started

### Installation

```shell
npm install @tunnel/angular
```

## Usage

```javascript
import { BrowserModule } from "@angular/platform-browser";
import { PROJECT_ID, BRANCH, TunnelToolbarModule } from "@tunnel/angular";

import { MyApp } from "./app.component.ts";

@NgModule({
  bootstrap: [MyApp],
  declarations: [MyApp],
  imports: [BrowserModule, TunnelToolbarModule],
  providers: [
    { provide: PROJECT_ID, useValue: "YOUR_PROJECT_ID" }
    // optional
    { provide: BRANCH, useValue: "YOUR_GIT_BRANCH" }
  ],
})
export class MyAppModule {}
```

For more information and examples, visit our [Documentation](https://docs.tunnel.dev/sdks/angular).

## Support

Get in touch with us by:

- Joining our official [Discord server](https://discord.gg/zMw6ZF2qCf).
