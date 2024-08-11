import {
	ORGANIZATION_METADATA_ROLE_OPTIONS as roleOptions,
	ORGANIZATION_METADATA_SIZE_OPTIONS as sizeOptions,
} from '@-/organization/constants';
import { z } from '@-/zod';

export const organizationMetadataSizeOptionsSchema = z.union([
	z.literal(sizeOptions[0]),
	z.literal(sizeOptions[1]),
	...sizeOptions.slice(2).map((size) => z.literal(size)),
	z.null(),
]);

export const organizationMetadataRoleOptionsSchema = z.union([
	z.literal(roleOptions[0]),
	z.literal(roleOptions[1]),
	...roleOptions.slice(2).map((role) => z.literal(role)),
	z.null(),
]);

export const organizationMetadataSchema = z.object({
	size: organizationMetadataSizeOptionsSchema,
	ownerRole: organizationMetadataRoleOptionsSchema,
});
