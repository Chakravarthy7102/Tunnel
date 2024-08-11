import { getConvexUrlFromEnvironment } from '@-/convex';
import type { Id } from '@-/database';

export function getFileUrl(file: Id<'File'> | { _id: Id<'File'> }): string {
	const convexUrl = getConvexUrlFromEnvironment();
	return convexUrl.replace('.cloud', '.site') +
		`/file?id=${typeof file === 'string' ? file : file._id}`;
}
