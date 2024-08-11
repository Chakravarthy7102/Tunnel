import { env } from '@-/env';
import type { ApiData, FlagDefinitionType } from '@vercel/flags';
import ky from 'ky';
import { NextResponse } from 'next/server';

export async function GET() {
	const response = await ky.get(
		`https://app.posthog.com/api/projects/61043/feature_flags`,
		{
			headers: {
				'Authorization': `Bearer ${env('POSTHOG_API_KEY')}`,
			},
		},
	);

	const json = await response.json<
		{ results: Array<{ key: string; name: string }> }
	>();

	const apiData: ApiData = {
		definitions: Object.fromEntries(json.results.map((result) =>
			[
				result.key,
				{
					description: result.name,
					options: [
						{
							value: true,
							label: 'Enabled',
						},
						{
							value: false,
							label: 'Disabled',
						},
					],
				} satisfies FlagDefinitionType,
			] as const
		)),
		overrideEncryptionMode: 'encrypted',
	};
	return NextResponse.json<ApiData>(apiData);
}
