import type * as jwts from '#jwt/_.ts';
import type { JwtDefinition } from '#types';
import type { UnionToIntersection } from 'type-fest';

export type JwtPayloads = UnionToIntersection<
	{
		[K in keyof typeof jwts]: {
			[Key in K extends `${infer Namespace}_${string}` ? Namespace : never]: {
				[
					Key in K extends `${string}_${infer AnalyticsName}` ? AnalyticsName :
						never
				]: (typeof jwts)[K] extends JwtDefinition<infer Payload> ? Payload :
					never;
			};
		};
	}[keyof typeof jwts]
>;
