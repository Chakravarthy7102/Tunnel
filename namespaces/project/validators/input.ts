import { v } from '@-/convex/values';

export const projectInputValidator = v.union(
	v.object({ id: v.id('Project') }),
	v.object({ id: v.string() }),
);
