import { RichText } from '#components/v1/marketing/rich-text.tsx';
import { BlockContainer } from '#components/v1/marketing/ui/layout.tsx';
import { basehub } from 'basehub';

export function generateMetadata() {
	return {
		title: 'Terms of Service - Tunnel',
		description: 'Terms of Service for Tunnel.',
	};
}

export default async function TermsOfService() {
	const { termsOfService } = await basehub({ next: { revalidate: 30 } }).query({
		termsOfService: {
			body: {
				json: {
					content: true,
				},
			},
		},
	});

	return (
		<BlockContainer className="items-start">
			<div className="text-muted-foreground">
				<RichText>
					{termsOfService.body?.json.content}
				</RichText>
			</div>
		</BlockContainer>
	);
}
