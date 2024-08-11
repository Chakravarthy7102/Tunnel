import type { ResultAsync } from 'errok';

export async function deleteIgnoringNonexistentError(
	deleteResultAsync: ResultAsync<unknown, Error>,
) {
	const result = await deleteResultAsync;
	if (result.isErr()) {
		if (result.error.message.includes('Delete on nonexistent document')) {
			return null;
		}

		// TODO: fix
		// result.unwrapOrThrow();
	} else {
		return result.value;
	}
}
