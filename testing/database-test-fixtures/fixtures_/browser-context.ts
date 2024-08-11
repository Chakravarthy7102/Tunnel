import type { FixtureKeyOfType } from '#types';
import { defineFixture } from '#utils/define.ts';

export const BrowserContext = <
	_$TestSlug extends string,
	$FixturesSpecInput,
>() => (defineFixture({
	async create({ actorUser: actorUserKey }: {
		actorUser: FixtureKeyOfType<$FixturesSpecInput, 'User'> | null;
	}, { browser }: any) {
		const browserContext = await browser.newContext();
		browserContext.setDefaultTimeout(10_000);
		// We set a large timeout to account for Next.js taking a long time to compile
		browserContext.setDefaultNavigationTimeout(15_000);
		if (actorUserKey === null) {
			return browserContext;
		}

		throw new Error('todo: need to implement login');

		return browserContext;
	},
	async destroy(browserContext) {
		await browserContext.close();
	},
}));
