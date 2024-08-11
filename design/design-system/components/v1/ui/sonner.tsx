'use client';

import { toast } from '@-/tunnel-error';
import { useEffect, useMemo } from 'react';
import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const SonnerToaster = ({ ...props }: ToasterProps) => {
	const urlParams = useMemo(() =>
		new URLSearchParams(
			typeof window === 'undefined' ? '' : window.location.search,
		), []);

	const toastKey = urlParams.get('toast');

	useEffect(() => {
		if (typeof toastKey === 'string') {
			let toastId: string | number;
			// @ts-expect-error: Might not exist in "toast"
			const toastFunction = toast[toastKey];
			if (toastFunction === undefined) {
				toastId = toast.error(toastKey);
			} else {
				toastId = toastFunction();
			}

			urlParams.delete('toast');

			const urlWithoutToast = window.location.protocol + '//' +
				window.location.host +
				window.location.pathname +
				(urlParams.toString() === '' ? '' : '?' + urlParams.toString());
			window.history.replaceState(
				{ path: urlWithoutToast },
				'',
				urlWithoutToast,
			);

			return () => {
				toast.dismiss(toastId);
			};
		}
	}, []);

	return (
		<Sonner
			className="toaster group"
			toastOptions={{
				classNames: {
					toast:
						'group toast group-[.toaster]:bg-secondary group-[.toaster]:text-foreground group-[.toaster]:border-input',
					description: 'group-[.toast]:text-muted-foreground',
					actionButton:
						'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
					cancelButton:
						'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
				},
			}}
			richColors
			duration={4000}
			{...props}
		/>
	);
};

export { SonnerToaster };
