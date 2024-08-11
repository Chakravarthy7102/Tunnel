import { ApiConvex } from '@-/convex/api';
import type { Id } from '@-/database';
import { copyDemoProjectToTemporaryDirectory } from '@-/demo-projects';
import { DocumentNotFoundError } from '@-/errors';
import { logger } from '@-/logger';
import { ApiOrganization } from '@-/organization/api';
import { ApiProjectLivePreview } from '@-/project-live-preview/api';
import { ApiTunnelInstanceProxyPreview } from '@-/tunnel-instance-proxy-preview/api';
import { ApiUser } from '@-/user/api';
import { createId } from '@paralleldrive/cuid2';
import { execa } from 'execa';
import fs from 'node:fs';
import path from 'pathe';
import yaml from 'yaml';

/**
	Creates a new Tunnel + user on my computer using staging to be used for the load test
*/
export async function setupTunnelLocally() {
	const temporaryDirpath = await copyDemoProjectToTemporaryDirectory({
		projectKey: 'create-react-app',
	});
	await execa('bun', ['install'], { stdio: 'inherit', cwd: temporaryDirpath });

	const loadTestingUserEmail = 'loadtester+tunnel_test@tunnel.dev';

	let loadTestingUser = await ApiConvex.v.User.get({
		from: { email: loadTestingUserEmail },
		include: {},
	}).unwrapOrThrow();

	if (loadTestingUser === null) {
		loadTestingUser = await ApiUser.create({
			input: {
				data: {
					profileImageUrl: null,
					email: loadTestingUserEmail,
					fullName: 'Load Testing User',
					username: 'loadtester',
				},
				include: {},
			},
		}).unwrapOrThrow();
	}

	const organizationName = createId();
	const organizationSlug = createId();
	const { doc: organization } = await ApiOrganization.create({
		input: {
			organization: {
				name: organizationName,
				slug: organizationSlug,
				subscriptionPlan: 'free',
				profileImageUrl: null,
				metadata: {
					ownerRole: null,
					size: null,
				},
				githubOrganization: null,
				invite: null,
			},
			ownerUser: loadTestingUser._id,
			include: {},
		},
	}).unwrapOrThrow();

	const user = await ApiConvex.v.User.get({
		from: { id: loadTestingUser._id },
		include: { apiKey: true },
	}).unwrapOrThrow();

	if (user === null) {
		throw new DocumentNotFoundError('User');
	}

	const organizationMember = await ApiConvex.v.OrganizationMember.get({
		from: {
			organization: organization._id,
			user: loadTestingUser._id,
		},
		include: {},
	}).unwrapOrThrow();

	if (organizationMember === null) {
		throw new DocumentNotFoundError('OrganizationMember');
	}

	const { page: loadTestingProjects } = await ApiConvex.v.Project.list({
		where: {
			organizationMember: organizationMember._id,
		},
		include: {},
		paginationOpts: {
			cursor: null,
			numItems: 100,
		},
	}).unwrapOrThrow();

	let loadTestingProjectId: Id<'Project'>;
	if (loadTestingProjects[0] !== undefined) {
		loadTestingProjectId = loadTestingProjects[0]._id;
	} else {
		loadTestingProjectId = (await ApiConvex.v.Project.create({
			input: {
				data: {
					slug: createId(),
					name: 'Load Testing',
					isUnnamed: false,
					organization: organization._id,
					githubRepository: null,
				},
				include: {},
			},
		}).unwrapOrThrow())._id;
	}

	const projectTunnels = await ApiConvex.v.TunnelInstanceProxyPreview.list({
		where: {
			inProject: loadTestingProjectId,
		},
		include: {},
	}).unwrapOrThrow();

	let tunnelInstanceProxyPreviewId: Id<'TunnelInstanceProxyPreview'>;
	if (projectTunnels[0] !== undefined) {
		tunnelInstanceProxyPreviewId = projectTunnels[0]._id;
	} else {
		tunnelInstanceProxyPreviewId = (await ApiTunnelInstanceProxyPreview.create({
			input: {
				data: {
					gitUrl: null,
					createdByUser: loadTestingUser._id,
					project: loadTestingProjectId,
					localServicePortNumber: 3000,
					localServiceOriginalPortNumber: 3000,
					// Will be changed
					localTunnelProxyServerPortNumber: 0,
				},
				include: {},
			},
		}).unwrapOrThrow())._id;
		await ApiProjectLivePreview.create({
			input: {
				projectLivePreview: {
					url: 'load-testing.tunnelapp.dev',
					project: loadTestingProjectId,
					linkedTunnelInstanceProxyPreview: tunnelInstanceProxyPreviewId,
					isLive: true,
					createdByUser: loadTestingUser._id,
				},
				include: {},
			},
		}).unwrapOrThrow();
	}

	await execa(
		'bunx',
		['@tunnel/cli-staging', 'auth', 'login', '--api-key', user.apiKey],
		{ stdio: 'inherit' },
	);

	await fs.promises.writeFile(
		path.join(temporaryDirpath, '.tunnel.test.yaml'),
		yaml.stringify({
			[`${organization._id}/${loadTestingUser._id}`]: {
				projectId: loadTestingProjectId,
				'.': {
					tunnelInstanceProxyPreviewId,
				},
			},
		}),
	);

	void execa('bun', ['start'], {
		cwd: temporaryDirpath,
		stdio: 'ignore',
	});

	void execa('bunx', ['@tunnel/cli-staging', 'share', '--port', '3000'], {
		cwd: temporaryDirpath,
		stdio: 'pipe',
	});

	logger.info('Successfully setup tests!');
}
