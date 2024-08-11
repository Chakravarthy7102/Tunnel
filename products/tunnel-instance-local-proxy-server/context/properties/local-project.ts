import type {
	CreateLocalProxyContextArgs,
	NarrowLocalProxyContextArgs,
} from '#types';
import type {
	LocalProjectEnvironment,
	LocalProjectRuntime,
} from '@-/local-project';
import { defineProperties } from '@tunnel/context';

interface LocalProjectEnvironmentProperties {
	localProjectEnvironment: LocalProjectEnvironment;
	localProjectRuntime: LocalProjectRuntime;
}

type ContextLocalProjectEnvironmentProperties<
	_$Args extends NarrowLocalProxyContextArgs = NarrowLocalProxyContextArgs,
> = LocalProjectEnvironmentProperties;

export function createLocalProjectProperties<
	$Args extends NarrowLocalProxyContextArgs,
>({
	localProjectEnvironment,
	localProjectRuntime,
}: CreateLocalProxyContextArgs): ContextLocalProjectEnvironmentProperties<
	$Args
> {
	return defineProperties<LocalProjectEnvironmentProperties>({
		localProjectEnvironment,
		localProjectRuntime,
	});
}
