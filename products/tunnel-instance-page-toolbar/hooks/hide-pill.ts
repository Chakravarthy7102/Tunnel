import type { PageToolbarContext } from '#types';
import { useOnceEffect } from '#utils/effect.ts';

export function useHidePill({ context }: { context: PageToolbarContext }) {
	useOnceEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			const { settings, isToolbarHidden } = context.store.getState();
			if (
				event.metaKey &&
				event.key === '.' &&
				!settings.disableHideTunnelOption
			) {
				context.store.setState({
					isShareDialogOpen: false,
					isInboxOpen: false,
					isMoreMenuOpen: false,
					isSettingsDialogOpen: false,
					isGithubDialogOpen: false,
					isPortDialogOpen: false,
				});

				context.store.setState({
					isToolbarHidden: !isToolbarHidden,
				});
			}
		};

		window.addEventListener('keydown', handleKeyDown);

		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	});
}
