import { zIndex } from '#utils/z-index.ts';
import { AnimatePresence, motion } from 'framer-motion';

export function Drawer({
	isOpen,
	onClose,
	children,
	title,
}: {
	isOpen: boolean;
	onClose: () => void;
	children: React.ReactNode;
	title: React.ReactNode;
}) {
	const drawerVariants = {
		open: { x: 0 },
		closed: { x: '200%' },
	};

	return (
		<>
			<AnimatePresence>
				{isOpen && (
					<motion.div
						animate={{ opacity: 0.1 }}
						initial={{ opacity: 0 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.3, ease: 'easeInOut' }}
						onClick={() => {
							onClose();
						}}
						style={{
							zIndex: zIndex.inboxDrawerPortal,
						}}
						className="fixed inset-0 bg-background pointer-events-auto"
					/>
				)}
			</AnimatePresence>

			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial="closed"
						animate="open"
						exit="closed"
						variants={drawerVariants}
						transition={{ duration: 0.2, ease: 'easeInOut' }}
						style={{
							zIndex: zIndex.inboxDrawer,
						}}
						className="fixed right-4 top-4 bottom-4 w-[30rem] bg-background border-solid border border-border border-left rounded-[5px] flex flex-col justify-start items-center"
					>
						<div className="z-10 fixed flex flex-row justify-start items-center w-full text-foreground px-4 border-b border-solid border-input h-16 gap-x-1.5 bg-background rounded-tr-[5px] rounded-tl-[5px]">
							{title}
						</div>
						<div className="overflow-y-auto flex flex-col justify-start items-center w-full pt-20 p-4 h-full">
							{children}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}
