import { env } from '@-/env';
import { PlainClient } from '@team-plain/typescript-sdk';
import onetime from 'onetime';

export const getPlain = onetime((): PlainClient => {
	const plain = new PlainClient({
		apiKey: env('PLAIN_API_KEY'),
	});

	return plain;
});
