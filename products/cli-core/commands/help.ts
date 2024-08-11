import chalk from 'chalk';
import { outdent } from 'outdent';

export function runHelpCommand({ cliVersion }: { cliVersion: string }) {
	process.stdout.write(outdent({ trimTrailingNewline: false })`
		${chalk.dim('$')} tunnel version
		v${cliVersion}

		${chalk.magentaBright.bold('🔒 Authentication')}

		  ${chalk.green('# View information about your current accounts')}
		  ${chalk.dim('$')} tunnel auth

		  ${chalk.green('Log into a new account')}
		  ${chalk.dim('$')} tunnel login

		  ${chalk.green('Logout of your account')}
		  ${chalk.dim('$')} tunnel logout

		${chalk.magentaBright.bold('📡 Sharing')}

		  ${chalk.green('# Share a local project with others')}
		  ${chalk.dim('$')} tunnel share <path>

		  ${
		chalk.green(
			'# Add Tunnel to your localhost to make it live and collaborative',
		)
	}
		  ${chalk.dim('$')} tunnel <port> -- <command>
	`);
}
