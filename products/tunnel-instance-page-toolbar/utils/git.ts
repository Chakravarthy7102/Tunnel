import type { PageToolbarContext } from '#types';

export function getEnvironmentGitMetadataPayload({
	context,
}: {
	context: PageToolbarContext;
}) {
	return 'localProjectEnvironment' in context.hostEnvironment ?
		{ data: context.hostEnvironment.localProjectEnvironment.gitMetadata } :
		'gitMetadata' in context.hostEnvironment ?
		context.hostEnvironment.gitMetadata :
		{ data: null };
}
