import { v } from '@-/convex/values';

export const organizationMemberRoleValidator = v.union(
	v.literal('guest'),
	v.literal('member'),
	v.literal('admin'),
	v.literal('owner'),
);
