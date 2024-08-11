import { default as NextLink } from 'next/link';

export interface LinkProps
	extends React.AnchorHTMLAttributes<HTMLAnchorElement>
{
	href: string;
	external?: boolean;
}

export const Link = ({ external = false, children, ...props }: LinkProps) => (
	<>
		{external ?
			<a {...props}>{children}</a> :
			<NextLink {...props}>{children}</NextLink>}
	</>
);
