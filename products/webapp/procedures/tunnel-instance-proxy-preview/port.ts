import { WebappApiInput } from '#api-input';
import { defineProcedure } from '#utils/procedure.ts';
import { ApiConvex } from '@-/convex/api';
import { DocumentNotFoundError, ProcedureError } from '@-/errors';
import { z } from '@-/zod';
import arrayUnique from 'array-uniq';
import { $try, err } from 'errok';

export const tunnelInstanceProxyPreview_addAllowedPortNumber = defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.object({
			tunnelInstanceProxyPreview: WebappApiInput.tunnelInstanceProxyPreview({
				identifier: 'id',
				actor,
				actorRelation: 'creator',
			})(input, ctx),
			portNumber: z.number(),
		})),
	mutation: async ({ input }) => ($try(async function*() {
		const tunnelInstanceProxyPreviewId = yield* input
			.tunnelInstanceProxyPreview
			.safeUnwrap();
		const tunnelInstanceProxyPreview = yield* ApiConvex.v
			.TunnelInstanceProxyPreview
			.get({
				from: { id: tunnelInstanceProxyPreviewId },
				include: {},
			}).safeUnwrap();

		if (tunnelInstanceProxyPreview === null) {
			return err(new DocumentNotFoundError('TunnelInstanceProxyPreview'));
		}

		const { allowedPortNumbers } = tunnelInstanceProxyPreview;

		return ApiConvex.v.TunnelInstanceProxyPreview.update({
			input: {
				id: tunnelInstanceProxyPreviewId,
				updates: {
					allowedPortNumbers: arrayUnique([
						...allowedPortNumbers,
						input.portNumber,
					]),
				},
			},
		});
	})),
	error: ({ error }) => new ProcedureError("Couldn't add port number", error),
});

export const tunnelInstanceProxyPreview_removeAllowedPortNumber =
	defineProcedure({
		input: WebappApiInput.withActor(
			'User',
			(actor, { input, ctx }) =>
				z.object({
					tunnelInstanceProxyPreview: WebappApiInput.tunnelInstanceProxyPreview(
						{
							identifier: 'id',
							actor,
							actorRelation: 'creator',
						},
					)(input, ctx),
					portNumber: z.number(),
				}),
		),
		mutation: async ({ input }) => ($try(async function*() {
			const tunnelInstanceProxyPreviewId = yield* input
				.tunnelInstanceProxyPreview
				.safeUnwrap();
			const tunnelInstanceProxyPreview = yield* ApiConvex.v
				.TunnelInstanceProxyPreview
				.get({
					from: { id: tunnelInstanceProxyPreviewId },
					include: {},
				}).safeUnwrap();

			if (tunnelInstanceProxyPreview === null) {
				return err(new DocumentNotFoundError('TunnelInstanceProxyPreview'));
			}

			const { allowedPortNumbers } = tunnelInstanceProxyPreview;
			return ApiConvex.v.TunnelInstanceProxyPreview.update({
				input: {
					id: tunnelInstanceProxyPreviewId,
					updates: {
						allowedPortNumbers: allowedPortNumbers.filter(
							(allowedPortNumber) => allowedPortNumber !== input.portNumber,
						),
					},
				},
			});
		})),
		error: ({ error }) =>
			new ProcedureError("Couldn't remove port number", error),
	});

/**
	Prevent a certain port from being proxied. This is different than turning off port prompts (so the browser can continue to prompt about other possible ports to proxy).
*/
export const tunnelInstanceProxyPreview_addDisallowedPortNumber =
	defineProcedure({
		input: WebappApiInput.withActor(
			'User',
			(actor, { input, ctx }) =>
				z.object({
					tunnelInstanceProxyPreview: WebappApiInput.tunnelInstanceProxyPreview(
						{
							identifier: 'id',
							actor,
							actorRelation: 'creator',
						},
					)(input, ctx),
					portNumber: z.number(),
				}),
		),
		mutation: async ({ input }) => ($try(async function*() {
			const tunnelInstanceProxyPreviewId = yield* input
				.tunnelInstanceProxyPreview
				.safeUnwrap();
			const tunnelInstanceProxyPreview = yield* ApiConvex.v
				.TunnelInstanceProxyPreview
				.get({
					from: { id: tunnelInstanceProxyPreviewId },
					include: {},
				}).safeUnwrap();

			if (tunnelInstanceProxyPreview === null) {
				return err(new DocumentNotFoundError('TunnelInstanceProxyPreview'));
			}

			const { disallowedPortNumbers } = tunnelInstanceProxyPreview;

			return ApiConvex.v.TunnelInstanceProxyPreview.update({
				input: {
					id: tunnelInstanceProxyPreviewId,
					updates: {
						disallowedPortNumbers: arrayUnique([
							...disallowedPortNumbers,
							input.portNumber,
						]),
					},
				},
			});
		})),
		error: ({ error }) => new ProcedureError("Couldn't add port number", error),
	});

export const tunnelInstanceProxyPreview_removeDisallowedPortNumber =
	defineProcedure({
		input: WebappApiInput.withActor(
			'User',
			(actor, { input, ctx }) =>
				z.object({
					tunnelInstanceProxyPreview: WebappApiInput.tunnelInstanceProxyPreview(
						{
							identifier: 'id',
							actor,
							actorRelation: 'creator',
						},
					)(input, ctx),
					portNumber: z.number(),
				}),
		),
		mutation: async ({ input }) => ($try(async function*() {
			const tunnelInstanceProxyPreviewId = yield* input
				.tunnelInstanceProxyPreview
				.safeUnwrap();
			const tunnelInstanceProxyPreview = yield* ApiConvex.v
				.TunnelInstanceProxyPreview
				.get({
					from: { id: tunnelInstanceProxyPreviewId },
					include: {},
				}).safeUnwrap();

			if (tunnelInstanceProxyPreview === null) {
				return err(new DocumentNotFoundError('TunnelInstanceProxyPreview'));
			}

			const { disallowedPortNumbers } = tunnelInstanceProxyPreview;

			return ApiConvex.v.TunnelInstanceProxyPreview.update({
				input: {
					id: tunnelInstanceProxyPreviewId,
					updates: {
						disallowedPortNumbers: disallowedPortNumbers.filter(
							(disallowedPortNumber) =>
								disallowedPortNumber !== input.portNumber,
						),
					},
				},
			});
		})),
		error: ({ error }) =>
			new ProcedureError("Couldn't remove port number", error),
	});
