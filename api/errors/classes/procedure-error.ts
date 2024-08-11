export class ProcedureError<$Error extends Error> extends Error {
	cause: $Error;
	constructor(title: string, error: $Error) {
		super(title + ': ' + error.message);
		this.cause = error;
		this.name = 'ProcedureError';
	}
}
