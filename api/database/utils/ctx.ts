import type { ActionCtx } from '#types';
import { ApiUrl } from '@-/url/api';
import { updateDatabaseApiVersion } from './vapi.ts';

export function createActionVctx(ctx: ActionCtx) {
	return {
		...ctx,
		async runQuery(fn: any, args: any) {
			try {
				return await ctx.runQuery(fn, {
					...args,
					hash: process.env.CONVEX_SECRET,
				});
			} catch (error: any) {
				return handleFunctionError({ ctx, type: 'query', fn, args, error });
			}
		},
		async runMutation(fn: any, args: any) {
			try {
				return await ctx.runMutation(fn, {
					...args,
					hash: process.env.CONVEX_SECRET,
				});
			} catch (error: any) {
				return handleFunctionError({ ctx, type: 'mutation', fn, args, error });
			}
		},
		async runAction(fn: any, args: any) {
			try {
				return ctx.runAction(fn, {
					...args,
					hash: process.env.CONVEX_SECRET,
				});
			} catch (error: any) {
				return handleFunctionError({ ctx, type: 'action', fn, args, error });
			}
		},
	};
}

async function handleFunctionError({
	ctx,
	type,
	fn,
	args,
	error,
}: {
	ctx: any;
	type: 'query' | 'mutation' | 'action';
	fn: any;
	args: any;
	error: any;
}) {
	if (error.message.includes("Could not find public function for 'v")) {
		const { newDatabaseApiVersion, newFunctionName } = await getNewFunctionName(
			{ fn, error },
		);
		const result = await ctx[
			`run${type.charAt(0).toUpperCase()}${type.slice(1)}`
		](newFunctionName, {
			...args,
			hash: process.env.CONVEX_SECRET,
		});

		updateDatabaseApiVersion(newDatabaseApiVersion);

		return result;
	} else {
		throw error;
	}
}

async function getNewFunctionName({ fn, error }: { fn: any; error: any }) {
	const currentVersion = error.message.match(/'v(\d+)'/)?.[1];
	// Fetch the latest database version and update `vapi`
	const response = await fetch(ApiUrl.getWebappUrl({
		withScheme: true,
		// TODO: determine convex release based on preview (somehow)
		fromRelease: 'production',
		path: '/api/cli-metadata',
	}));
	const result = await response.json();
	const newDatabaseApiVersion = result['@-/database'].version;
	if (newDatabaseApiVersion === currentVersion) {
		throw error;
	}

	// Try the query again with the newest version
	const newFunctionName = fn[Symbol.for('functionName')].replace(
		`v${currentVersion}`,
		`v${result['@-/database'].version}`,
	);

	return { newDatabaseApiVersion, newFunctionName };
}
