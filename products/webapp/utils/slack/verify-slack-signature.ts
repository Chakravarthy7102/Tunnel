import { env } from '@-/env';
import { Buffer } from 'node:buffer';

export async function verifySlackSignature({ request }: { request: Request }) {
	const body = await request.clone().text();

	const signature = request.headers.get('x-slack-signature');

	if (!signature) {
		return new Response('No signature', { status: 400 });
	}

	const timestamp = request.headers.get('x-slack-request-timestamp');

	const key = await crypto.subtle.importKey(
		'raw',
		new TextEncoder().encode(env('SLACK_SIGNING_SECRET')),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['verify'],
	);

	const valid = await crypto.subtle.verify(
		'HMAC',
		key,
		Buffer.from(signature.slice(3), 'hex'),
		new TextEncoder().encode(`v0:${timestamp}:${body}`),
	);

	if (!valid) return { valid: false, error: 'Invalid signature' };

	return { valid: true };
}
