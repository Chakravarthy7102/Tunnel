'use client';

import { preloadedQueryResult } from '@-/convex/nextjs';
import {
	type Preloaded,
	usePaginatedQuery,
	usePreloadedQuery,
} from '@-/convex/react';
import type { FunctionReference, PaginationResult } from '@-/convex/server';
import type { GenericId, TableNames } from '@-/database';
import { usePrevious } from '@uidotdev/usehooks';
import stringify from 'fast-json-stable-stringify';
import {
	type Dispatch,
	type SetStateAction,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from 'react';

/**
	This hook prevents Convex from overwriting client state (e.g. when using optimistic UI)

	To be compatible with client-side (i.e. non-preloaded) data, we also accept passing a Doc directly
*/
export function usePreloadedQueryState<
	$Doc extends { _id: GenericId<TableNames> },
>(doc: $Doc): [
	$Doc,
	Dispatch<SetStateAction<$Doc>>,
];
export function usePreloadedQueryState<
	$FunctionReference extends FunctionReference<'query'>,
>(
	preloaded: $FunctionReference extends FunctionReference<'query'> ?
		Preloaded<$FunctionReference> :
		{ _id: GenericId<TableNames> },
): [
	ReturnType<typeof usePreloadedQuery<$FunctionReference>> extends
		PaginationResult<any> | Array<any> ?
		ReturnType<typeof usePreloadedQuery<$FunctionReference>> :
		ReturnType<typeof usePreloadedQuery<$FunctionReference>> | null,
	Dispatch<
		SetStateAction<
			ReturnType<typeof usePreloadedQuery<$FunctionReference>> extends
				PaginationResult<infer $Type> ? $Type[] :
				ReturnType<typeof usePreloadedQuery<$FunctionReference>>
		>
	>,
];
export function usePreloadedQueryState(preloadedQueryOrDoc: any) {
	const serverState = usePreloadedQuery(
		'_id' in preloadedQueryOrDoc ?
			{
				_argsJSON: 'skip',
				_valueJSON: preloadedQueryOrDoc,
				// Can't be an empty string since that evaluates to false in Convex's `if (!name)` check
				_name: preloadedQueryOrDoc._id,
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- Unused at runtime
				__type: null!,
			} :
			preloadedQueryOrDoc,
	);
	const [state, setState] = useState(serverState);

	useEffect(() => {
		setState(serverState);
	}, [serverState]);

	return [state, setState];
}

export function usePreloadedPaginatedQuery<
	$FunctionReference extends FunctionReference<'query'>,
>(
	preloaded: Preloaded<$FunctionReference>,
): ReturnType<typeof usePaginatedQuery<$FunctionReference>> & {
	setQueryArgs: Dispatch<SetStateAction<$FunctionReference['_args']>>;
} {
	const [hasQueryArgsChanged, setHasQueryArgsChanged] = useState(false);
	const [hasLoadedMore, setHasLoadedMore] = useState(false);
	const [queryArgsJson, setQueryArgsJson] = useState<any>(preloaded._argsJSON);
	const previousStringifiedQueryArgs = usePrevious(queryArgsJson);

	useEffect(() => {
		if (
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- Can be null
			previousStringifiedQueryArgs !== null &&
			stringify(queryArgsJson) !==
				stringify(previousStringifiedQueryArgs)
		) {
			setHasQueryArgsChanged(true);
		}
	}, [queryArgsJson, previousStringifiedQueryArgs]);

	const setQueryArgs: Dispatch<SetStateAction<$FunctionReference['_args']>> =
		useCallback(
			(queryArgs) => {
				if (typeof queryArgs === 'function') {
					setQueryArgsJson((previousQueryArgs: any) =>
						// @ts-expect-error: broken
						queryArgs(previousQueryArgs)
					);
				} else {
					setQueryArgsJson(queryArgs);
				}
			},
			[],
		);

	const initialResults = useMemo(() => preloadedQueryResult(preloaded), [
		preloaded,
	]);

	const { isLoading, loadMore, results: lazyResults, status } =
		usePaginatedQuery<$FunctionReference>(
			// @ts-expect-error: Works at runtime
			preloaded._name,
			// isAuthLoading || !isAuthenticated ?
			queryArgsJson,
			{
				initialNumItems: initialResults.page.length === 0 ?
					1 :
					initialResults.page.length,
			},
		);

	const results = useMemo(() => [
		...(!hasLoadedMore && !hasQueryArgsChanged && isLoading ?
			initialResults.page :
			[]),
		...lazyResults,
	], [
		hasQueryArgsChanged,
		hasLoadedMore,
		isLoading,
		initialResults.page,
		lazyResults,
	]);

	// @ts-expect-error: correct type
	return {
		isLoading,
		loadMore(numItems: number) {
			setHasLoadedMore(true);
			loadMore(numItems);
		},
		results,
		status: initialResults.isDone ? 'Exhausted' : status,
		setQueryArgs,
	};
}

export function usePreloadedPaginatedQueryState<
	$FunctionReference extends FunctionReference<'query'>,
>(
	preloaded: Preloaded<$FunctionReference>,
): [
	ReturnType<typeof usePreloadedPaginatedQuery<$FunctionReference>>,
	Dispatch<
		SetStateAction<
			ReturnType<
				typeof usePreloadedPaginatedQuery<$FunctionReference>
			>['results']
		>
	>,
] {
	const { isLoading, loadMore, results, status, setQueryArgs } =
		usePreloadedPaginatedQuery(preloaded);
	const [resultsState, setResultsState] = useState(results);
	useEffect(() => {
		setResultsState(results);
	}, [results]);

	return [
		// @ts-expect-error: correct type
		{
			isLoading,
			loadMore,
			results: resultsState,
			status,
			setQueryArgs,
		},
		setResultsState,
	] as const;
}
