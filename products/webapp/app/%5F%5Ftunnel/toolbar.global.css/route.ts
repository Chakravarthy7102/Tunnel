import fs from 'node:fs';
import pWaitFor from 'p-wait-for';
import path from 'pathe';

export function OPTIONS() {
	return new Response(null, {
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
			'Access-Control-Allow-Headers': '*',
		},
	});
}

export async function GET() {
	if (process.env.NODE_ENV === 'production') {
		return new Response('');
	}

	const monorepoDirpath = process.env.TUNNEL_MONOREPO_DIRPATH;
	if (monorepoDirpath === undefined) {
		throw new Error('Missing `TUNNEL_MONOREPO_DIRPATH` environment variable');
	}

	return new Response(
		await pWaitFor(async () => {
			try {
				return pWaitFor.resolveWith(
					await fs.promises[[...'readFile'].join('') as 'readFile'](
						path.join(
							monorepoDirpath,
							'products/tunnel-instance-page-toolbar/.build/toolbar.global.css',
						),
					),
				);
			} catch {
				return false;
			}
		}),
		{
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
				'Access-Control-Allow-Headers': '*',
				'Content-Type': 'text/css',
			},
		},
	);
}
