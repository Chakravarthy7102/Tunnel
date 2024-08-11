'use client';

import { type FunctionReference, type Id } from '@-/database';
import { useVapi, VapiProvider } from '@-/database/react';
import { useUploadFiles as useUploadFiles_original } from '@xixixao/uploadstuff/react';
import {
	ConvexProvider,
	type ConvexProviderWithAuth as BaseConvexProviderWithAuth,
	type ReactMutation,
	useConvex as useConvex_original,
	useMutation as useMutation_original,
	usePaginatedQuery as usePaginatedQuery_original,
	usePreloadedQuery as usePreloadedQuery_original,
} from 'convex/react';
import { convexToJson, jsonToConvex } from 'convex/values';
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react';

const FetchAccessTokenContext = createContext<
	(options: { forceRefreshToken: boolean }) => Promise<string | null>
>(
	async () => null,
);

export const ConvexProviderWithAuth: typeof BaseConvexProviderWithAuth = (
	{ useAuth, client, children },
) => {
	const { fetchAccessToken } = useAuth();

	return (
		<VapiProvider>
			<FetchAccessTokenContext.Provider value={fetchAccessToken}>
				<ConvexProvider client={client as any}>
					{children}
				</ConvexProvider>
			</FetchAccessTokenContext.Provider>
		</VapiProvider>
	);
};

const useAccessToken = () => {
	const fetchAccessToken = useContext(FetchAccessTokenContext);
	const [accessToken, setAccessToken] = useState<string | null | undefined>(
		// `undefined` means loading
		undefined,
	);
	useEffect(() => {
		void fetchAccessToken({ forceRefreshToken: false }).then((token) => {
			setAccessToken(token);
		});
	}, [fetchAccessToken]);
	return accessToken;
};

function getArgsWithAccessToken<$Args extends Record<string, unknown> | 'skip'>(
	args: $Args,
	accessToken: string | null | undefined,
): $Args {
	if (accessToken === undefined || args === 'skip') {
		// @ts-expect-error: works
		return 'skip' as const;
	}

	return {
		// @ts-expect-error: works
		...args,
		...(accessToken === null ? {} : { token: accessToken }),
	};
}

export const usePaginatedQuery: typeof usePaginatedQuery_original = (
	query,
	args,
	options,
) => {
	const accessToken = useAccessToken();
	return usePaginatedQuery_original(
		query,
		getArgsWithAccessToken(args, accessToken),
		options,
	);
};

export function useMutation<$Mutation extends FunctionReference<'mutation'>>(
	mutation: $Mutation,
): ReactMutation<{
	_args: Omit<$Mutation['_args'], 'token'>;
	_returnType: $Mutation['_returnType'];
	_type: $Mutation['_type'];
	_visibility: $Mutation['_visibility'];
}> {
	const fetchAccessToken = useContext(FetchAccessTokenContext);
	const mutate = useMutation_original(mutation);
	return useMemo(() => {
		return Object.assign(async (args: any) => {
			const token = await fetchAccessToken({ forceRefreshToken: false });
			return mutate(getArgsWithAccessToken(args, token));
		}, {
			withOptimisticUpdate: mutate.withOptimisticUpdate,
		});
	}, [mutate]) as any;
}

export const useConvex: typeof useConvex_original = () => {
	const convex = useConvex_original();
	const fetchAccessToken = useContext(FetchAccessTokenContext);
	return useMemo(() => ({
		...convex,
		async query(fn: any, args: any) {
			const accessToken = await fetchAccessToken({ forceRefreshToken: false });
			return convex.query(fn, getArgsWithAccessToken(args, accessToken));
		},
		async mutation(fn: any, args: any) {
			const accessToken = await fetchAccessToken({ forceRefreshToken: false });
			return convex.mutation(
				fn,
				getArgsWithAccessToken(args, accessToken),
			);
		},
	}), [convex, fetchAccessToken]) as any;
};

export const usePreloadedQuery: typeof usePreloadedQuery_original = (
	preloadedQuery,
) => {
	const accessToken = useAccessToken();
	const preloadedQueryWithAccessToken = useMemo(() => {
		return {
			...preloadedQuery,
			_args: convexToJson(
				// @ts-expect-error: broken types
				getArgsWithAccessToken(
					// @ts-expect-error: broken types
					jsonToConvex(preloadedQuery._argsJSON),
					accessToken,
				),
			),
		};
	}, [accessToken, preloadedQuery]);
	return usePreloadedQuery_original(preloadedQueryWithAccessToken);
};

export const useUploadFiles = (
	{ actorUserId }: { actorUserId: Id<'User'> | null },
) => {
	const vapi = useVapi();
	const generateUploadUrl = useMutation(vapi.v.File_generateUploadUrl);
	const createFiles = useMutation(vapi.v.File_create);
	const { startUpload } = useUploadFiles_original(async () =>
		generateUploadUrl()
	);
	const uploadFiles = useCallback(async (files: File[]) => {
		if (actorUserId === null) {
			throw new Error('User is not logged in');
		}

		const uploaded = await startUpload(files);
		return createFiles({
			input: {
				user: actorUserId,
				storageIds: uploaded.map(({ response }: any) => response.storageId),
			},
		});
	}, [actorUserId]);

	return { uploadFiles };
};

export { ConvexReactClient, type Preloaded } from 'convex/react';
