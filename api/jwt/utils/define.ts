import type { JwtDefinition } from '#types';
import type { z, ZodSchema } from '@-/zod';
import { $try, ok, ResultAsync } from 'errok';
import * as jose from 'jose';

export function defineJwt<$PayloadSchema extends ZodSchema>({
	payload: payloadSchema,
}: {
	payload: $PayloadSchema;
}): JwtDefinition<z.infer<$PayloadSchema>> {
	return {
		decode(jwt: string) {
			return jose.decodeJwt(jwt) as z.infer<$PayloadSchema>;
		},
		async sign(payload: z.infer<$PayloadSchema>) {
			const { secret } = this;
			const jwt = await new jose.SignJWT(payload)
				.setProtectedHeader({ alg: 'HS256' })
				.setIssuedAt()
				.setExpirationTime('2h')
				.sign(secret);
			return jwt;
		},
		verify(jwt: string) {
			const { secret } = this;
			return $try(async function*() {
				const { payload } = yield* ResultAsync.fromPromise(
					jose.jwtVerify(jwt, secret),
					(error) => new Error('Failed to verify JWT', { cause: error }),
				).safeUnwrap();
				return ok(payloadSchema.parse(payload));
			});
		},
	} satisfies ThisType<{ secret: Uint8Array }>;
}
