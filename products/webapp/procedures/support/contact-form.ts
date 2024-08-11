import { WebappApiInput } from '#api-input';
import { defineProcedure } from '#utils/procedure.ts';
import { ApiConvex } from '@-/convex/api';
import { DocumentNotFoundError, ProcedureError } from '@-/errors';
import { getPlain } from '@-/support';
import { z } from '@-/zod';
import { $try, err, ok } from 'errok';

export const support_submitContactForm = defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.object({
			user: WebappApiInput.user({
				actor,
				actorRelation: 'actor',
			})(input, ctx),
			submission: z.object({
				type: z.enum(['bug', 'feedback', 'question']),
				message: z.string(),
				isUrgent: z.boolean().optional(),
			}),
		})),
	mutation: async ({
		input,
	}) => ($try(async function*() {
		const userId = yield* input.user.safeUnwrap();
		const user = yield* ApiConvex.v.User.get({
			from: { id: userId },
			include: {},
		})
			.safeUnwrap();
		if (user === null) {
			return err(new DocumentNotFoundError('User'));
		}

		const plain = getPlain();

		const upsertCustomerRes = await plain.upsertCustomer({
			identifier: {
				emailAddress: user.email,
			},
			onCreate: {
				fullName: user.fullName,
				email: {
					email: user.email,
					isVerified: true,
				},
			},
			onUpdate: {
				fullName: {
					value: user.fullName,
				},
				email: {
					email: user.email,
					isVerified: true,
				},
			},
		});
		if (upsertCustomerRes.error) {
			return err(
				Object.assign(upsertCustomerRes.error, { name: 'PlainError' }),
			);
		}

		const createThreadRes = await plain.createThread({
			customerIdentifier: {
				customerId: upsertCustomerRes.data.customer.id,
			},
			title: (input.submission.type === 'bug' ?
				'Bug Report from ' :
				input.submission.type === 'feedback' ?
				'Feedback from ' :
				'Question from ') + user.fullName,
			components: [{
				componentText: {
					text: input.submission.message,
				},
			}],
			labelTypeIds: [
				...input.submission.type === 'bug' ?
					['lt_01HV4YSM32Q9SV8YWW1KN6TX0A'] :
					[],
				...input.submission.type === 'feedback' ?
					['lt_01HV4YSYTW2XWQ4C7WJANQBHRD'] :
					[],
				...input.submission.type === 'question' ?
					['lt_01HV4YTT1948X9TN01P1SPPSCN'] :
					[],
			],
			priority: input.submission.isUrgent ? 0 : 2,
		});
		if (createThreadRes.error) {
			return err(new Error(createThreadRes.error.message));
		}

		return ok();
	})),
	error: ({ error }) =>
		new ProcedureError("Couldn't submit contact form", error),
});
