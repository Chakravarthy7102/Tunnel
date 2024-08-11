export const revalidate = 30;

import { Pricing } from '#sections/pricing.tsx';

export async function generateMetadata() {
	return {
		title: 'Pricing - Tunnel',
	};
}

export default async function Page() {
	return (
		<Pricing
			title="Pricing"
			subtitle="Free to get started, with flexible plans that scale with your team."
			plans={[
				{
					variant: 'secondary',
					name: 'Free',
					description:
						'Bug reporting kit for early engineering and product teams',
					hasPrice: true,
					price: '0',
					features: [
						{
							icon: 'Users',
							name: '3 members',
						},
						{
							icon: 'Github',
							name: 'GitHub integration',
						},
					],
					callToAction: {
						href: '/signup',
						text: 'Get started free',
					},
				},
				{
					variant: 'default',
					name: 'Team',
					description: 'For expanding teams with custom workflows',
					hasPrice: true,
					price: '16',
					features: [
						{
							icon: 'Check',
							name: 'Everything in Starter, plus:',
						},
						{
							icon: 'Users',
							name: 'Unlimited members',
						},
						{
							icon: 'Webhook',
							name: 'All integrations',
						},
						{
							icon: 'MessagesSquare',
							name: 'Private support channel',
						},
						{
							icon: 'Phone',
							name: 'CEOs phone number',
						},
					],
					callToAction: {
						href: '/signup',
						text: 'Get started',
					},
				},
				{
					variant: 'secondary',
					name: 'Enterprise',
					description: 'For companies with advanced needs',
					hasPrice: false,
					title: 'Custom',
					features: [
						{
							icon: 'Check',
							name: 'Everything in Team, plus:',
						},
						{
							icon: 'Lock',
							name: 'SAML and SSO',
						},
						{
							icon: 'HelpingHand',
							name: 'Custom SLA',
						},
						{
							icon: 'Milestone',
							name: 'Custom onboarding',
						},
					],
					callToAction: {
						href: '/signup',
						text: 'Get started',
					},
				},
			]}
		/>
	);
}
