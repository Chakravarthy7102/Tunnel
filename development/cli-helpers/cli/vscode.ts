import { logger } from '@-/logger';
import { defineCliExecutable } from 'cli-specs';
import fs from 'node:fs';
import os from 'node:os';
import { outdent } from 'outdent';
import path from 'pathe';

export const vscode = defineCliExecutable({
	executableName: 'code',
	executablePath: '/opt/homebrew/bin/code',
	/**
		Copied from https://code.visualstudio.com/docs/setup/mac#_alternative-manual-instructions
	*/
	async install() {
		if (process.platform !== 'darwin') {
			throw new Error(
				'On Windows and Linux systems, the `code` CLI should automatically be added to the path. Please try re-installing VSCode.',
			);
		}

		const zProfilePath = path.join(os.homedir(), '.zprofile');
		const zProfileContents = await fs.promises.readFile(zProfilePath, 'utf8');
		const exportPathLine =
			'export PATH="$PATH:/Applications/Visual Studio Code.app/Contents/Resources/app/bin"';
		if (!new RegExp(`^${exportPathLine}$`, 'm').test(zProfileContents)) {
			logger.info('Adding VSCode CLI to ~/.zprofile');
			await fs.promises.appendFile(zProfilePath, `\n${exportPathLine}\n`);
		}
	},
	description: outdent`
		The VSCode CLI is needed for VSCode Extension development.
		To install the VSCode CLI, please visit the following link:
		https://www.digitalocean.com/community/tutorials/
		how-to-install-and-use-the-visual-studio-code-vs-code-command-line-interface
	`,
	defaultExecaOptions: {
		stdout: 'inherit',
		stderr: 'inherit',
	},
});
