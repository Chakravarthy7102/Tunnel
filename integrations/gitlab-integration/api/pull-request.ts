import type { Id } from '@-/database';
import { $try, err, ok } from 'errok';
import { ApiGitlab } from './_.ts';

export const ApiGitlab_createNote = (
	{ organizationMemberId, gitlabProjectId, mergeRequestIid, message }: {
		organizationMemberId: Id<'OrganizationMember'>;
		gitlabProjectId: number;
		mergeRequestIid: number;
		message: string;
	},
) => ($try(async function*() {
	const { accessToken } = yield* ApiGitlab.getAccessToken({
		organizationMemberId,
	}).safeUnwrap();

	const response = await fetch(
		`https://gitlab.com/api/v4/projects/${gitlabProjectId}/merge_requests/${mergeRequestIid}/notes?access_token=${accessToken}`,
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ body: message }),
		},
	);

	if (!response.ok) {
		return err(new Error('Could not create note on merge request'));
	}

	const result = await response.json();

	return ok(result);
}));

export const ApiGitlab_updateNote = (
	{
		organizationMemberId,
		gitlabProjectId,
		mergeRequestIid,
		message,
		noteId,
	}: {
		organizationMemberId: Id<'OrganizationMember'>;
		gitlabProjectId: number;
		mergeRequestIid: number;
		noteId: number;
		message: string;
	},
) => ($try(async function*() {
	const { accessToken } = yield* ApiGitlab.getAccessToken({
		organizationMemberId,
	}).safeUnwrap();

	const response = await fetch(
		`https://gitlab.com/api/v4/projects/${gitlabProjectId}/merge_requests/${mergeRequestIid}/notes/${noteId}?access_token=${accessToken}`,
		{
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ body: message }),
		},
	);

	if (!response.ok) {
		return err(new Error('Could not update note on merge request'));
	}

	const result = await response.json();
	return ok(result);
}));
