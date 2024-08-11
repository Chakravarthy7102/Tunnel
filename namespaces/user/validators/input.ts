import { v } from '@-/convex/values';

export const userInputValidator = v.object({
	id: v.union(v.id('User'), v.string()),
});
