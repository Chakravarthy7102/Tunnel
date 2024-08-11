import type { PageToolbarContext } from '#types';
import { useContextStore } from '#utils/context/_.ts';
import { useShadowRootElement } from '#utils/shadow-root.ts';
import type { ClientDoc } from '@-/client-doc';
import {
	cn,
	Tooltip,
	TooltipContent,
	TooltipPortal,
	TooltipTrigger,
} from '@-/design-system/v1';
import uniqolor from 'uniqolor';

export function Avatar({
	context,
	user,
	isOutlined,
	size = 'small',
	isVertical,
	hasTooltip = false,
	authorInformation,
}: {
	context: PageToolbarContext;
	user: ClientDoc<'User'>;
	isOutlined: boolean;
	size?: 'small' | 'large' | 'extra-small';
	isVertical?: boolean;
	hasTooltip?: boolean;
	authorInformation?: {
		displayName: string;
		displayProfileImageUrl: string;
	} | null;
}) {
	const state = useContextStore(context);
	const { color } = uniqolor(user._id);

	let width = 24;
	if (size === 'extra-small') {
		width = 16;
	} else if (size === 'large') {
		width = 32;
	}

	const shadowRootElement = useShadowRootElement();
	const isBot = user.username === 'tunnel-bot';

	let userProfileImage = user.profileImageUrl;
	if (isBot && authorInformation?.displayProfileImageUrl) {
		userProfileImage = authorInformation.displayProfileImageUrl;
	}

	if (hasTooltip) {
		return (
			<Tooltip delayDuration={200} disableHoverableContent={!hasTooltip}>
				<TooltipTrigger asChild disabled={!hasTooltip}>
					<img
						style={{
							borderColor: color,
							borderWidth: isOutlined ? '2px' : '0px',
							width: `${width}px`,
							height: `${width}px`,
							minWidth: `${width}px`,
						}}
						src={userProfileImage ?? undefined}
						className={cn(
							'rounded-full border border-solid',
							isVertical ? 'first:mt-0 mt-[-8px]' : 'first:ml-0 ml-[-8px]',
						)}
						draggable={false}
					/>
				</TooltipTrigger>
				<TooltipPortal container={shadowRootElement}>
					<TooltipContent
						sideOffset={16}
						side={state.toolbar.pos === 'top-center' ?
							'bottom' :
							state.toolbar.pos === 'bottom-center' ?
							'top' :
							state.toolbar.pos === 'center-left' ?
							'right' :
							'left'}
					>
						<p className="text-sm font-medium">
							{isBot ? authorInformation?.displayName : user.fullName}
						</p>
					</TooltipContent>
				</TooltipPortal>
			</Tooltip>
		);
	} else {
		return (
			<img
				style={{
					borderColor: color,
					borderWidth: isOutlined ? '2px' : '0px',
					width: `${width}px`,
					height: `${width}px`,
				}}
				src={isBot ?
					authorInformation?.displayProfileImageUrl :
					user.profileImageUrl ?? undefined}
				className={cn(
					'rounded-full border border-solid',
					isVertical ? 'first:mt-0 mt-[-8px]' : 'first:ml-0 ml-[-8px]',
				)}
				draggable={false}
			/>
		);
	}
}
