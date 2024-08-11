import type { NarrowPageToolbarContextArgs } from '#types';
import {
	defineProperties,
	type IfExtends,
	type NullProperties,
} from '@tunnel/context';

interface ClickToCodeProperties {
	isClickToCodeCursorVisible: boolean;
}

// dprint-ignore
type ContextExperimentalProperties<
	$Args extends NarrowPageToolbarContextArgs = NarrowPageToolbarContextArgs
> =
	IfExtends<
		true,
		$Args['enabledExperimentalFeatures']['clickToCode'],
		ClickToCodeProperties
	> |
	IfExtends<
		false,
		$Args['enabledExperimentalFeatures']['clickToCode'],
		NullProperties<ClickToCodeProperties>
	>;

export function createExperimentalProperties<
	$Args extends NarrowPageToolbarContextArgs,
>(): ContextExperimentalProperties<$Args> {
	return defineProperties<ContextExperimentalProperties>({
		isClickToCodeCursorVisible: null,
	});
}
