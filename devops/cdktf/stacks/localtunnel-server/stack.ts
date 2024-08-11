import { env } from '@-/env';
import { Droplet } from '@cdktf/provider-digitalocean/lib/droplet';
import { Loadbalancer } from '@cdktf/provider-digitalocean/lib/loadbalancer';
import { DigitaloceanProvider } from '@cdktf/provider-digitalocean/lib/provider';
import { SshKey } from '@cdktf/provider-digitalocean/lib/ssh-key';
import { Fn, TerraformStack } from 'cdktf';
import type { Construct } from 'constructs';
import { getUserData } from './data/user-data.ts';

export default class LocaltunnelServerStack extends TerraformStack {
	constructor(scope: Construct, name: string) {
		super(scope, name);

		new DigitaloceanProvider(this, 'provider', {
			token: env('DIGITALOCEAN_TOKEN'),
		});

		const sshKey = new SshKey(this, 'sshKey', {
			name: 'do_cdktf',
			publicKey: env('DIGITALOCEAN_PUBLIC_KEY'),
		});

		const droplet = new Droplet(this, 'localtunnel-server', {
			image: 'ubuntu-20-04-x64',
			name,
			region: 'nyc1',
			size: 's-1vcpu-1gb',
			sshKeys: [sshKey.id.toString()],
			userData: getUserData(),
		});

		new Loadbalancer(this, 'lb', {
			name: 'default',
			region: 'nyc1',
			algorithm: 'round_robin',
			healthcheck: {
				port: 80,
				protocol: 'http',
				path: '/health',
			},
			forwardingRule: [{
				entryProtocol: 'tcp',
				entryPort: 80,
				targetProtocol: 'tcp',
				targetPort: 80,
			}],
			dropletIds: [Fn.tonumber(droplet.id)],
		});
	}
}
