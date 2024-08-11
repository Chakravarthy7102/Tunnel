import { ApiConvex } from '@-/convex/api';
import type { Id } from '@-/database';
import { DocumentNotFoundError } from '@-/errors';
import { $try, err, ok } from 'errok';

export const ApiProjectLivePreview_isUserAuthorizedToViewProjectLivePreview = (
	{
		projectLivePreviewId,
		userId,
	}: {
		userId: Id<'User'>;
		projectLivePreviewId: Id<'ProjectLivePreview'>;
	},
) => ($try(async function*() {
	const projectLivePreview = yield* ApiConvex.v.ProjectLivePreview.get({
		from: { id: projectLivePreviewId },
		include: {
			project: true,
			organization: true,
			createdByUser: true,
		},
	}).safeUnwrap();

	if (projectLivePreview === null) {
		return err(new DocumentNotFoundError('ProjectLivePreview'));
	}

	const organizationMembers = yield* ApiConvex.v.OrganizationMember.list({
		where: {
			organization: projectLivePreview.organization._id,
			includeProjectGuests: true,
		},
		include: {
			user: true,
		},
		paginationOpts: {
			cursor: null,
			numItems: 100,
		},
	}).safeUnwrap();

	switch (projectLivePreview.viewPermission) {
		case 'anyoneWithLink': {
			return ok(true);
		}

		case 'project': {
			const isMemberOfProject = organizationMembers.page.some(
				(member) => member.user._id === userId,
			);
			return ok(isMemberOfProject);
		}

		// If private, the user must be the one that created it
		case 'private': {
			return ok(
				projectLivePreview.createdByUser?._id === userId,
			);
		}

		default: {
			return err(new Error('Unknown tunnel instance view permission'));
		}
	}
}));
