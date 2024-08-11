import type { HostEnvironmentType } from '#enums/host-environment-type.ts';
import type {
	scriptTagLivePreviewHostEnvironmentSchema,
	tunnelShareLivePreviewHostEnvironmentSchema,
	wrapperCommandLivePreviewHostEnvironmentSchema,
} from '#schemas/host-environment.ts';
import type { z } from '@-/zod';

// dprint-ignore
export type HostEnvironment<
	$HostEnvironmentType extends HostEnvironmentType = HostEnvironmentType
> =
	(
		HostEnvironmentType.tunnelShare extends $HostEnvironmentType ?
			z.infer<typeof tunnelShareLivePreviewHostEnvironmentSchema> :
		never
	) |
	(
		HostEnvironmentType.wrapperCommand extends $HostEnvironmentType ?
			z.infer<typeof wrapperCommandLivePreviewHostEnvironmentSchema> :
		never
	) |
	(
		HostEnvironmentType.scriptTag extends $HostEnvironmentType ?
			z.infer<typeof scriptTagLivePreviewHostEnvironmentSchema> :
		never
	);
