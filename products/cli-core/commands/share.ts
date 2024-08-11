import { loginWithBrowserIfNotLoggedIn } from '#utils/login.ts';
import { tunnelShare } from '#utils/share.ts';
import { APP_ENV } from '@-/env/app';
import { logger } from '@-/logger';
import arg from 'arg';
import chalk from 'chalk';
import { $try, ok } from 'errok';
import logSymbols from 'log-symbols';

export const runShareCommand = (
	{ argv }: { argv: string[] },
) => ($try(async function*() {
	const args = arg(
		{
			'--port': String,
			'--subdomain': String,
			'--organization': String,

			// Aliases
			'-p': '--port',
			'-s': '--subdomain',
		},
		{ argv, permissive: true },
	);

	if (args['--port'] !== undefined && Number.isNaN(Number(args['--port']))) {
		process.stderr.write(
			`${logSymbols.error} Invalid port number "${
				args['--port']
			}" passed to --port option\n`,
		);
		process.exit(1);
	}

	const projectPathInput = args._[1];

	// If the user didn't provide an explicit project path, we prompt them to confirm to use the current working directory
	if (projectPathInput === undefined) {
		const warnMessageLines = [];
		warnMessageLines.push(
			`${logSymbols.error} ${chalk.dim('`')}${
				chalk.yellow(
					'tunnel share',
				)
			}${chalk.dim('`')} ${chalk.red('needs the path to your project:')}`,
			'',
			`  ${chalk.dim('$')} tunnel share ${chalk.cyan.underline('<path>')}`,
			'',
		);

		process.stdout.write(warnMessageLines.join('\n') + '\n');

		process.stdout.write(
			chalk.magentaBright.bold('Examples:\n') +
				chalk.green(
					`# Runs ${chalk.dim('`')}${chalk.yellow('tunnel share')}${
						chalk.dim(
							'`',
						)
					} in the current working directory\n`,
				) +
				`${chalk.dim('$')} tunnel share .\n\n` +
				chalk.green(
					`# Runs ${chalk.dim('`')}${chalk.yellow('tunnel share')}${
						chalk.dim(
							'`',
						)
					} in a specific directory\n`,
				) +
				`${chalk.dim('$')} tunnel share ~/code/my-app\n`,
		);

		process.exit(1);
	}

	const { userActor, accessToken, actorUser } =
		yield* loginWithBrowserIfNotLoggedIn().safeUnwrap();

	const result = await tunnelShare({
		actorData: {
			userActor,
			actorUser,
			accessToken,
		},
		options: {
			projectPathInput,
			port: args['--port'] === undefined ?
				undefined :
				Number(args['--port']),
			organizationSlug: args['--organization'],
			subdomain: args['--subdomain'],
		},
	});

	if (result.isErr()) {
		logger.error(
			'Error sharing tunnel:',
			APP_ENV === 'development' ?
				result.error :
				result.error.message,
		);
	}

	process.on('SIGINT', () => {
		process.exit(0);
	});

	return ok(null);
}));
