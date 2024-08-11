import { env } from '@-/env';
import {
	createOrUpdateTextFile,
	type Options,
	type Response,
} from '@octokit/plugin-create-or-update-text-file';
import { Octokit as BaseOctokit } from '@octokit/rest';
// @ts-expect-error: Missing types
import octokitCommitMultipleFiles from 'octokit-commit-multiple-files';
import onetime from 'onetime';

export const getOctokit = onetime(() => {
	const Octokit = BaseOctokit.plugin(createOrUpdateTextFile).plugin(
		octokitCommitMultipleFiles as () => {
			createOrUpdateFiles(
				options: Pick<Options, 'owner' | 'repo' | 'branch'> & {
					createBranch?: boolean;
					changes: Array<{
						message: string;
						files?: Record<string, string>;
						filesToDelete?: string[];
					}>;
				},
			): Promise<Response>;
		},
	);

	return new Octokit({
		auth: env('GH_PERSONAL_ACCESS_TOKEN'),
	});
});
