import * as jwtDefinitions from '#jwt/_.ts';
import { createNestedNamespace, type NestedNamespace } from '@tunnel/namespace';
import onetime from 'onetime';

type Jwts = NestedNamespace<typeof jwtDefinitions>;

const createClientJwtNamespaces = onetime(
	(): {
		[Namespace in keyof Jwts]: {
			[Property in keyof Jwts[Namespace] & string]: {
				decode: Jwts[Namespace][Property]['decode'];
			};
		};
	} =>
		createNestedNamespace(jwtDefinitions, {
			transformProperty({ property }) {
				return {
					decode: property.decode,
				};
			},
		}) as any,
);

export function getClientJwts(): ReturnType<typeof createClientJwtNamespaces> {
	return createClientJwtNamespaces();
}
