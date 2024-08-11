'use client';

import type { NonNullPreloaded } from '#types';
import type { api, ServerDoc } from '@-/database';
import type { OrganizationMember_$actorProfileData } from '@-/database/selections';
import { Button } from '@-/design-system/v1';
import { AnimatePresence, motion } from 'framer-motion';
import React, { type PropsWithChildren, useState } from 'react';
import { HiBars2 } from 'react-icons/hi2/index.js';
import { SideMenu } from './side-menu.tsx';

// Drawer animation variants
const drawerVariants = {
	open: { x: 0, left: 0 },
	closed: { x: '-100%', left: '-100%' },
};

export function DrawerMenu({
	actorOrganizationMember,
}: PropsWithChildren<{
	actorOrganizationMember:
		| NonNullPreloaded<
			typeof api.v.OrganizationMember_get_actorProfileData
		>
		| ServerDoc<typeof OrganizationMember_$actorProfileData>;
}>) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			<button
				className="md:hidden h-6 w-6 rounded-[5px] hover:bg-background flex justify-center items-center transition-all"
				onClick={() => setIsOpen(true)}
			>
				<HiBars2 />
			</button>

			<AnimatePresence>
				{isOpen && (
					<motion.div
						animate={{ opacity: 0.8 }}
						initial={{ opacity: 0 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.3, ease: 'easeInOut' }}
						onClick={() => setIsOpen(false)}
						className="fixed inset-0 z-10 bg-background pointer-events-auto opacity-80"
					>
					</motion.div>
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
						className="z-20 shadow-xl fixed w-full sm:w-[320px] sm:min-w-[320] top-0 bottom-0 h-full min-h-screen border-r-foreground/5 bg-secondary border-solid border-r flex flex-col justify-between"
					>
						<div className="flex flex-col justify-start items-center px-4 h-full">
							<div className="h-16 flex flex-row justify-start items-center w-full gap-x-2">
								<Button
									size="icon"
									variant="ghost"
									onClick={() => setIsOpen(false)}
								>
									<HiBars2 />
								</Button>
							</div>
							<SideMenu actorOrganizationMember={actorOrganizationMember} />
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}
