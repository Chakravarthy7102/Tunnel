import type {
	CreatePageToolbarContextArgs,
	NarrowPageToolbarContextArgs,
} from '#types';
import type { HostEnvironmentType } from '@-/host-environment';
import {
	defineProperties,
	type IfExtends,
	type NullProperties,
} from '@tunnel/context';
// import type { ChatCompletionRequestMessage } from 'openai';

type ChatCompletionRequestMessage = any;

interface LocalhostHostEnvironmentProperties {
	promptBoxPoint: {
		x: number;
		y: number;
	} | null;
	isPromptDrawerOpen: boolean;
	editPrompt: {
		context: {
			fileName: string;
			fileContents: string;
		}[];
		messages: ChatCompletionRequestMessage[];
	};
	hostEnvironmentType:
		| HostEnvironmentType.wrapperCommand
		| HostEnvironmentType.scriptTag;
}

interface TunnelappHostEnvironmentProperties {
	hostEnvironmentType: HostEnvironmentType.tunnelShare;
}

interface ScriptTagHostEnvironmentProperties {
	hostEnvironmentType: HostEnvironmentType.scriptTag;
}

// dprint-ignore
type ContextHostEnvironmentProperties<
	$Args extends NarrowPageToolbarContextArgs = NarrowPageToolbarContextArgs
> =
	IfExtends<
		HostEnvironmentType.wrapperCommand,
		$Args['hostEnvironmentType'],
		LocalhostHostEnvironmentProperties &
			NullProperties<Omit<TunnelappHostEnvironmentProperties, 'hostEnvironmentType'>>
	> |
	IfExtends<
		HostEnvironmentType.tunnelShare,
		$Args['hostEnvironmentType'],
		TunnelappHostEnvironmentProperties &
			NullProperties<Omit<LocalhostHostEnvironmentProperties, 'hostEnvironmentType'>>
	> |
	IfExtends<
		HostEnvironmentType.scriptTag,
		$Args['hostEnvironmentType'],
		ScriptTagHostEnvironmentProperties &
			NullProperties<Omit<ScriptTagHostEnvironmentProperties, 'hostEnvironmentType'>>
	>;

export function createHostEnvironmentProperties<
	$Args extends NarrowPageToolbarContextArgs,
>({
	tunneledServiceEnvironmentData,
}: CreatePageToolbarContextArgs): ContextHostEnvironmentProperties<$Args> {
	return defineProperties<ContextHostEnvironmentProperties>({
		editPrompt: {
			context: [],
			messages: [],
		},
		hostEnvironmentType: tunneledServiceEnvironmentData.hostEnvironment
			.type as any,
		isPromptDrawerOpen: false,
		promptBoxPoint: null,
	});
}
