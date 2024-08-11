import { ApiAsana } from '#api';
import { ApiAnalytics } from '@-/analytics/api';
import { ApiConvex } from '@-/convex/api';
import { RELEASE } from '@-/env/app';
import { DocumentNotFoundError, ProcedureError } from '@-/errors';
import type {
	AsanaAssignee,
	AsanaParentTask,
	AsanaProject,
	AsanaTag,
	AsanaTask,
} from '@-/integrations';
import {
	asanaAssigneeSchema,
	// asanaParentTaskSchema,
	asanaProjectSchema,
	asanaSectionSchema,
	asanaTagSchema,
} from '@-/integrations/schemas';
import { OrganizationMemberRoleInput } from '@-/organization-member';
import { ApiUrl } from '@-/url/api';
import { WebappApiInput } from '@-/webapp/api-input';
import { z } from '@-/zod';
import { $try, err, type TryOk } from 'errok';
// eslint-disable-next-line @tunnel/no-relative-import-paths/no-relative-import-paths -- This breaks Next.js builds for some reason
import { defineProcedure } from '../../../products/webapp/exports/procedure-utils.ts';

export const asana_createTask = defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.object({
			organizationMember: WebappApiInput.organizationMember({
				actor,
				actorRelation: 'actor',
				actorOrganizationMemberRole: OrganizationMemberRoleInput.guestOrHigher,
			})(input, ctx),
			project: asanaProjectSchema,
			name: z.string().nullable().optional(),
			assignee: asanaAssigneeSchema.nullable(),
			section: asanaSectionSchema.nullable(),
			tags: z.array(asanaTagSchema),
			parentTask: z.null(),
		})),
	mutation: async ({ input }) => ($try(async function*(
		$ok: TryOk<AsanaTask | null>,
	) {
		const webappUrl = ApiUrl.getWebappUrl({
			fromRelease: RELEASE,
			withScheme: true,
		});

		const organizationMemberId = yield* input.organizationMember.safeUnwrap();
		const {
			project,
			name,
			section,
			tags: inputTags,
			assignee: inputAssignee,
		} = input;

		const organizationMember = yield* ApiConvex.v.OrganizationMember.get({
			from: { id: organizationMemberId },
			include: {
				organization: {
					include: {
						asanaOrganization: true,
					},
				},
				user: true,
			},
		}).safeUnwrap();

		if (organizationMember === null) {
			return err(new DocumentNotFoundError('OrganizationMember'));
		}

		if (!organizationMember.organization.asanaOrganization) {
			return $ok(null);
		}

		const asanaClient = yield* ApiAsana.getClient({
			organizationMemberId,
		}).safeUnwrap();

		const { gid: workspaceGid } =
			organizationMember.organization.asanaOrganization;

		if (!workspaceGid || !name) {
			return $ok(null);
		}

		const data = await asanaClient.tasks.create({
			projects: [project.gid],
			workspace: workspaceGid,
			name,
			assignee: inputAssignee?.gid,
			tags: inputTags.map((tag) => tag.gid),
			// parent: inputParentTask?.gid,
			...(section &&
				{ memberships: [{ project: project.gid, section: section.gid }] }),
		});

		const {
			gid,
			permalink_url: url,
			tags,
			assignee,
		} = data;

		await asanaClient.webhooks.create(
			gid,
			// TODO: hardcoded in development for now since asana validates the webhook url
			RELEASE === null ?
				'https://3bfb-2607-fea8-4adb-11e0-c4cd-fa82-9994-a97c.ngrok-free.app/api/webhooks/asana' :
				`${webappUrl}/api/webhooks/asana`,
			{
				filters: [{
					resource_type: 'task',
					action: 'changed',
					fields: ['completed'],
				}, {
					resource_type: 'task',
					action: 'deleted',
				}, {
					resource_type: 'task',
					action: 'removed',
				}],
			},
		);

		const serverAnalytics = ApiAnalytics.getServerAnalytics();
		void serverAnalytics.user.createdAsanaTask({
			userId: organizationMember.user._id,
			organizationId: organizationMember.organization._id,
		});

		return $ok({
			gid,
			project,
			section,
			url,
			tags: tags.map((tag) => tag.name),
			assignee: assignee ?
				{
					gid: assignee.gid,
					name: assignee.name,
					photo: assignee.photo?.image_128x128 ?? null,
				} :
				null,
			parentTask: null,
		});
	})),
	error: ({ error }) =>
		new ProcedureError(
			"Couldn't create Asana task",
			error,
		),
});

export const asana_getProjects = defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.object({
			organizationMember: WebappApiInput.organizationMember({
				actor,
				actorRelation: 'actor',
				actorOrganizationMemberRole: OrganizationMemberRoleInput.guestOrHigher,
			})(input, ctx),
		})),
	query: async ({ input }) => ($try(async function*(
		$ok: TryOk<AsanaProject[] | null>,
	) {
		const organizationMemberId = yield* input.organizationMember.safeUnwrap();

		const organizationMember = yield* ApiConvex.v.OrganizationMember.get({
			from: { id: organizationMemberId },
			include: {
				organization: {
					include: {
						asanaOrganization: true,
					},
				},
				user: true,
			},
		}).safeUnwrap();

		if (organizationMember === null) {
			return err(new DocumentNotFoundError('OrganizationMember'));
		}

		if (!organizationMember.organization.asanaOrganization) {
			return $ok(null);
		}

		const asanaClient = yield* ApiAsana.getClient({
			organizationMemberId,
		}).safeUnwrap();

		const { gid } = organizationMember.organization.asanaOrganization;

		try {
			const data = await asanaClient.projects.findByWorkspace(gid as string);

			return $ok(data.data);
		} catch {
			return $ok([]);
		}
	})),
	error: ({ error }) =>
		new ProcedureError(
			"Couldn't get projects from Asana",
			error,
		),
});

export const asana_getSections = defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.object({
			organizationMember: WebappApiInput.organizationMember({
				actor,
				actorRelation: 'actor',
				actorOrganizationMemberRole: OrganizationMemberRoleInput.guestOrHigher,
			})(input, ctx),
			project: asanaProjectSchema,
		})),
	query: async ({ input }) => ($try(async function*(
		$ok: TryOk<AsanaProject[] | null>,
	) {
		const organizationMemberId = yield* input.organizationMember.safeUnwrap();
		const asanaClient = yield* ApiAsana.getClient({
			organizationMemberId,
		}).safeUnwrap();

		try {
			const data = await asanaClient.sections.findByProject(input.project.gid);

			if (data.length === 0) {
				return $ok([]);
			}

			return $ok(data);
		} catch {
			return $ok([]);
		}
	})),
	error: ({ error }) =>
		new ProcedureError(
			"Couldn't get Asana sections",
			error,
		),
});

export const asana_getAssignees = defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.object({
			organizationMember: WebappApiInput.organizationMember({
				actor,
				actorRelation: 'actor',
				actorOrganizationMemberRole: OrganizationMemberRoleInput.guestOrHigher,
			})(input, ctx),
		})),
	query: async ({ input }) => ($try(async function*(
		$ok: TryOk<AsanaAssignee[] | null>,
	) {
		const organizationMemberId = yield* input.organizationMember.safeUnwrap();

		const organizationMember = yield* ApiConvex.v.OrganizationMember.get({
			from: { id: organizationMemberId },
			include: {
				organization: {
					include: {
						asanaOrganization: true,
					},
				},
				user: true,
			},
		}).safeUnwrap();

		if (organizationMember === null) {
			return err(new DocumentNotFoundError('OrganizationMember'));
		}

		if (!organizationMember.organization.asanaOrganization) {
			return $ok(null);
		}

		const asanaClient = yield* ApiAsana.getClient({
			organizationMemberId,
		}).safeUnwrap();

		const { gid: workspaceGid } =
			organizationMember.organization.asanaOrganization;

		try {
			const data = await asanaClient.users.findByWorkspace(
				workspaceGid as string,
				{
					opt_fields: 'name,photo',
				},
			);

			if (data.data.length === 0) {
				return $ok([]);
			}

			return $ok(data.data.map((assignee) => ({
				gid: assignee.gid,
				name: assignee.name,
				photo: assignee.photo.image_128x128 ?? null,
			})));
		} catch {
			return $ok([]);
		}
	})),
	error: ({ error }) =>
		new ProcedureError(
			"Couldn't get assignees from Asana",
			error,
		),
});

export const asana_getTags = defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.object({
			organizationMember: WebappApiInput.organizationMember({
				actor,
				actorRelation: 'actor',
				actorOrganizationMemberRole: OrganizationMemberRoleInput.guestOrHigher,
			})(input, ctx),
		})),
	query: async ({ input }) => ($try(async function*(
		$ok: TryOk<AsanaTag[] | null>,
	) {
		const organizationMemberId = yield* input.organizationMember.safeUnwrap();

		const organizationMember = yield* ApiConvex.v.OrganizationMember.get({
			from: { id: organizationMemberId },
			include: {
				organization: {
					include: {
						asanaOrganization: true,
					},
				},
				user: true,
			},
		}).safeUnwrap();

		if (organizationMember === null) {
			return err(new DocumentNotFoundError('OrganizationMember'));
		}

		if (!organizationMember.organization.asanaOrganization) {
			return $ok(null);
		}

		const asanaClient = yield* ApiAsana.getClient({
			organizationMemberId,
		}).safeUnwrap();

		const { gid: workspaceGid } =
			organizationMember.organization.asanaOrganization;

		try {
			const data = await asanaClient.tags.findByWorkspace(
				workspaceGid as string,
				{
					opt_fields: 'gid,name',
				},
			);

			if (data.data.length === 0) {
				return $ok([]);
			}

			return $ok(data.data);
		} catch {
			return $ok([]);
		}
	})),
	error: ({ error }) =>
		new ProcedureError(
			"Couldn't get tags from Asana",
			error,
		),
});

export const asana_getParentTasks = defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.object({
			organizationMember: WebappApiInput.organizationMember({
				actor,
				actorRelation: 'actor',
				actorOrganizationMemberRole: OrganizationMemberRoleInput.guestOrHigher,
			})(input, ctx),
			project: asanaProjectSchema,
		})),
	query: async ({ input }) => ($try(async function*(
		$ok: TryOk<AsanaParentTask[] | null>,
	) {
		const organizationMemberId = yield* input.organizationMember.safeUnwrap();

		const organizationMember = yield* ApiConvex.v.OrganizationMember.get({
			from: { id: organizationMemberId },
			include: {
				organization: {
					include: {
						asanaOrganization: true,
					},
				},
				user: true,
			},
		}).safeUnwrap();

		if (organizationMember === null) {
			return err(new DocumentNotFoundError('OrganizationMember'));
		}

		if (!organizationMember.organization.asanaOrganization) {
			return $ok(null);
		}

		const asanaClient = yield* ApiAsana.getClient({
			organizationMemberId,
		}).safeUnwrap();

		try {
			const data = await asanaClient.tasks.findByProject(input.project.gid, {
				opt_fields: 'gid,name',
			});

			if (data.data.length === 0) {
				return $ok([]);
			}

			return $ok(data.data);
		} catch {
			return $ok([]);
		}
	})),
	error: ({ error }) =>
		new ProcedureError(
			"Couldn't get tasks from Asana",
			error,
		),
});
