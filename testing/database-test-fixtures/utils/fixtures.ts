import * as fixtures from '#fixtures/_.ts';
import type { FixturesSpec, FixtureValue, GetFixturesSpecArgs } from '#types';
import mapObject from 'map-obj';
import onetime from 'onetime';
import pProps from 'p-props';
import type { PlaywrightTestArgs } from 'playwright/test';

/**
	@example ```javascript
		const getFixtures = defineTestFixtures(
			'filters-test',
			{
				browserContext: { type: 'BrowserContext' },
				user: { type: 'User' },
				organization: {
					type: 'Organization',
					ownerUser: 'user'
				},
				project: {
					type: 'Project',
					identifier: 'proj',
					ownerOrganization: 'organization'
				}
			}
		);
	```
*/
export function defineTestFixtures<
	$TestSlug extends string,
	$FixturesSpecInput extends FixturesSpec<$TestSlug, $FixturesSpecInput>,
>(
	testSlug: $TestSlug,
	getFixturesSpec: (
		args: GetFixturesSpecArgs,
	) => $FixturesSpecInput,
): (args: PlaywrightTestArgs) => Promise<
	{
		[$FixtureKey in keyof $FixturesSpecInput]: FixtureValue<
			$TestSlug,
			$FixturesSpecInput[$FixtureKey]['type']
		>;
	} & {
		_meta: {
			spec: $FixturesSpecInput;
			testSlug: string;
		};
		_values: Record<string, () => Promise<any>>;
	}
> {
	const fixtureGetters: any = {};
	const fixtureValues: any = {};
	const fixturesSpec = getFixturesSpec({
		authSession: Object.assign((index: 1 | 2) => ({ index }), {
			actor: () => ({ index: 0 } as const),
		}),
	});

	for (
		const [fixtureKey, fixtureSpec] of Object.entries(
			fixturesSpec,
		)
	) {
		const { type, ...fixtureArgs } = fixtureSpec;
		fixtureGetters[fixtureKey] = onetime(async (testArgs) => {
			const fixtureValue = await (fixtures as any)[type](testSlug).create.call(
				{
					getFixture(key: string) {
						return fixtureGetters[key]();
					},
					getKey: () => fixtureKey,
				},
				fixtureArgs,
				testArgs,
			);
			fixtureValues[fixtureKey] = fixtureValue;
			return fixtureValue;
		});
	}

	// @ts-expect-error: broken
	return async (testArgs: PlaywrightTestArgs) =>
		pProps({
			...mapObject(
				fixturesSpec,
				// @ts-expect-error: todo
				(key, fixtureSpec: any) => {
					const fixtureGetter = fixtureGetters[key];
					return [
						key,
						fixtureGetter(testArgs).then(async (fixtureValue: any) => {
							// Create the fixture relations as well
							if ('relations' in fixtureSpec) {
								await Promise.all(fixtureSpec.relations.map(
									(relation: string) => fixtureGetters[relation](testArgs),
								));
							}

							return fixtureValue;
						}),
					];
				},
			),
			_meta: {
				spec: fixturesSpec,
				testSlug,
			},
			_values: fixtureValues,
		});
}

export async function destroyTestFixtures<
	$TestSlug extends string,
	$FixturesSpecInput extends FixturesSpec<$TestSlug, $FixturesSpecInput>,
>(
	getFixture: {
		_meta: { spec: Record<string, any>; testSlug: string };
		_values: Record<string, any>;
	},
): Promise<void> {
	const meta = getFixture._meta;
	const values = getFixture._values;
	await Promise.all(
		Object.entries(values).map(async ([fixtureKey, fixtureValue]) => {
			if (fixtureKey === '_meta') return;
			// The fixture might not have been created yet (since they're lazily created)

			const fixtureSpec = meta.spec[fixtureKey];
			const { type } = fixtureSpec;
			await (fixtures as any)[type](meta.testSlug).destroy(fixtureValue);
		}),
	);
}
