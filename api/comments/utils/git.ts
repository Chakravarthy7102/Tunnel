export function convertGitToUrl(gitUrl: string) {
	const httpsUrl = gitUrl.replace(/^git:\/\//, 'https://');
	const httpsUrlWithoutGit = httpsUrl.replace(/\.git$/, '');

	return httpsUrlWithoutGit;
}
