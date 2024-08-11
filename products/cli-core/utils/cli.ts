import { runAuthCommand } from '#commands/auth.ts';
import { runDocsCommand } from '#commands/docs.ts';
import { runHelpCommand } from '#commands/help.ts';
import { runLoginCommand } from '#commands/login.ts';
import { runLogoutCommand } from '#commands/logout.ts';
import { runShareCommand } from '#commands/share.ts';
import { runVersionCommand } from '#commands/version.ts';
import { runWhoamiCommand } from '#commands/whoami.ts';
import { runWrapperCommand } from '#commands/wrapper.ts';
import arg from 'arg';
import chalk from 'chalk';
import { ok, okAsync, ResultAsync } from 'errok';
import logSymbols from 'log-symbols';
import { outdent } from 'outdent';
import { supportMessage } from './message.ts';

export function runTunnelCli({
	cliVersion,
	argv,
}: {
	cliVersion: string;
	argv: string[];
}) {
	const args = arg(
		{
			'--version': Boolean,
			'-v': '--version',
		},
		{ argv, permissive: true },
	);

	// We assume the user is trying to invoke the wrapper command if `argv` contains a passthrough double-dash or if the second argument to `tunnel` is a number
	if (argv.includes('--') || !Number.isNaN(Number(args._[0]))) {
		return ResultAsync.fromPromise(
			runWrapperCommand({ argv }),
			(error) => error,
		);
	}

	if (args._[0] === 'auth') {
		return runAuthCommand();
	}

	if (args._[0] === 'docs') {
		return ResultAsync.fromSafePromise(runDocsCommand());
	}

	if (args._[0] === 'help') {
		runHelpCommand({ cliVersion });
		return okAsync(0);
	}

	if (args._[0] === 'login') {
		return runLoginCommand({ argv });
	}

	if (args._[0] === 'logout') {
		return runLogoutCommand();
	}

	if (args._[0] === 'share') {
		return runShareCommand({ argv });
	}

	if (args['--version'] !== undefined || args._[0] === 'version') {
		runVersionCommand({ cliVersion });
		return okAsync(0);
	}

	if (args._[0] === 'whoami') {
		return runWhoamiCommand();
	}

	if (
		// dprint-ignore
		args._[0] !== undefined &&
		(
			args._[0].startsWith('.') ||
			args._[0].startsWith('/')
		)
	) {
		process.stdout.write(outdent({ trimTrailingNewline: false })`
			${chalk.magentaBright.bold("Sorry, we didn't recognize your command:")}

			  tunnel ${argv.join(' ')}

			${logSymbols.info} If you're trying to share a project, run ${
			chalk.yellow(
				`tunnel share ${args._[0]}`,
			)
		}
			  Otherwise, run ${chalk.yellow('tunnel help')} to get a list of commands.

			${supportMessage}
		`);
	} else {
		process.stdout.write(outdent({ trimTrailingNewline: false })`
			${chalk.magentaBright.bold("Sorry, we didn't recognize your command:")}

			  tunnel ${argv.join(' ')}

			${logSymbols.info} To get a list of commands, run ${
			chalk.yellow('tunnel help')
		}

			${supportMessage}
		`);
	}

	return ok(1);
}
