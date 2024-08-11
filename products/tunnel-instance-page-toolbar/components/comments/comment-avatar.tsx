import type { PageToolbarContext } from '#types';
import { zIndex } from '#utils/z-index.ts';
import type { ClientDoc } from '@-/client-doc';
import { cn } from '@-/design-system/v1';
import { UserAvatar } from '@-/user/components';

export function CommentAvatar({
	user,
	isCursor = false,
	className,
}: {
	context: PageToolbarContext;
	user: ClientDoc<'User'>;
	isCursor?: boolean;
	className?: string;
}) {
	return (
		<UserAvatar
			size="sm"
			style={{
				zIndex: isCursor ?
					zIndex.commentCursorAvatar :
					zIndex.commentIconAvatar,
			}}
			className={cn(
				'h-6 w-6 bg-green-500 rounded-full',
				className,
			)}
			profileImageUrl={user.profileImageUrl}
			name={user.fullName}
		/>
	);
}
