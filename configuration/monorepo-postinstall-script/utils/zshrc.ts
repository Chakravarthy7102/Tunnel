import { execa } from 'execa';
import fs from 'node:fs';
import os from 'node:os';
import { outdent } from 'outdent';
import path from 'pathe';

export async function updateZshrcFile() {
	// Ensure that `eval "$(direnv hook zsh)"` is present in ~/.zshrc
	const zshrcFileContents = await fs.promises.readFile(
		path.join(os.homedir(), '.zshrc'),
	);
	if (!zshrcFileContents.includes('eval "$(direnv hook zsh)"')) {
		process.stdout.write('Installing direnv...\n');
		await execa('pkgx', ['install', 'direnv.net'], { stdio: 'inherit' });
		await fs.promises.appendFile(
			path.join(os.homedir(), '.zshrc'),
			outdent({ trimLeadingNewline: false })`
			eval "$(direnv hook zsh)"
		`,
		);
	}
}
