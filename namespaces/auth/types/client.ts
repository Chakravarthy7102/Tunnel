import type { Promisable } from 'type-fest';

export interface AuthClient {
	getToken(): Promisable<string>;
}
