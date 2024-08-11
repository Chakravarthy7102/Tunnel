import { execa, type Options as ExecaOptions } from 'execa';

let hasSudoBeenCalled = false;

/**
	Only uses `stdio: 'inherit'` on the first sudo call
*/
export async function sudo(commands: string[], options?: ExecaOptions) {
	if (hasSudoBeenCalled) {
		return execa('sudo', commands, options);
	} else {
		hasSudoBeenCalled = true;
		return execa('sudo', commands, {
			stdio: 'inherit',
			...options,
		});
	}
}
