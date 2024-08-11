export function GET(_req: Request) {
	return new Response(String(process.env.APP_ENV === 'test'));
}
