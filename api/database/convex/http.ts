import { createCorsHeaders, defineHttpAction } from '#utils/http.ts';
import { defineRoute } from '#utils/route.ts';
import { httpRouter } from '@-/convex/server';
import { File_httpGet } from './v.ts';

const http = httpRouter();

const sendCorsHeaders = defineHttpAction(async (_, request) => {
	// Make sure the necessary headers are present
	// for this to be a valid pre-flight request
	const { headers } = request;
	if (
		headers.get('Origin') !== null &&
		headers.get('Access-Control-Request-Method') !== null &&
		headers.get('Access-Control-Request-Headers') !== null
	) {
		return new Response(null, {
			headers: createCorsHeaders(),
		});
	} else {
		return new Response();
	}
});

defineRoute(http, {
	path: '/file',
	method: 'OPTIONS',
	handler: sendCorsHeaders,
});

defineRoute(http, {
	path: '/file',
	method: 'GET',
	handler: File_httpGet,
});

defineRoute(http, {
	path: '/file/upload',
	method: 'OPTIONS',
	handler: sendCorsHeaders,
});

// http.route({
// 	path: '/file/upload',
// 	method: 'POST',
// 	handler: httpAction(async (ctx, request) => {
// 		const blob = await request.blob();
// 		const storageId = await ctx.storage.store(blob);

// 		await ctx.runMutation(vapi.v.File_create, {
// 			input: {
// 				data: {
// 					filepath,
// 					md5Hash,
// 					type,
// 					user,
// 					storageId,
// 				},
// 				include: {},
// 			},
// 		});

// 		return new Response(null, {
// 			status: 200,
// 			// CORS headers
// 			headers: new Headers({
// 				'Access-Control-Allow-Origin': '*',
// 				Vary: 'origin',
// 			}),
// 		});
// 	}),
// });

export default http;
