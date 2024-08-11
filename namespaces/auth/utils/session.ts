import type { WorkosSession } from '#types';
import { env } from '@-/env';
import { sealData, unsealData } from 'iron-session';

export async function parseWosSessionString(wosSession: string) {
	return unsealData<WorkosSession>(
		wosSession,
		{ password: env('WORKOS_COOKIE_PASSWORD') },
	);
}

export async function createWosSessionString(session: WorkosSession) {
	return sealData(session, { password: env('WORKOS_COOKIE_PASSWORD') });
}
