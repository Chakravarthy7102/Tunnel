import LocaltunnelServerStack from '#stacks/localtunnel-server/stack.ts';
import { App } from 'cdktf';

const app = new App();
new LocaltunnelServerStack(app, 'localtunnel');
app.synth();
