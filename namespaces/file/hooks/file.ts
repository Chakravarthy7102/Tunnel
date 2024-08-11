import type { ParsedFile } from '#types';
import { getFileUrl } from '#utils/url.ts';
import type { ClientDoc } from '@-/client-doc';
import { useMemo } from 'react';
import useSWR, { type Fetcher } from 'swr';

const fetcher: Fetcher<string, string> = async (url) =>
	fetch(url).then(async (res) => res.text());

export function useFile<T>(
	file: ClientDoc<'File'> | null,
	parse: (fileContents: string) => T,
): ParsedFile<T> {
	const { data, isLoading } = useSWR<string | null>(
		file === null ? null : getFileUrl(file),
		fetcher,
	);
	const parsedContents = useMemo(
		() => data === null || data === undefined ? null : parse(data),
		[data],
	);

	if (isLoading) {
		return {
			isLoading: true,
			rawContents: null,
			parsedContents: null,
		};
	}

	return {
		isLoading,
		rawContents: data ?? null,
		parsedContents,
	} as any;
}
