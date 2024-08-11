import { v, type Validator } from '@-/convex/values';

export function vInclude(): Validator<
	{ __selection__?: true } & Record<string, unknown>,
	false,
	string
> {
	return v.any();
}
