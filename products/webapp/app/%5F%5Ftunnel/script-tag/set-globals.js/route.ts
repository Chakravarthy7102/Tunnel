import { ApiConvex } from '@-/convex/api';
import { getInclude } from '@-/database/selection-utils';
import {
	getIncludes,
	Organization_$tunneledServiceEnvironmentData,
	Project_$tunneledServiceEnvironmentData,
	ProjectLivePreview_$tunneledServiceEnvironmentData,
	TunnelInstanceProxyPreview_$tunneledServiceEnvironmentData,
} from '@-/database/selections';
import { getProjectGitMetadata } from '@-/git-metadata/server';
import { HostEnvironmentType } from '@-/host-environment';
import { logger } from '@-/logger';
import type { TunneledServiceEnvironmentData } from '@-/tunneled-service-environment';
import { isLocalUrl, normalizeProjectLivePreviewUrl } from '@-/url';
import { ApiUrl } from '@-/url/api';
import { outdent } from 'outdent';
import safeUrl from 'safer-url';

function getSetGlobalsScript({
	tunneledServiceEnvironmentData,
	toolbarUrl,
}: {
	tunneledServiceEnvironmentData: TunneledServiceEnvironmentData<
		HostEnvironmentType.scriptTag
	>;
	toolbarUrl: string;
}) {
	// dprint-ignore
	return outdent`
		${/* We only want to set `__TUNNELED_SERVICE_ENVIRONMENT_DATA__` if it's undefined, because otherwise it means that this page is being shared with `tunnel share` which we prioritize (since it's more powerful than the script tag) */ ''}
		if (globalThis.__TUNNELED_SERVICE_ENVIRONMENT_DATA__ === undefined) {
			globalThis.__TUNNELED_SERVICE_ENVIRONMENT_DATA__ = ${
				JSON.stringify(
					tunneledServiceEnvironmentData,
				)
			};

			document.body.append(
				Object.assign(document.createElement('script'), {
					src: ${JSON.stringify(toolbarUrl)},
					async: true,
					defer: true
				})
			);
		}
	`;
}

/**
	/__tunnel/script-tag/set-globals.js

	The script tag needs to use the "Origin" or "Referer" header to determine the live preview URL that it's rendered in.

	Since browsers don't support dynamically loading and executing external JavaScript in order, we return our entire script as one script.
*/
export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const projectSlug = searchParams.get('projectId');
		const actorUserId = searchParams.get('actorUserId');
		const branchName = searchParams.get('branchName');

		const toolbarUrl = ApiUrl.getWebappUrl({
			fromHeaders: request.headers,
			withScheme: true,
			path: '/__tunnel/toolbar.js',
		});

		const gitMetadata = await (async () => {
			if (branchName === null) {
				return {
					data: null,
					errors: [],
				};
			}

			if (projectSlug === null) {
				return {
					data: null,
					errors: [getProjectGitMetadata.errors.project_not_specified],
				};
			}

			return getProjectGitMetadata({
				branchName,
				projectSlug,
			});
		})();

		// If the project is not specified, we return `project: null` so that the script tag can inform the user that they're missing the `data-project-id` attribute on the <script> tag.
		if (projectSlug === null) {
			return new Response(
				getSetGlobalsScript({
					toolbarUrl,
					tunneledServiceEnvironmentData: {
						hostEnvironment: {
							type: HostEnvironmentType.scriptTag,
							projectId: undefined,
							gitMetadata,
						},
						project: null,
						organization: null,
						tunnelInstanceProxyPreview: null,
						// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- TODO: figure out a better approach if the project could not be found
						activeProjectLivePreviewId: null!,
						projectLivePreviews: {},
					},
				}),
				{
					headers: {
						'Content-Type': 'text/javascript',
					},
				},
			);
		}

		const includes = getIncludes();
		const projectData = await ApiConvex.v.Project.get({
			from: { slug: projectSlug },
			include: includes(
				getInclude(Project_$tunneledServiceEnvironmentData),
				includes.Project({
					organization: {
						include: getInclude(Organization_$tunneledServiceEnvironmentData),
					},
				}),
			),
		}).unwrapOrThrow();

		// If the project could not be found, we return `project: null` so that the script tag can inform the user that the project they specified in the `data-project-id` attribute could not be found.
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- todo
		if (projectData === null) {
			return new Response(
				getSetGlobalsScript({
					toolbarUrl,
					tunneledServiceEnvironmentData: {
						hostEnvironment: {
							type: HostEnvironmentType.scriptTag,
							projectId: undefined,
							gitMetadata,
						},
						project: null,
						organization: null,
						tunnelInstanceProxyPreview: null,
						// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- TODO: figure out a better approach if the project could not be found
						activeProjectLivePreviewId: null!,
						projectLivePreviews: {},
					},
				}),
				{
					headers: {
						'Content-Type': 'text/javascript',
					},
				},
			);
		}

		const { organization, ...project } = projectData;

		const sendStringifiedTunneledServiceEnvironmentDataWithNullActor = () =>
			new Response(
				getSetGlobalsScript({
					toolbarUrl,
					tunneledServiceEnvironmentData: {
						hostEnvironment: {
							type: HostEnvironmentType.scriptTag,
							projectId: project._id,
							gitMetadata,
						},
						project,
						organization,
						tunnelInstanceProxyPreview: null,
						// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- TODO: figure out a better approach if the project could not be found
						activeProjectLivePreviewId: null!,
						projectLivePreviews: {},
					},
				}),
				{
					headers: {
						'Content-Type': 'text/javascript',
					},
				},
			);

		if (actorUserId === null) {
			return sendStringifiedTunneledServiceEnvironmentDataWithNullActor();
		} else {
			const actorUser = await ApiConvex.v.User.get({
				from: { id: actorUserId },
				include: {},
			}).unwrapOrThrow();

			if (actorUser === null) {
				return sendStringifiedTunneledServiceEnvironmentDataWithNullActor();
			}

			const projectLivePreviewData = await (async () => {
				const include = includes(
					getInclude(ProjectLivePreview_$tunneledServiceEnvironmentData),
					includes.ProjectLivePreview({
						linkedTunnelInstanceProxyPreview: {
							include: getInclude(
								TunnelInstanceProxyPreview_$tunneledServiceEnvironmentData,
							),
						},
					}),
				);

				const originHeader = request.headers.get('origin') ??
					request.headers.get('referer');
				if (originHeader === null) {
					return null;
				}

				const originUrl = safeUrl(originHeader);
				if (originUrl === null) {
					return null;
				}

				// If the <script> tag is loaded from a local URL, we shouldn't infer a project live preview from the URL
				if (isLocalUrl({ url: originUrl })) {
					return null;
				}

				const projectLivePreviewUrl = normalizeProjectLivePreviewUrl(
					originUrl,
				);

				return ApiConvex.v.ProjectLivePreview.ensure({
					input: {
						projectLivePreview: {
							project: project._id,
							url: projectLivePreviewUrl,
							isLive: true,
							createdByUser: actorUser._id,
						},
						include,
					},
				}).unwrapOrThrow();
			})();

			if (projectLivePreviewData === null) {
				return new Response(
					getSetGlobalsScript({
						toolbarUrl,
						tunneledServiceEnvironmentData: {
							hostEnvironment: {
								type: HostEnvironmentType.scriptTag,
								projectId: project._id,
								gitMetadata,
							},
							project,
							organization,
							tunnelInstanceProxyPreview: null,
							activeProjectLivePreviewId: null,
							projectLivePreviews: {},
						},
					}),
					{
						headers: {
							'Content-Type': 'text/javascript',
						},
					},
				);
			} else {
				const { linkedTunnelInstanceProxyPreview, ...projectLivePreview } =
					projectLivePreviewData;

				return new Response(
					getSetGlobalsScript({
						toolbarUrl,
						tunneledServiceEnvironmentData: {
							hostEnvironment: {
								type: HostEnvironmentType.scriptTag,
								projectId: project._id,
								gitMetadata,
							},
							project,
							organization,
							tunnelInstanceProxyPreview: linkedTunnelInstanceProxyPreview ??
								null,
							activeProjectLivePreviewId: projectLivePreview._id,
							projectLivePreviews: {
								[projectLivePreview._id]: projectLivePreview,
							},
						},
					}),
					{
						headers: {
							'Content-Type': 'text/javascript',
						},
					},
				);
			}
		}
	} catch (error: unknown) {
		logger.error('An unexpected error occurred:', error);
		return new Response('An unexpected error occurred', {
			status: 500,
		});
	}
}
