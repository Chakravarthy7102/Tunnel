import { ToolbarButton } from '#components/toolbar/toolbar-button.tsx';
import type { PageToolbarContext } from '#types';
import { useContextStore } from '#utils/context/use.ts';
import { Inbox } from 'lucide-react';

export function ToolbarInboxButton({
	context,
}: {
	context: PageToolbarContext<{
		actorType: 'User';
		hasProject: true;
		isOnline: true;
	}>;
}) {
	const state = useContextStore(context);
	return (
		<ToolbarButton
			context={context}
			tooltipName="Inbox"
			isSelected={state.isInboxOpen}
			disabled={state.isCountingDown}
			onClick={async () => {
				if (state.isInboxOpen) {
					context.store.setState({ isInboxOpen: false });
				} else {
					context.store.setState({ isInboxOpen: true });
				}
			}}
			icon={
				<div className="relative">
					<Inbox size={16} />
					{/* <div className="w-2 h-2 bg-blue-500 rounded-full absolute top-0 right-0 border border-solid border-[#333]"></div> */}
				</div>
			}
		/>
	);
}
