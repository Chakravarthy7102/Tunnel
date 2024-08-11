import type { Context } from '#types';
import { idSchema } from '@-/database/schemas';
import { z } from '@-/zod';

export function WebappApiInput_files() {
	return function(_input: unknown, _ctx: any) {
		return z.array(idSchema('File'));
	};
}

export function WebappApiInput_file() {
	return function(_input: unknown, _ctx: Context) {
		return idSchema('File');
	};
}
