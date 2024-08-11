import { ConvexHttpClient } from 'convex/browser';
import type {
	FunctionReference,
	FunctionReturnType,
	OptionalRestArgs,
} from 'convex/server';

export class TunnelConvexHttpClient extends ConvexHttpClient {
	token: string | null;
	secret?: string;

	constructor(url: string, token: string | null, secret?: string) {
		super(url);
		this.token = token;
		this.secret = secret;
	}

	async query<$Query extends FunctionReference<'query'>>(
		fn: $Query,
		...args: OptionalRestArgs<$Query>
	): Promise<FunctionReturnType<$Query>> {
		return super.query(fn, {
			...args[0],
			...(this.token ? { token: this.token } : {}),
			...(this.secret ? { hash: this.secret } : {}),
		} as any);
	}

	async mutation<$Mutation extends FunctionReference<'mutation'>>(
		fn: $Mutation,
		...args: OptionalRestArgs<$Mutation>
	): Promise<FunctionReturnType<$Mutation>> {
		return super.mutation(fn, {
			...args[0],
			...(this.token ? { token: this.token } : {}),
			...(this.secret ? { hash: this.secret } : {}),
		} as any);
	}

	async action<$Action extends FunctionReference<'action'>>(
		fn: $Action,
		...args: OptionalRestArgs<$Action>
	): Promise<FunctionReturnType<$Action>> {
		return super.action(fn, {
			...args[0],
			...(this.token ? { token: this.token } : {}),
			...(this.secret ? { hash: this.secret } : {}),
		} as any);
	}

	setAuth(token: string) {
		this.token = token;
	}

	clearAuth(): void {
		this.token = null;
	}
}
