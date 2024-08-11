export interface GithubRepository {
	id: number;
	url: string;
	git_url: string;
	html_url: string;
	full_name: string;
}

export interface GithubOrganization {
	id: number;
	type: string;
	account: {
		login: string;
		avatar_url: string;
		html_url: string;
	};
	html_url: string;
}
