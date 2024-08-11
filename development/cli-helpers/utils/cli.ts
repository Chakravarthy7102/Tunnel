import * as cliExecutables from '#cli/_.ts';
import { execa, execaCommand, execaCommandSync, execaSync } from 'execa';

export const cli = {
	// Re-exporting execa functions
	execa,
	execaSync,
	execaCommand,
	execaCommandSync,

	// Custom wrappers around CLI executables
	...cliExecutables,
};
