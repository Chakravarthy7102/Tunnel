import { getOpenAiClient } from '@-/ai';
import { ProcedureError } from '@-/errors';
import { defineProcedure } from '@-/webapp/procedure-utils';
import { z } from '@-/zod';
import { ok } from 'errok';

export const projectCommentThread_generate = defineProcedure({
	input: z.object({
		prompt: z.string(),
	}),
	async mutation({ input: { prompt } }) {
		const openai = getOpenAiClient();
		return ok(await openai.complete({ prompt }));
	},
	error: ({ error }) =>
		new ProcedureError("Couldn't generate issue title", error),
});
