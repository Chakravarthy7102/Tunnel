'use client';

import { FullPageLoader } from '#components/v1/full-page-loader.tsx';
import { isPageInIframe, useEmbedPage } from '#utils/embed.ts';
import type { PropsWithChildren } from 'react';

export default function EmbedLayout({ children }: PropsWithChildren) {
	useEmbedPage();

	if (!isPageInIframe()) {
		return <FullPageLoader />;
	}

	return children;
}
