import type { CreatePageToolbarContextArgs, PageToolbarContext } from '#types';
import { type PropsWithChildren } from 'react';
import { useContextStore } from './_.ts';
import { usePageToolbarContext } from './use.ts';

function WithContextInner(
	{ tunneledServiceEnvironmentData, Component }: PropsWithChildren<
		CreatePageToolbarContextArgs & {
			Component: React.ComponentType<{
				context: PageToolbarContext;
			}>;
		}
	>,
) {
	const context = usePageToolbarContext({
		tunneledServiceEnvironmentData,
	});
	const state = useContextStore(context);

	if (state.isLoading) {
		return null;
	}

	return <Component context={context} />;
}

export function WithContext({
	tunneledServiceEnvironmentData,
}: PropsWithChildren<CreatePageToolbarContextArgs>) {
	return (
		Component: React.ComponentType<{
			context: PageToolbarContext;
		}>,
	) =>
	() => {
		return (
			<WithContextInner
				Component={Component}
				tunneledServiceEnvironmentData={tunneledServiceEnvironmentData}
			/>
		);
	};
}
