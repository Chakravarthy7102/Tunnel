import {
	Avatar,
	AvatarFallback,
	AvatarImage,
	type AvatarProps,
} from '@-/design-system/v1';

export function OrganizationAvatar(
	{ profileImageUrl, name, ...avatarProps }: {
		profileImageUrl: string | null;
		name: string;
	} & AvatarProps,
) {
	return (
		<Avatar {...avatarProps}>
			{profileImageUrl !== null && (
				<AvatarImage
					src={profileImageUrl}
					alt={`${name}'s Avatar`}
				/>
			)}
			<AvatarFallback>
				{name[0]?.toUpperCase() ?? '🏢'}
			</AvatarFallback>
		</Avatar>
	);
}
