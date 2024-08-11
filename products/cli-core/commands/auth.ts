import { getCurrentActorData } from '#utils/actor.ts';
import { loginWithBrowser } from '#utils/login.ts';
import {
	getUserDataFromSavedActorData,
	getUsersDataFromSavedActorsData,
} from '#utils/user.ts';
import type { ActorString } from '@-/actor';
import { getCliStorage, type SavedActorData } from '@-/cli-storage';
import type {
	Selection,
	ServerDoc,
} from '@-/database';
import { type User_$profileData } from '@-/database/selections';
import { logger } from '@-/logger';
import { isCancel, SelectPrompt } from '@clack/core';
import chalk from 'chalk';
import { $try, err, ok } from 'errok';
import { excludeKeys } from 'filter-obj';
import logSymbols from 'log-symbols';
import { outdent } from 'outdent';

/**
	Gives the user an overview of their authentication state (e.g. accounts) within
	the Tunnel CLI and provides them with an interactive set of actions to perform
*/
export const runAuthCommand = () => ($try(async function*() {
	const cliStorage = getCliStorage();
	const cliStorageData = await cliStorage.get();
	const currentActorData = await getCurrentActorData();

	// If the user isn't logged in
	if (cliStorageData.currentActorString === null) {
		process.stderr.write(
			chalk.magentaBright.bold(
				"🙈 You haven't logged into the Tunnel CLI yet...",
			) + '\n\n',
		);

		const select = new SelectPrompt({
			options: [
				{
					message: `Login (or register) via your browser`,
					value: 'loginViaYourBrowser',
					selectedEmoji: '🌐',
					command: 'tunnel login',
				},
				{
					message: "I'll log in later",
					value: 'logInLater',
					selectedEmoji: '😅',
					command: '[ctrl+c]',
				},
			],
			render() {
				return this.options
					.map((option) => {
						if (option.value === this.value) {
							return chalk.cyan(
								outdent`
									❯ ${chalk.bold(option.message)} ${option.selectedEmoji}
								`,
							);
						} else {
							return `${chalk.hidden('❯')} ${option.message}`;
						}
					})
					.join('\n');
			},
		});

		const action = await select.prompt();

		if (isCancel(action)) {
			return ok(0);
		}

		process.stdout.write('\n');

		if (action === 'loginViaYourBrowser') {
			yield* loginWithBrowser().safeUnwrap();
			return ok(0);
		} else {
			return ok(0);
		}
	} else {
		/* currentActor !== null */
		const actorsUserData = await getUsersDataFromSavedActorsData({
			savedActorsData: cliStorageData.savedActorsData,
		});

		const userData = yield* getUserDataFromSavedActorData({
			savedActorData: currentActorData as any,
		}).safeUnwrap();

		if (userData === null) {
			return err(new Error('User data not found'));
		}

		const {
			organizationMemberships: actorOrganizationMembers,
			...actorUser
		} = userData;

		outputAccountsInformation({
			actorsUserData,
			actorOrganizationMembers,
			actorUser,
		});

		const select = new SelectPrompt({
			options: [
				{
					message: 'Switch accounts',
					value: 'switchAccounts',
					selectedEmoji: '🌐',
					command: 'tunnel login --switch',
				},
				{
					message: 'Log out of active account',
					value: 'logoutOfActiveAccount',
					selectedEmoji: '🚪',
					command: 'tunnel logout',
				},
				{
					message: 'Log out of all accounts',
					value: 'logoutOfAllAccounts',
					selectedEmoji: '🧽',
					command: 'tunnel logout --all',
				},
				{
					message: 'Exit',
					value: 'exit',
					selectedEmoji: '️👋',
					command: '[ctrl+c]',
				},
			],
			render() {
				return this.options
					.map((option) => {
						if (option.value === this.value) {
							return chalk.cyan(
								`❯ ${chalk.bold(option.message)} ${option.selectedEmoji}`,
							);
						} else {
							return outdent`
								${chalk.hidden('❯')} ${option.message}
							`;
						}
					})
					.join('\n');
			},
		});

		const action = await select.prompt();

		if (isCancel(action)) {
			return ok(0);
		}

		if (action === 'switchAccounts') {
			yield* switchAccounts({
				savedActorsData: cliStorageData.savedActorsData,
				currentActorString: cliStorageData.currentActorString,
			}).safeUnwrap();
		} else if (action === 'logoutOfActiveAccount') {
			await cliStorage.set((data) => ({
				...data,
				currentActorString: null,
				savedActorsData: excludeKeys(
					cliStorageData.savedActorsData,
					[cliStorageData.currentActorString as string],
				) as any,
			}));

			process.stdout.write(
				`${logSymbols.success} You've logged out of your ${
					chalk.bold(
						actorUser.email,
					)
				} account.`,
			);
			return ok();
		} else if (action === 'logoutOfAllAccounts') {
			await cliStorage.set((data) => ({
				...data,
				currentActorString: null,
				savedActorsData: {},
			}));
			process.stdout.write(
				`${logSymbols.success} You've been logged out of all accounts\n`,
			);
			return ok(0);
		} else {
			return ok(0);
		}
	}

	return ok(0);
}));

function outputAccountsInformation({
	actorUser,
	actorsUserData,
	actorOrganizationMembers,
}: {
	actorUser: ServerDoc<typeof User_$profileData>;
	actorOrganizationMembers: ServerDoc<
		Selection<'OrganizationMember', { organization: true }>
	>[];
	actorsUserData: Record<string, ServerDoc<typeof User_$profileData>>;
}) {
	process.stdout.write(outdent({
		trimLeadingNewline: false,
		trimTrailingNewline: false,
	})`
		${outdent}
		💾 ${chalk.cyan('Logged in as:')} ${
		chalk.cyan.bold(
			actorUser.fullName,
		)
	} ${chalk.cyan.dim('/')} ${chalk.cyan.bold(`@${actorUser.username}`)}

		📁 ${chalk.magentaBright.bold('All Accounts')}

		${
		Object.values(actorsUserData)
			.sort((a, b) => a._id === actorUser._id ? -1 : a._id.localeCompare(b._id))
			.map(
				(actor, actorIndex) =>
					outdent`
						${
						actorUser._id === actor._id ?
							`💫 ${chalk.bold.cyan(`@${actor.username}`)} ${
								chalk.cyan(
									`(${actor.email})`,
								)
							}` :
							`${chalk.hidden('💫')} ${
								chalk.cyan(
									`@${actor.username}`,
								)
							} ${chalk.dim(`(${actor.email})`)}`
					}
						${
						actorOrganizationMembers
							.map((organizationMember, organizationMemberIndex) => {
								const isLastItem = organizationMemberIndex ===
									actorOrganizationMembers.length - 1;
								const isLastAccount =
									actorIndex === Object.keys(actorsUserData).length - 1;

								return outdent`
									${chalk.hidden('💫')} ${
									isLastItem ? '└──' : '├──'
								} ${organizationMember.organization.name} ${
									chalk.dim(organizationMember.organization.slug)
								} ${isLastItem && isLastAccount ? '\n' : ''}
								`;
							})
							.join('\n')
					}
					`,
			)
			.join('\n\n')
	}
	`);
}

const switchAccounts = ({ savedActorsData }: {
	currentActorString: string;
	savedActorsData: Record<string, SavedActorData>;
}) => ($try(async function*() {
	const cliStorage = getCliStorage();

	const actorUsersData = await getUsersDataFromSavedActorsData({
		savedActorsData,
	});

	const actorSelectOptions = Object.entries(actorUsersData).map(
		([actorString, actorUser]) => ({
			value: actorString as ActorString<'User'>,
			message: `${actorUser.username} (${actorUser.email})`,
		}),
	);

	process.stdout.write(chalk.magentaBright.bold('📒 Select an account'));

	const select = new SelectPrompt({
		options: [
			...actorSelectOptions,
			{
				message: 'Log in to a new account',
				value: 'SIGN_IN_NEW_ACCOUNT',
			},
		],
		render() {
			return this.options
				.map((option) => {
					if (option.value === this.value) {
						return chalk.cyan(`❯ ${chalk.bold(option.message)}`);
					} else {
						return `${chalk.hidden('❯')} ${option.message}`;
					}
				})
				.join('\n');
		},
	});

	const selected = await select.prompt();
	if (isCancel(selected)) {
		process.exit(1);
	}

	if (selected === 'SIGN_IN_NEW_ACCOUNT') {
		yield* loginWithBrowser().safeUnwrap();
		return ok();
	} else {
		await cliStorage.set((data) => ({
			...data,
			currentActorString: selected as ActorString<'User'>,
		}));
	}

	logger.info('Successfully switched accounts');
	return ok();
}));
