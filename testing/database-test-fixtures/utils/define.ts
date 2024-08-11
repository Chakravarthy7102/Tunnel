import type { FixturesThis } from '#types';
import type { PlaywrightTestArgs } from 'playwright/test';
import type { Promisable } from 'type-fest';

export function defineFixture<
	$Create extends (
		this: FixturesThis,
		input: any,
		testArgs: PlaywrightTestArgs & { id: number },
	) => Promisable<any>,
	$Destroy extends (
		fixture: Awaited<ReturnType<$Create>>,
	) => Promisable<any>,
>(fixture: { create: $Create; destroy: $Destroy }) {
	return fixture;
}
