import { RichText } from '#components/v1/marketing/rich-text.tsx';
import { BlockContainer } from '#components/v1/marketing/ui/layout.tsx';
import { basehub } from 'basehub';

export function generateMetadata() {
	return {
		title: 'Privacy Policy - Tunnel',
		description: 'Privacy Policy for Tunnel.',
	};
}

export default async function TermsOfService() {
	const { privacyPolicy } = await basehub({ next: { revalidate: 30 } }).query({
		privacyPolicy: {
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
					{privacyPolicy.body?.json.content}
				</RichText>
			</div>
		</BlockContainer>
	);
}
