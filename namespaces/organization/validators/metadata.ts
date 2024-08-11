import { v } from '@-/convex/values';
import { vNullable } from 'corvex';

export const organizationMetadataValidator = v.object({
	size: vNullable(v.string()),
	ownerRole: vNullable(v.string()),
});
