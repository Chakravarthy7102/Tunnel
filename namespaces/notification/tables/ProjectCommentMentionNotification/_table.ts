import { v } from '@-/convex/values';
import { table } from 'corvex';

export const ProjectCommentMentionNotification = table(
	'ProjectCommentMentionNotification',
	v.any(),
	(t) =>
		t
			.index('by_cid', ['cid'])
			.index('by_user', ['user'])
			.index('by_projectComment', ['projectComment']),
)({});
