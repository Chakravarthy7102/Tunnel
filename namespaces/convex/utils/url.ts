export const getConvexUrlFromEnvironment = () => {
	const convexUrl = (() => {
		try {
			// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- We need to coalesce on an empty string
			return process.env.NEXT_PUBLIC_CONVEX_URL || process.env.CONVEX_URL;
		} catch {
			try {
				return process.env.CONVEX_URL;
			} catch {
				throw new Error('Missing `CONVEX_URL` in environment');
			}
		}
	})();

	if (!convexUrl) {
		throw new Error('Missing `CONVEX_URL` in environment');
	}

	return convexUrl;
};
