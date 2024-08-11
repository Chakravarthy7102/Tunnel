import { getWorkos } from '@-/auth/workos';
import {
	destroyTestFixtures,
	TEST_USER_PASSWORD,
} from '@-/database-test-fixtures';
import fs from 'node:fs';
import path from 'pathe';
import { type PlaywrightTestArgs, test as base } from 'playwright/test';

async function acquireAccount(id: number, index: number) {
	const testUserEmail = `${id}-${index}+tunnel_test@tunnel.dev`;
	const workos = getWorkos();

	const workosTestUsers = await workos.userManagement.listUsers({
		email: testUserEmail,
	});

	let testWorkosUserId: string;
	if (workosTestUsers.data[0] !== undefined) {
		testWorkosUserId = workosTestUsers.data[0].id;
		await workos.userManagement.updateUser({
			userId: testWorkosUserId,
			password: TEST_USER_PASSWORD,
		});
	} else {
		const workosUser = await workos.userManagement.createUser({
			email: testUserEmail,
			password: TEST_USER_PASSWORD,
			emailVerified: true,
		});
		testWorkosUserId = workosUser.id;
	}

	return { email: testUserEmail, password: TEST_USER_PASSWORD };
}

export const defineTest = <$State extends { fixtures: any }>(
	options: {
		getState(ctx: PlaywrightTestArgs & { id: number }): Promise<$State>;
		after?(state: $State): Promise<void>;
		authenticated?: boolean;
	},
): ReturnType<
	typeof base.extend<
		{ state: $State },
		{ workerStorageState: [string, string, string] }
	>
> => {
	const test = base.extend<{
		state: $State;
	}, {
		workerStorageState: [string, string, string];
	}>({
		state: [async ({ context, page, request }: PlaywrightTestArgs, use) => {
			const state = await options.getState({
				context,
				page,
				request,
				id: test.info().parallelIndex,
			});
			await use(state);
			await destroyTestFixtures(state.fixtures);
			await options.after?.(state);
		}, { scope: 'test' }],
		// Use the same storage state for all tests in this worker.
		async storageState({ workerStorageState }, use) {
			if (options.authenticated === false) {
				await use(undefined);
			} else {
				await use(workerStorageState[0]);
			}
		},
		// Authenticate once per worker with a worker-scoped fixture.
		workerStorageState: [async ({ browser }, use) => {
			// Use parallelIndex as a unique identifier for each worker.
			const id = test.info().parallelIndex;

			const fileNames = (await Promise.all(
				Array.from({ length: 3 }).map(
					async (_, index) => {
						const fileName = path.resolve(
							test.info().project.outputDir,
							`.auth/${id}-${index}.json`,
						);

						// Reuse existing authentication state if any.
						if (fs.existsSync(fileName)) {
							return fileName;
						}

						// Important: make sure we authenticate in a clean environment by unsetting storage state.
						const page = await browser.newPage({ storageState: undefined });

						const _account = await acquireAccount(id, index);
						await page.goto('https://tunnel.test/login');

						throw new Error('todo: implement login');

						await page.close();

						return fileName;
					},
				),
			)) as [string, string, string];

			await use(fileNames);
		}, { scope: 'worker' }],
	});

	return test;
};
