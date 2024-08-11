import * as jwtDefinitions from '#jwt/_.ts';
import { env } from '@-/env';
import { createNestedNamespace, type NestedNamespace } from '@tunnel/namespace';
import memoize from 'memoize';
import onetime from 'onetime';

type Jwts = NestedNamespace<typeof jwtDefinitions>;

const createServerJwtNamespaces = memoize(
	({
		jwtSecretKey,
	}: {
		jwtSecretKey: string;
	}): {
		[Namespace in keyof Jwts]: {
			[Property in keyof Jwts[Namespace] & string]: {
				sign: Jwts[Namespace][Property]['sign'];
				verify: Jwts[Namespace][Property]['verify'];
			};
		};
	} => {
		const jwtDefinitionThis = {
			secret: new TextEncoder().encode(jwtSecretKey),
		};

		return createNestedNamespace(jwtDefinitions, {
			transformProperty({ property }) {
				return {
					sign: property.sign.bind(jwtDefinitionThis),
					verify: property.verify.bind(jwtDefinitionThis),
				};
			},
		});
	},
	{ cacheKey: (args) => args[0].jwtSecretKey },
);

export const getServerJwts = onetime(() => {
	const jwtSecretKey = env('JWT_SECRET_KEY');
	return createServerJwtNamespaces({ jwtSecretKey });
});
