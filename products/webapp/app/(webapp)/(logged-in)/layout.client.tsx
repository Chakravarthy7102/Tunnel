'use client';

import {
	usePreloadedPaginatedQueryState,
	usePreloadedQueryState,
} from '#hooks/preload.ts';
import type { NonNullPreloaded } from '#types';
import { useOnceEffect } from '#utils/hooks.ts';
import { getLocalstorageStorage } from '#utils/localstorage.ts';
import { trpc } from '#utils/trpc.ts';
import { type Preloaded, useUploadFiles } from '@-/convex/react';
import type { api } from '@-/database';
import { APP_ENV } from '@-/env/app';
import { getFileUrl } from '@-/file';
import { toast } from '@-/tunnel-error';
import { useRouter } from 'next/navigation';
import { usePostHog } from 'posthog-js/react';
import React, { useEffect } from 'react';
import LayoutContext from './context.ts';

export default function LoggedInClientLayout({
	children,
	preloadedActorUser,
	preloadedActorOrganizationMembers,
}: React.PropsWithChildren<{
	preloadedActorUser: NonNullPreloaded<typeof api.v.User_get_profileData>;
	preloadedActorOrganizationMembers: Preloaded<
		typeof api.v.OrganizationMember_list_actorProfileData
	>;
}>) {
	const [actorUser, setActorUser] = usePreloadedQueryState(
		preloadedActorUser,
	);
	const actorUserId = actorUser?._id ?? null;
	const [{ results: actorOrganizationMembers }, setActorOrganizationMembers] =
		usePreloadedPaginatedQueryState(preloadedActorOrganizationMembers);
	const updateUser = trpc.user.update.useMutation();
	const router = useRouter();
	const { uploadFiles } = useUploadFiles({ actorUserId });

	useEffect(() => {
		void (async () => {
			if (actorUserId === null) {
				return;
			}

			const localstorageStorage = getLocalstorageStorage();
			const localstorageStorageData = await localstorageStorage.get();
			await localstorageStorage.set({
				...localstorageStorageData,
				actor: {
					type: 'User',
					data: { id: actorUserId },
				},
			});
		})();
	}, [actorUserId]);

	useOnceEffect(() => {
		if (APP_ENV === 'test') {
			return;
		}

		if (actorUser === null) {
			return;
		}

		// We try to infer the user's timezone from their browser if they haven't set it yet
		if (actorUser.timezone === null && typeof window !== 'undefined') {
			void (async () => {
				actorUser.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
				const result = await updateUser.mutateAsync({
					actor: { type: 'User', data: { id: actorUser._id } },
					user: {
						id: actorUser._id,
					},
					updates: {
						timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
					},
				});

				// We deliberately don't toast here because this update happens without user interaction
				if (result.isErr()) {
					console.error("Failed to automatically set the user's timezone");
				}
			})();
		}
	});

	const posthog = usePostHog();

	useEffect(() => {
		if (actorUser === null) {
			return;
		}

		posthog.identify(actorUser._id, {
			name: actorUser.fullName,
			email: actorUser.email,
		});
	}, [posthog, actorUser]);

	// If the actor user is null (e.g. was deleted in a test), we should redirect the user to /login
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- The user might be deleted
	if (actorUser === null) {
		router.replace('/login');
		return null;
	}

	const setProfileImage = async ({ file }: { file: File }) => {
		setActorUser({
			...actorUser,
			profileImageUrl: globalThis.URL.createObjectURL(file),
		});
		const files = await uploadFiles([file]);
		const result = await updateUser.mutateAsync({
			actor: {
				type: 'User',
				data: { id: actorUser._id },
			},
			user: {
				id: actorUser._id,
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

	return (
		<LayoutContext.Provider
			value={{
				actorUser,
				setActorUser,
				setProfileImage,
				actorOrganizationMembers,
				setActorOrganizationMembers,
			}}
		>
			{children}
		</LayoutContext.Provider>
	);
}
