import { v } from '@-/convex/values';

export const organizationInputValidator = v.object({
	id: v.union(v.id('Organization'), v.string()),
});
