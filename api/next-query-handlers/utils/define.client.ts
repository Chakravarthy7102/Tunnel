import type { ClientNextQueryHandler } from '#types';
import type { z, ZodSchema } from '@-/zod';
import queryString from 'query-string';

export function defineClientNextQueryHandler<$InputSchema extends ZodSchema>(
	handlerName: string,
	_args: { input: $InputSchema },
): ClientNextQueryHandler<$InputSchema> {
	const queryHandler = {
		getQueryValue(input: z.infer<$InputSchema>) {
			return JSON.stringify({
				handler: handlerName,
				input,
			});
		},
		appendNextToUrl(url: string, input: z.infer<$InputSchema>) {
			const nextQueryValue = this.getQueryValue(input);
			const { query } = queryString.parseUrl(url);
			const nextUrl = queryString.stringifyUrl({
				url,
				query: {
					...query,
					next: nextQueryValue,
				},
			});
			return nextUrl;
		},
	};

	return queryHandler as any;
}
