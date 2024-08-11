import type { ClientDoc } from '@-/client-doc';
import type { TableNames } from '@-/database';
import type { Class } from 'type-fest';

export class UnexpectedError extends Error {
	constructor(message: string, { cause }: { cause: Error }) {
		super(`An unexpected error occurred ${message}`, { cause });
	}
}

export class DocumentNotFoundError extends Error {
	constructor(tableName: TableNames) {
		super(`Could not find the specified ${tableName}`);
		this.name = 'DocumentNotFoundError';
	}
}

export function isError<$ErrorClass extends Class<Error>>(
	error: Error,
	errorClass: $ErrorClass,
): error is InstanceType<$ErrorClass> {
	return error.name === errorClass.name;
}

export class MissingAuthError extends Error {
	constructor() {
		super('Missing authentication credentials');
		this.name = 'MissingAuthError';
	}
}

export class InvalidAuthError extends Error {
	constructor() {
		super('Invalid authentication credentials');
		this.name = 'InvalidAuthError';
	}
}

export class InsufficientPermissionsError extends Error {
	actorUser: ClientDoc<'User'> | null;

	constructor({ actorUser }: { actorUser: ClientDoc<'User'> | null }) {
		super('Insufficient permissions');
		this.name = 'InsufficientPermissionsError';
		this.actorUser = actorUser;
	}
}

export class RouteError extends Error {
	response: ResponseInit;

	constructor(message: string, response: Response) {
		super(message);
		this.response = response;
	}
}

export { ProcedureError } from '#classes/procedure-error.ts';
