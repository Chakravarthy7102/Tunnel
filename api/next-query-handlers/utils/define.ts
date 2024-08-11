import type { NextQueryHandler } from '#types';
import { parseNextQuery } from '#utils/parse.ts';
import type { z, ZodSchema } from '@-/zod';
import mapObject from 'map-obj';
import queryString from 'query-string';

export function defineNextQueryHandler<
	$InputSchema extends ZodSchema,
	$Actions extends Record<
		string,
		(this: { input: z.infer<$InputSchema> }, ...args: any) => any
	>,
>(
	handlerName: string,
	{ actions, input: inputSchema }: { actions: $Actions; input: $InputSchema },
): NextQueryHandler<
	$InputSchema,
	{ [$Action in keyof $Actions]: OmitThisParameter<$Actions[$Action]> }
> {
	const queryHandler = {
		fromNextQuery({ next }: { next?: string }) {
			const parseResult = parseNextQuery({ next });
			if (parseResult.isErr()) {
				return null;
			}

			const { input: rawInput, handler } = parseResult.value;
			const inputParseResult = inputSchema.safeParse(rawInput);
			if (!inputParseResult.success) {
				return null;
			}

			const input = inputParseResult.data;

			const bindedActions = mapObject(
				actions,
				(actionName, action: (...args: any) => any) => [
					actionName as string,
					action.bind({ input }),
				],
			);

			return handler === handlerName ?
				{
					...queryHandler,
					...bindedActions,
				} :
				null;
		},
		getQueryValue(input: z.infer<$InputSchema>) {
			return JSON.stringify({
				handler: handlerName,
				input,
			});
		},
		appendNextToUrl(url: string, input: z.infer<$InputSchema>) {
			const nextQueryValue = this.getQueryValue(input);
			if (url.startsWith('/')) {
				const query = queryString.parse(url);
				return queryString.stringify({
					...query,
					next: nextQueryValue,
				});
			} else {
				const { query } = queryString.parseUrl(url);
				return queryString.stringifyUrl({
					url,
					query: {
						...query,
						next: nextQueryValue,
					},
				});
			}
		},
	};

	return queryHandler as any;
}
