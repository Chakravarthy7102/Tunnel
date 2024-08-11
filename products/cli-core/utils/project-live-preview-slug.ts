import chalk from 'chalk';
import enquirer from 'enquirer';
import { $try, type TryOk } from 'errok';
import { getWebappTrpc } from './trpc.ts';

export const promptForUniqueTunnelappProjectLivePreviewUrl = ({
	initialUrl,
}: {
	initialUrl: string;
}) => ($try(async function*(
	$ok: TryOk<string>,
) {
	const { webappTrpc } = await getWebappTrpc();

	let takenUrl = initialUrl;

	for (;;) {
		// eslint-disable-next-line no-await-in-loop -- for now
		const { shouldReplace } = await enquirer.prompt<{
			shouldReplace: boolean;
		}>({
			type: 'confirm',
			name: 'shouldReplace',
			message: `A tunnel with the domain ${
				chalk.green(
					takenUrl,
				)
			} already exists. Do you want to try again with a new one?`,
		});

		if (shouldReplace) {
			// eslint-disable-next-line no-await-in-loop -- for now
			const { newSubdomain } = await enquirer.prompt<{
				newSubdomain: string;
			}>({
				type: 'input',
				name: 'newSubdomain',
				message: 'What subdomain would you like to use instead?',
			});

			const url = newSubdomain + '.tunnelapp.dev';

			const existingProjectLivePreview =
				// eslint-disable-next-line no-await-in-loop -- for now
				yield* (await webappTrpc.projectLivePreview.getPublicData.query({
					projectLivePreview: {
						url,
					},
				})).safeUnwrap();

			if (existingProjectLivePreview === null) {
				return $ok(url);
			} else {
				takenUrl = url;
			}
		} else {
			process.exit(1);
		}
	}
}));
