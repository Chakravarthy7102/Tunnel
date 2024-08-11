'use client';

import {
	usePreloadedPaginatedQueryState,
	usePreloadedQueryState,
} from '#hooks/preload.ts';
import type { NonNullPreloaded } from '#types';
import { useRouteContext } from '#utils/route-context.ts';
import { trpc } from '#utils/trpc.ts';
import { type Preloaded, useUploadFiles } from '@-/convex/react';
import type { api } from '@-/database';
import { getFileUrl } from '@-/file';
import { toast } from '@-/tunnel-error';
import * as Cookies from 'es-cookie';
import { useRouter } from 'next/navigation';
import { usePostHog } from 'posthog-js/react';
import { useEffect } from 'react';
import LayoutContext from './context.ts';

export default function LayoutClient({
	children,
	preloadedActorOrganizationMember,
	preloadedOrganization,
	preloadedProjects,
}: React.PropsWithChildren<{
	preloadedActorOrganizationMember: NonNullPreloaded<
		typeof api.v.OrganizationMember_get_actorProfileData
	>;
	preloadedOrganization: NonNullPreloaded<
		typeof api.v.Organization_get_dashboardPageData
	>;
	preloadedProjects: Preloaded<
		typeof api.v.Project_list_dashboardPageData
	>;
}>) {
	const router = useRouter();
	const { actorUser } = useRouteContext('(webapp)/(logged-in)');
	const { uploadFiles } = useUploadFiles({ actorUserId: actorUser._id });
	const [organization, setOrganization] = usePreloadedQueryState(
		preloadedOrganization,
	);
	const [{ results: projects }, setProjects] = usePreloadedPaginatedQueryState(
		preloadedProjects,
	);
	const [actorOrganizationMember] = usePreloadedQueryState(
		preloadedActorOrganizationMember,
	);
	const updateOrganization = trpc.organization.update.useMutation();
	const organizationId = organization?._id ?? null;

	useEffect(() => {
		if (organizationId === null) {
			return;
		}

		// Adds a cookie that tracks the users' last visited organization.
		// This tracking is implemented via a cookie instead of `localStorage` so that it can be accessed server-side (which is useful for organization redirect routes such as `/projects`)
		Cookies.set('lastVisitedOrganizationId', organizationId);
	}, [organizationId]);

	const updateOrganizationProfileImageUrl = async (file: File) => {
		if (organization === null) {
			return;
		}

		setOrganization({
			...organization,
			profileImageUrl: globalThis.URL.createObjectURL(file),
		});
		const files = await uploadFiles([file]);
		const result = await updateOrganization.mutateAsync({
			organization: {
				id: organization._id,
			},
			actor: {
				type: 'User',
				data: { id: actorUser._id },
			},
			updates: {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- Guaranteed to exist
				profileImageUrl: getFileUrl(files[0]!),
			},
		});

		if (result.isErr()) {
			toast.procedureError(result);
		}
	};

	if (organization === null) {
		router.replace('/home');
		return null;
	}

	if (actorOrganizationMember === null) {
		router.replace('/home');
		return null;
	}

	const posthog = usePostHog();
	useEffect(() => {
		posthog.group('organization', organization._id, {
			name: organization.name,
		});
	}, [organization._id, organization.name, posthog]);

	return (
		<LayoutContext.Provider
			value={{
				projects,
				setProjects,
				organization,
				setOrganization,
				actorOrganizationMember,
				updateOrganizationProfileImageUrl,
			}}
		>
			{children}
		</LayoutContext.Provider>
	);
}
