// We need to manually generate the CSS using a tailwind watch script because Next.js HMR for CSS doesn't work when the `@tailwind` @import directive is used in a CSS file
import '#generated/globals.css';
import { StaffTunnelToolbar } from '#components/staff-tunnel-toolbar.tsx';
import { Footer } from '#components/v1/marketing/footer.tsx';
import { Header } from '#components/v1/marketing/header.tsx';
import { PageContainer } from '#components/v1/marketing/ui/layout.tsx';
import { PosthogProvider } from '@-/analytics/components';
import { cn } from '@-/design-system/v1';
import { Inter } from 'next/font/google';
import type { PropsWithChildren } from 'react';
import { Head } from '../head.tsx';
import { PosthogPageView } from '../posthog-page-view.tsx';

const inter = Inter({
	subsets: ['latin'],
});

export default async function MarketingLayout({ children }: PropsWithChildren) {
	return (
		<html lang="en">
			<PosthogProvider>
				<Head />
				<body className={cn('bg-background text-foreground', inter.className)}>
					<PosthogPageView />
					<Header
						logo={{
							src: '/assets/images/tunnel.png',
							alt: 'The Tunnel logo',
						}}
						navigationItems={[
							{
								text: 'Pricing',
								href: '/pricing',
								external: false,
							},
							{
								text: 'Docs',
								href: 'https://docs.tunnel.dev',
								external: true,
							},
							{
								text: 'Changelog',
								href: '/changelog',
								external: false,
							},
						]}
						callsToAction={[
							{
								text: 'Log in',
								href: '/login',
								external: true,
								variant: 'link',
							},
							{
								text: 'Get started',
								href: '/signup',
								external: true,
								variant: 'default',
							},
						]}
					/>
					<PageContainer>
						<StaffTunnelToolbar />
						{children}
					</PageContainer>
					<Footer
						logo={{
							src: '/assets/images/tunnel.png',
							alt: 'The Tunnel logo',
						}}
						columns={[
							{
								title: 'Product',
								links: [
									{
										text: 'Changelog',
										href: '/changelog',
										external: false,
									},
									{
										text: 'Docs',
										href: 'https://docs.tunnel.dev',
										external: true,
									},
								],
							},
							{
								title: 'Resources',
								links: [
									{
										text: 'Terms of Service',
										href: '/terms-of-service',
										external: false,
									},
									{
										text: 'Privacy Policy',
										href: '/privacy-policy',
										external: false,
									},
								],
							},
						]}
					/>
				</body>
			</PosthogProvider>
		</html>
	);
}
