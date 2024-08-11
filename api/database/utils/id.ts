import type { Id, TableNames } from '#types';
import { createId as id } from '@paralleldrive/cuid2';

export const clientIdToServerId = new Map<string, string | null>();
export const serverIdToClientId = new Map<string, string | null>();

/**
	Resolves an ID to a client ID if present. This is used in places like the `key` prop for React components to prevent re-mounting when the server ID is returned.
*/
export function clientId<$Id extends string | null>(id: $Id): $Id {
	if (id === null) {
		// @ts-expect-error: Correct type
		return null;
	}

	const clientId = serverIdToClientId.get(id);
	if (clientId) {
		// @ts-expect-error: Correct type
		return clientId;
	}

	return id;
}

export function resolveId<$Id extends string | null>(id: $Id): $Id {
	if (id === null) {
		// @ts-expect-error: Correct type
		return null;
	}

	const serverId = clientIdToServerId.get(id);
	if (serverId) {
		// @ts-expect-error: Correct type
		return serverId;
	}

	return id;
}

export function createIdPair<$TableName extends TableNames>(
	_tableName: $TableName,
): [(serverId: Id<$TableName> | undefined) => void, Id<$TableName>] {
	const clientId = id();
	clientIdToServerId.set(clientId, null);

	// Setting a server ID will associate this client ID with a server ID, so that when the convex subscriptions receive a new document with this server ID, the client will know to remove the document that had this client ID
	const setServerId = (serverId: string | undefined) => {
		if (serverId !== undefined) {
			clientIdToServerId.set(clientId, serverId);
			serverIdToClientId.set(serverId, clientId);
		}
	};

	return [
		setServerId,
		clientId as any,
	];
}

export function createCid(): string {
	return id();
}
