import { v } from '@-/convex/values';
import { vNullable } from 'corvex';

export const windowMetadataPropertyValidators = {
	url: v.string(),
	timestamp: v.string(),
	os: v.object({
		name: vNullable(v.string()),
		version: vNullable(v.string()),
	}),
	browser: v.object({
		name: vNullable(v.string()),
		version: vNullable(v.string()),
	}),
	windowSize: v.object({
		width: v.number(),
		height: v.number(),
	}),
};
