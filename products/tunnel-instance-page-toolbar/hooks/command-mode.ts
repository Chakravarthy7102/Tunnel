import type { PageToolbarContext } from '#types';
import { useOnceEffect } from '#utils/effect.ts';

export function useCommandMode({ context }: { context: PageToolbarContext }) {
	useOnceEffect(() => {
		const keydownHandler = (e: KeyboardEvent) => {
			if (e.key === 'Meta') {
				context.store.setState({ isCommandModeOpen: true });
			}
		};

		const keyupHandler = (e: KeyboardEvent) => {
			if (e.key === 'Meta') {
				context.store.setState({ isCommandModeOpen: false });
			}
		};

		window.addEventListener('keydown', keydownHandler);
		window.addEventListener('keyup', keyupHandler);

		return () => {
			window.removeEventListener('keydown', keydownHandler);
			window.removeEventListener('keyup', keyupHandler);
		};
	});
}
