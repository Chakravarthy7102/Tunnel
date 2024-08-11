import { ToolbarButton } from '#components/toolbar/toolbar-button.tsx';
import type { PageToolbarContext } from '#types';
import { useContextStore } from '#utils/context/_.ts';
import { Share } from 'lucide-react';
import { ToolbarInboxButton } from './buttons/inbox.tsx';
import { More } from './buttons/more.tsx';

export function MoreActions({
	context,
}: {
	context: PageToolbarContext<{
		actorType: 'User';
		isOnline: true;
		hasProject: true;
	}>;
}) {
	const state = useContextStore(context);
	return (
		<>
			<ToolbarInboxButton context={context} />
			<ToolbarButton
				context={context}
				tooltipName="Share"
				icon={<Share size={16} />}
				onClick={() => {
					context.store.setState({ isShareDialogOpen: true });
				}}
				isSelected={state.isShareDialogOpen ?? false}
				disabled={state.isCountingDown}
			/>

			<More context={context} />
		</>
	);
}
