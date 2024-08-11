export const revalidate = 30;

import { RichText } from '#components/v1/marketing/rich-text.tsx';
import {
	Display2,
	Paragraph2,
	Paragraph3,
} from '#components/v1/marketing/typography.tsx';
import { BlockContainer } from '#components/v1/marketing/ui/layout.tsx';
import { dayjs } from '@tunnel/dayjs';
import { basehub } from 'basehub';

export async function generateMetadata() {
	return {
		title: 'Changelog - Tunnel',
	};
}

export default async function Page() {
	const { changelog } = await basehub({ next: { revalidate: 30 } }).query({
		changelog: {
			items: {
				_id: true,
				title: true,
				date: true,
				body: {
					json: {
						content: true,
					},
				},
			},
		},
	});

	return (
		<BlockContainer className="sm:gap-16 gap-12">
			<div className="flex flex-col items-center justify-center text-center gap-2 sm:gap-6">
				<Display2 className="max-w-3xl">Changelog</Display2>
				<Paragraph2 className="max-w-lg text-muted-foreground">
					The latest features and improvements to Tunnel.
				</Paragraph2>
			</div>
			<div className="flex flex-col w-full sm:gap-16 gap-8">
				{changelog.items.sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
					.map(
						(changelog) => {
							return (
								<div
									key={changelog._id}
									className="flex sm:flex-row gap-2 sm:gap-16 flex-col w-full"
								>
									<div className="flex flex-col flex-shrink-0 items-start">
										<Paragraph3 className="text-muted-foreground">
											{dayjs(changelog.date).format('MMMM D, YYYY')}
										</Paragraph3>
									</div>
									<div className="flex flex-col items-start w-full gap-8">
										<div className="text-muted-foreground">
											<RichText>
												{changelog.body.json.content}
											</RichText>
										</div>
									</div>
								</div>
							);
						},
					)}
			</div>
		</BlockContainer>
	);
}
