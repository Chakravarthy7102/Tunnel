import type { LocalWorkspace } from '#types';
import type { Id } from '@-/database';
import type { DotTunnelJsonFileManager } from './_class.ts';

export async function DotTunnelJsonFileManager_setActiveLocalWorkspace(
	this: DotTunnelJsonFileManager,
	{ userId, relativeDirpath, userLocalWorkspaceId }: {
		userId: Id<'User'>;
		relativeDirpath: string;
		userLocalWorkspaceId: Id<'UserLocalWorkspace'> | null;
	},
) {
	await this.update((dotTunnelJson) => {
		dotTunnelJson.activeLocalWorkspaces[
			`${userId}|${relativeDirpath}`
		] = userLocalWorkspaceId;
	});
}

export async function DotTunnelJsonFileManager_getActiveLocalWorkspace(
	this: DotTunnelJsonFileManager,
	{ userId, relativeDirpath }: {
		userId: Id<'User'>;
		relativeDirpath: string;
	},
) {
	const dotTunnelJson = await this.read();
	return dotTunnelJson.activeLocalWorkspaces[
		`${userId}|${relativeDirpath}`
	] ?? null;
}

export async function DotTunnelJsonFileManager_addLocalWorkspace(
	this: DotTunnelJsonFileManager,
	localWorkspace: LocalWorkspace,
) {
	await this.update((dotTunnelJson) => {
		dotTunnelJson.localWorkspaces.push(localWorkspace);
	});
}

export async function DotTunnelJsonFileManager_getLocalWorkspace(
	this: DotTunnelJsonFileManager,
	{
		relativeDirpath,
		actorUserId,
	}: {
		relativeDirpath: string;
		actorUserId: string;
	},
): Promise<LocalWorkspace | undefined> {
	const dotTunnelJson = await this.read();

	const localWorkspace = dotTunnelJson.localWorkspaces.find(
		(localWorkspaces) =>
			localWorkspaces.relativeDirpath === relativeDirpath &&
			localWorkspaces.userId === actorUserId,
		// localWorkspaces.projectId === projectId
	);

	return localWorkspace;
}

export async function DotTunnelJsonFileManager_deleteLocalWorkspace(
	this: DotTunnelJsonFileManager,
	{
		relativeDirpath,
		actorUserId,
	}: {
		relativeDirpath: string;
		actorUserId: string;
	},
): Promise<void> {
	await this.update((dotTunnelJson) => {
		dotTunnelJson.localWorkspaces = dotTunnelJson.localWorkspaces.filter(
			(localWorkspace) =>
				localWorkspace.relativeDirpath !== relativeDirpath ||
				localWorkspace.userId !== actorUserId,
		);
	});
}
