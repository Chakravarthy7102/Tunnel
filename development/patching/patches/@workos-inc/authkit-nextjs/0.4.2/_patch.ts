import { createPatchFileReplacer, definePatch } from '#utils/patch.ts';
import { outdent } from 'outdent';

export default definePatch({
	async patch({ temporaryPatchDirectory }) {
		const replace = createPatchFileReplacer({ temporaryPatchDirectory });
		await replace({
			files: 'dist/cjs/env-variables.js',
			from: [
				outdent`
					const WORKOS_REDIRECT_URI = getEnvVariable('WORKOS_REDIRECT_URI');
				`,
				outdent`
					const WORKOS_CLIENT_ID = getEnvVariable('WORKOS_CLIENT_ID');
				`,
			],
			to: [
				outdent`
					const WORKOS_REDIRECT_URI = 'https://example.com/the-redirect-uri-should-not-be-hardcoded';
				`,
				outdent`
					const WORKOS_CLIENT_ID = getEnvVariable('NEXT_PUBLIC_WORKOS_CLIENT_ID');
				`,
			],
		});
	},
});
