import { Avatar } from '#components/avatar.tsx';
import type { PageToolbarContext } from '#types';
import { useContextStore } from '#utils/context/_.ts';
import { select } from '@-/client-doc';
import { getInclude } from '@-/database/selection-utils';
import { User_$profileData } from '@-/database/selections';
import { cn } from '@-/design-system/v1';
import { useMembers } from '@ably/spaces/react';
import uniqueBy from 'uniqbye';

export function ActiveUsers({
	context,
}: {
	context: PageToolbarContext<{
		actorType: 'User';
		hasProject: true;
		hasProjectLivePreview: true;
	}>;
}) {
	const state = useContextStore(context);
	const { members } = useMembers();
	const actorUser = select(
		state,
		'User',
		state.actor.data.id,
		getInclude(User_$profileData),
	);

	return (
		<div className={cn('flex justify-center items-center', 'flex-row px-1')}>
			{uniqueBy(
				[...members, {
					connectionId: '',
					profileData: actorUser,
				}],
				(member) => (member.profileData?._id),
			).map((member) => (
				<Avatar
					context={context}
					key={member.connectionId}
					user={member.profileData as any}
					isOutlined
					isVertical={state.toolbar.obs[state.toolbar.pos].flexDirection ===
						'column'}
					hasTooltip
				/>
			))}
		</div>
	);
}
