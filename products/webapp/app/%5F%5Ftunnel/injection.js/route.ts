import { execa } from 'execa';
import fs from 'node:fs';
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

	try {
		await execa('pnpm', ['tunneled-service-window-injection/build'], {
			stdio: 'inherit',
		});
	} catch (error: any) {
		// eslint-disable-next-line no-console -- todo
		console.error('Error building injection.js:', error);
	}

	if (process.env.TUNNEL_MONOREPO_DIRPATH === undefined) {
		throw new Error('Missing `TUNNEL_MONOREPO_DIRPATH` environment variable');
	}

	return new Response(
		// This indirect access is needed to avoid the turbopack lint error "TP1004 fs.readFile is very dynamic"
		await fs.promises[[...'readFile'].join('') as 'readFile'](
			path.join(
				process.env.TUNNEL_MONOREPO_DIRPATH,
				'products/tunneled-service-window-injection/.build/injection.js',
			),
		),
		{
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
				'Access-Control-Allow-Headers': '*',
				'Content-Type': 'text/javascript',
			},
		},
	);
}
