import { getPosthog } from '@-/analytics';
import type { Id } from '@-/database';
import { decrypt, type FlagOverridesType } from '@vercel/flags';

export async function isFeatureEnabled(
	featureKey: string,
	{ cookies, actorUser }: {
		cookies: { get(name: string): { value: string } | undefined };
		actorUser: { _id: Id<'User'> };
	},
) {
	const posthog = getPosthog();
	const overrideCookie = cookies.get('vercel-flag-overrides')?.value;
	const overrides = overrideCookie ?
		await decrypt<FlagOverridesType>(overrideCookie) :
		{};

	return overrides?.[featureKey] ??
		// eslint-disable-next-line no-return-await -- This await matters
		await posthog.isFeatureEnabled(featureKey, actorUser._id);
}
