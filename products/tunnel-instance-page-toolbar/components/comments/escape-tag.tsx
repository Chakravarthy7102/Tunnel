import type { PageToolbarContext } from '#types';
import { useContextStore } from '#utils/context/_.ts';
import { MessageCircle } from 'lucide-react';

export function EscapeTag({
	context,
}: {
	context: PageToolbarContext<{
		hasProject: true;
		actorType: 'User';
	}>;
}) {
	const state = useContextStore(context);
	return (
		<div className="fixed w-screen h-screen top-0 left-0 pointer-events-none z-[1000]">
			<div
				style={{
					transform: state.isCommentCursorVisible ?
						'translate(-50%, 0px)' :
						'translate(-50%, -110%)',
					opacity: state.isCommentCursorVisible ?
						1 :
						0,
					transition: 'transform 0.2s ease-in-out, opacity 0.2s ease-in-out',
					zIndex: 1000,
				}}
				className="absolute top-0 left-1/2 bg-neutral-700 border-x border-b border-solid border-[#ffffff10] rounded-b-md text-neutral-0 px-4 py-2 flex flex-row justify-center items-center gap-3 shadow-comment-shadow-primary"
			>
				<div className="flex flex-row justify-center items-center gap-2">
					<MessageCircle size={14} className="text-neutral-400" />
					<p className="text-sm font-medium ">Comment mode</p>
				</div>
				<div className="flex w-[1px] bg-accent h-6"></div>
				<div className="flex flex-row justify-center items-center gap-2 text-neutral-400 text-sm">
					<span className="border border-[#ffffff10] font-mono bg-neutral-500 border-solid rounded-md px-2 text-neutral-0 text-sm">
						esc
					</span>{' '}
					to exit
				</div>
			</div>
		</div>
	);
}
