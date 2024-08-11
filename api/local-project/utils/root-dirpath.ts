import chalk from 'chalk';
import { findUp } from 'find-up';
import os from 'node:os';
import path from 'pathe';

export async function getLocalProjectRootDirpath({
	workingDirpath,
}: {
	workingDirpath: string;
}): Promise<{
	localProjectRootDirpath: string;
	reasonMessage: string;
}> {
	// Check if there is a parent directory with an existing `tunnel.yaml` file
	const parentTunnelYamlFilepath = await findUp('tunnel.yaml', {
		cwd: workingDirpath,
	});

	if (parentTunnelYamlFilepath !== undefined) {
		const localProjectRootDirpath = path.dirname(parentTunnelYamlFilepath);
		return {
			localProjectRootDirpath,
			reasonMessage: chalk.magenta(
				`Using the project at ${
					chalk.green(localProjectRootDirpath.replace(os.homedir(), '~'))
				} as it contains a ${chalk.yellow('tunnel.yaml')} file\n`,
			),
		};
	}

	// Check if there's a parent directory with a `.git/` folder
	const gitDirpath = await findUp('.git', {
		cwd: workingDirpath,
		type: 'directory',
	});

	// If a `.git/` folder was found, assume that it is the root of the project
	if (gitDirpath !== undefined) {
		const localProjectRootDirpath = path.dirname(gitDirpath);
		return {
			localProjectRootDirpath: path.dirname(gitDirpath),
			reasonMessage: chalk.magenta(
				`Using the project at ${
					chalk.green(localProjectRootDirpath.replace(os.homedir(), '~'))
				} as it contains a ${chalk.yellow('.git')} folder\n`,
			),
		};
	}

	// Otherwise, assume that the current working directory is the project root
	// TODO: maybe prompt the user to confirm that this is the project root?
	return {
		localProjectRootDirpath: workingDirpath,
		reasonMessage: chalk.magenta(
			`Using the project in the working directory: ${
				chalk.green(workingDirpath.replace(os.homedir(), '~'))
			}\n`,
		),
	};
}
