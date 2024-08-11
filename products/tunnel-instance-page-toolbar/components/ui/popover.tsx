import { cn } from '@-/design-system/v1';
import { Popover, Transition } from '@headlessui/react';
import { Fragment, type PropsWithChildren } from 'react';

export function PopoverMenu({
	button,
	children,
	isButtonWrapped = true,
	isFullWidth = false,
	isRaised = false,
	position = 'right',
}: PropsWithChildren<{
	button: React.ReactNode;
	isButtonWrapped?: boolean;
	isFullWidth?: boolean;
	isRaised?: boolean;
	position?: 'right' | 'left';
}>) {
	return (
		<Popover
			className={cn(
				'relative',
				isFullWidth ? 'w-full' : 'w-auto',
				'text-white',
			)}
		>
			{isButtonWrapped ?
				(
					<Popover.Button
						className={cn(
							'gap-2 bg-[#111] hover:border-blue-500 text-sm font-medium border border-solid border-[#333] hover:shadow-none shadow-black/5 p-[6px] flex flex-row justify-start items-center rounded-[5px] w-full transition-all hover:bg-[#222]',
							isRaised && 'shadow-yeah',
						)}
					>
						{button}
					</Popover.Button>
				) :
				<Popover.Button>{button}</Popover.Button>}
			<Transition
				enter="transition duration-100 ease-in"
				enterFrom="transform opacity-0 scale-95"
				enterTo="transform opacity-100 scale-100"
				leave="transition duration-100 ease-in"
				leaveFrom="transform opacity-100 scale-100"
				leaveTo="transform opacity-0 scale-95"
				as={Fragment}
			>
				<Popover.Panel
					className={cn(
						'shadow-md bg-[#222] absolute z-10',
						position === 'right' ? 'right-0' : 'left-0',
						isFullWidth ? 'w-full' : 'w-auto',
						'p-1 top-10 shadow-white/5 border-solid border-[#333] border rounded-[5px] overflow-hidden min-w-[150px]',
					)}
				>
					{children}
				</Popover.Panel>
			</Transition>
		</Popover>
	);
}

export function PopoverMenuItem({
	children,
	onClick,
}: PropsWithChildren<{
	onClick?: () => void;
}>) {
	return (
		<button
			onClick={onClick}
			className="flex flex-row justify-start items-center p-2 rounded-[5px] hover:bg-[#333] border border-solid border-transparent hover:border-[#444] gap-2 w-full text-sm transition-all"
		>
			{children}
		</button>
	);
}
