'use client';

import layouts from '#route-contexts/_.ts';
import { packageDirpaths } from '@-/packages-config';
import mapObject, { mapObjectSkip } from 'map-obj';
import path from 'pathe';
import { type Context, useContext } from 'react';

const layoutsWithContext = mapObject(
	layouts,
	(key, value) =>
		'default' in value ?
			[
				path.dirname(
					key.replace(
						path.relative(
							packageDirpaths.monorepo,
							path.join(packageDirpaths.webapp, 'app'),
						) + '/',
						'',
					),
				),
				value,
			] :
			mapObjectSkip,
) as {
	[
		K in keyof typeof layouts as (typeof layouts)[K] extends { default: any } ?
			K extends `products/webapp/app/${infer AppRelativePath}/context.ts` ?
				AppRelativePath :
			never :
			never
	]: (typeof layouts)[K];
};

export function useRouteContext<
	$LayoutPath extends keyof typeof layoutsWithContext,
>(
	appRelativePath: $LayoutPath,
): (typeof layoutsWithContext)[$LayoutPath]['default'] extends Context<
	infer $ContextType
> ? $ContextType :
	never
{
	const layout = layoutsWithContext[appRelativePath];

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- Extra check with better error message just to be safe
	if (layout === undefined) {
		throw new Error(
			`Could not find layout context for layout route ${
				String(
					appRelativePath,
				)
			}`,
		);
	}

	// @ts-expect-error: Correct type
	return useContext(layout.default);
}
