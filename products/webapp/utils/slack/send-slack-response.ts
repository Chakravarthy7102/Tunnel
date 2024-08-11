export const SlackAuthenticationStatus = {
	NotLoggedIn:
		`You are not logged in to Tunnel. To login, run \`/tunnel login\``,
	Empty: '',
};

export function sendSlackResponse(
	status:
		typeof SlackAuthenticationStatus[keyof typeof SlackAuthenticationStatus],
) {
	return new Response(status, { status: 200 });
}
