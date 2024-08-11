import { getWorkos } from '@-/auth/workos';
import { ApiConvex } from '@-/convex/api';
import type { Id } from '@-/database';
import { ApiUser } from '@-/user/api';
import { $try, type TryOk } from 'errok';

/**
	Creates a Tunnel user used for testing

	@param args.email - The email we use to uniquely identify each test user.
*/
export const getTestUser = () => ($try(async function*(
	$ok: TryOk<{
		userId: Id<'User'>;
		workosUserId: string;
		accessToken: string;
	}>,
) {
	const testUserEmail = 'testuser+tunnel_test@tunnel.dev';
	const workos = getWorkos();

	const workosTestUsers = await workos.userManagement.listUsers({
		email: testUserEmail,
	});

	let testWorkosUserId: string;
	if (workosTestUsers.data[0] !== undefined) {
		testWorkosUserId = workosTestUsers.data[0].id;
	} else {
		const workosUser = await workos.userManagement.createUser({
			email: testUserEmail,
			password: 'TunnelTestUserPassword!23',
			emailVerified: true,
		});
		testWorkosUserId = workosUser.id;
	}

	// Check if a test user with this email exists
	const existingTestUser = yield* ApiConvex.v.User.get({
		from: { email: testUserEmail },
		include: {},
	}).safeUnwrap();

	if (existingTestUser === null) {
		const user = yield* ApiUser.create({
			input: {
				data: {
					email: testUserEmail,
					fullName: 'Test User',
					username: 'testuser',
					profileImageUrl:
						'https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg',
				},
				include: {},
			},
		}).safeUnwrap();

		return $ok({
			userId: user._id,
			workosUserId: testWorkosUserId,
			accessToken: 'TODO',
		});
	} else {
		return $ok({
			userId: existingTestUser._id,
			workosUserId: testWorkosUserId,
			accessToken: 'TODO',
		});
	}
}));
