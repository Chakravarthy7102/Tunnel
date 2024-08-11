import LayoutClient from './layout.client.tsx';

export default function Layout({ children }: React.PropsWithChildren<{}>) {
	return <LayoutClient>{children}</LayoutClient>;
}
