function withBundleAnalyzer(config) {
	if (process.env.ANALYZE) {
		const nextBundleAnalyzer = require('@next/bundle-analyzer');
		return nextBundleAnalyzer({ enabled: true })(config);
	} else {
		return config;
	}
}

exports.withBundleAnalyzer = withBundleAnalyzer;
