import { cli } from '@-/cli-helpers';
import { env } from '@-/env';

export async function stripeListen() {
	await cli.stripe(
		[
			'listen',
			'--skip-verify',
			'--forward-to',
			'https://tunnel.test/api/webhooks/stripe',
			'--api-key',
			env('STRIPE_SECRET'),
		],
		{
			stdio: 'inherit',
		},
	);
}
