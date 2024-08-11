import type { Id } from '@-/database';
import { env } from '@-/env';
import Ably from 'ably/promises.js';
import { $try, ok } from 'errok';

export const ApiUserLoginRequest_fulfill = ({
	userLoginRequestId,
	userId,
	refreshToken,
	accessToken,
}: {
	userLoginRequestId: string;
	userId: Id<'User'>;
	refreshToken: string;
	accessToken: string;
}) => ($try(async function*() {
	const ably = new Ably.Realtime({ key: env('ABLY_API_KEY') });
	await ably.channels.get(`userLoginRequest:${userLoginRequestId}`).publish(
		'fulfill',
		{
			accessToken,
			refreshToken,
			userActor: {
				type: 'User',
				data: { id: userId },
			},
		},
	);
	return ok();
}));
