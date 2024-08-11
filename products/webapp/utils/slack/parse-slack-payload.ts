import type {
	SlackPayload,
} from '#types';

export async function parseSlackPayload({ request }: { request: Request }) {
	return await request.formData().then((data) =>
		Object.fromEntries(data.entries())
	) as SlackPayload;
}
