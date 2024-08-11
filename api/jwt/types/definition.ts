import type { ResultAsync } from 'errok';

export interface JwtDefinition<Payload> {
	sign(payload: Payload): Promise<string>;
	/**
		Returns a `Result` in case the JWT is invalid/expired.
	*/
	verify(jwt: string): ResultAsync<Payload, unknown>;
	decode(jwt: string): Payload;
}
