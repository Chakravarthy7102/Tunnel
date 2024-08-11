export const revalidate = 30;

import { RichText } from '#components/v1/marketing/rich-text.tsx';
import { Paragraph4 } from '#components/v1/marketing/typography.tsx';
import { Button } from '#components/v1/marketing/ui/button.tsx';
import { BlockContainer } from '#components/v1/marketing/ui/layout.tsx';
import { Link } from '#components/v1/marketing/ui/link.tsx';
import { Badge } from '@-/design-system/v1';
import { dayjs } from '@tunnel/dayjs';
import { basehub } from 'basehub';
import { ChevronLeft } from 'lucide-react';
import { notFound } from 'next/navigation';

export async function generateMetadata(
	{ params: { 'changelog-date': changelogDate } }: {
		params: { 'changelog-date': string };
	},
) {
	let isoDate: string;
	try {
		const date = new Date(Date.parse(changelogDate));
		date.setUTCHours(0, 0, 0, 0);
		isoDate = date.toISOString();
	} catch {
		return notFound();
	}

	const { changelog } = await basehub({ next: { revalidate: 30 } }).query({
		changelog: {
			__args: {
				filter: {
					date: {
						eq: isoDate,
					},
				},
			},
			items: {
				title: true,
			},
		},
	});

	if (changelog.items[0] === undefined) {
		return notFound();
	}

	return {
		title: changelog.items[0].title,
	};
}

export default async function Page(
	{ params: { 'changelog-date': changelogDate } }: {
		params: { 'changelog-date': string };
	},
) {
	let isoDate: string;
	try {
		const date = new Date(Date.parse(changelogDate));
		date.setUTCHours(0, 0, 0, 0);
		isoDate = date.toISOString();
	} catch {
		return notFound();
	}

	const { changelog } = await basehub({ next: { revalidate: 30 } }).query({
		changelog: {
			__args: {
				filter: {
					date: {
						eq: isoDate,
					},
				},
			},
			items: {
				date: true,
				body: {
					json: {
						content: true,
					},
				},
			},
		},
	});

	if (changelog.items[0] === undefined) {
		return notFound();
	}

	return (
		<BlockContainer>
			<div className="flex flex-col items-start w-full gap-8">
				<div className="flex flex-row gap-4 items-center">
					<Badge size="md">
						Changelog
					</Badge>
					<Paragraph4 className="text-muted-foreground">
						{dayjs(changelog.items[0].date).format('MMMM D, YYYY')}
					</Paragraph4>
				</div>
				<div className="text-muted-foreground">
					<RichText>
						{changelog.items[0].body.json.content}
					</RichText>
				</div>
				<Button
					variant="secondary"
					asChild
				>
					<Link href="/changelog">
						<ChevronLeft size={20} />
						Previous changelogs
					</Link>
				</Button>
			</div>
		</BlockContainer>
	);
}
