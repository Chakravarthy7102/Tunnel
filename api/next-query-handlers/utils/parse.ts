import { nextQueryPayloadSchema } from '#schemas/payload.ts';
import type { NextQueryPayload } from '#types';
import { destr } from 'destru';
import { err, ok, type Result } from 'errok';

export function parseNextQuery({
	next,
}: {
	next?: string;
}): Result<NextQueryPayload, unknown> {
	if (next === undefined) {
		return err(undefined);
	}

	const nextQueryPayloadParseResult = nextQueryPayloadSchema.safeParse(
		destr(next),
	);

	if (!nextQueryPayloadParseResult.success) {
		return err(nextQueryPayloadParseResult.error);
	}

	return ok(nextQueryPayloadParseResult.data);
}
