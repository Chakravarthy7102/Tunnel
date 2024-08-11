export interface Context {
	contextType: 'http';
	headers: Headers;
	accessToken: string | null;
}
