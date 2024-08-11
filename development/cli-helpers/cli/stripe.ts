import { getExecutablePath } from '#utils/path.ts';
import { createPkgxInstall } from '#utils/pkgx.ts';
import { defineCliExecutable } from 'cli-specs';
import { outdent } from 'outdent';

export const stripe = defineCliExecutable({
	executableName: 'stripe',
	executablePath: async () =>
		getExecutablePath({
			dependencyName: 'stripe.com',
			binRelativeFilepath: 'bin/stripe',
		}),
	description: outdent`
		The Stripe CLI is needed for local webhooks.
	`,
	install: createPkgxInstall('stripe.com'),
	defaultExecaOptions: {
		stdout: 'inherit',
		stderr: 'inherit',
	},
});
