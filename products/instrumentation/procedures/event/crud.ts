import type { FunctionEventId } from '#types';
import { defineProcedure } from '#utils/procedure.ts';
import { tnlProperties } from '#utils/tnl-aliases.ts';
import { TNL__ } from '#utils/tnl.ts';
import { ProcedureError } from '@-/errors';
import { z } from '@-/zod';
import { ok } from 'errok';

export const event_get = defineProcedure({
	input: z.object({
		id: z.string(),
	}),
	async query({ input }) {
		const event = TNL__[tnlProperties.getEvent](input.id as FunctionEventId);
		return ok(event);
	},
	error: ({ error }) =>
		new ProcedureError('There was an error retrieving the event', error),
});
