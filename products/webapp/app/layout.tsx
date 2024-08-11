import { type PropsWithChildren } from 'react';

export const metadata = {
	/**
		@see https://stackoverflow.com/a/76217440/12581865
	*/
	// eslint-disable-next-line no-restricted-globals -- Guaranteed to be a valid URL
	metadataBase: new URL('https://tunnel.dev'),
};

export default async function RootLayout({ children }: PropsWithChildren) {
	return <>{children}</>;
}
