// We need to manually generate the CSS using a tailwind watch script because Next.js HMR for CSS doesn't work when the `@tailwind` @import directive is used in a CSS file
import '#generated/globals.css';
import { TrpcProvider } from '#utils/trpc-provider.tsx';
import { PosthogProvider } from '@-/analytics/components';
import { SonnerToaster, TooltipProvider } from '@-/design-system/v1';
import dynamic from 'next/dynamic';
import type { PropsWithChildren } from 'react';
import { Head } from '../head.tsx';
import { TunnelConvexProviderWithWorkos } from './convex-client-provider.tsx';

export const metadata = {
	title: 'Tunnel',
	description: 'Live collaboration URLs for localhost',
};

const PosthogPageView = dynamic(
	async () => import('../posthog-page-view.tsx'),
	{
		ssr: false,
	},
);

export default async function WebappLayout({ children }: PropsWithChildren) {
	return (
		<html>
			<Head />
			<PosthogProvider>
				<TrpcProvider>
					<body style={{ cursor: 'auto' }} className="font-sans">
						<PosthogPageView />
						<TunnelConvexProviderWithWorkos>
							<TooltipProvider delayDuration={300}>
								<SonnerToaster />
								{children}
							</TooltipProvider>
						</TunnelConvexProviderWithWorkos>
					</body>
				</TrpcProvider>
			</PosthogProvider>
		</html>
	);
}
