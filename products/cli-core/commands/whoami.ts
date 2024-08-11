import { loginWithBrowserIfNotLoggedIn } from '#utils/login.ts';
import { getCliStorage } from '@-/cli-storage';
import chalk from 'chalk';
import { $try, ok } from 'errok';
import { outdent } from 'outdent';

export const runWhoamiCommand = () => ($try(async function*() {
	const cliStorage = getCliStorage();
	const cliStorageData = await cliStorage.get();

	if (cliStorageData.currentActorString === null) {
		process.stdout.write("You haven't logged into the Tunnel CLI yet 🙈\n");
		return ok();
	}

	const { actorUser } = yield* loginWithBrowserIfNotLoggedIn().safeUnwrap();

	process.stdout.write(outdent`
		${chalk.bold('🚀 Username')}        ${actorUser.username}
		${chalk.bold('📧 Email')}           ${actorUser.email}\n
	`);

	return ok();
}));
