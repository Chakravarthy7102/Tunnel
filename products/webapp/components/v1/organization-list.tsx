'use client';

import { useDocumentBody } from '#utils/document.ts';
import type { ServerDoc } from '@-/database';
import type { Organization_$memberProfileData } from '@-/database/selections';
import {
	Avatar,
	AvatarImage,
	buttonVariants,
	cn,
	Select,
	SelectContent,
	SelectItem,
	SelectTriggerUnstyled,
} from '@-/design-system/v1';
import { ChevronsUpDown } from 'lucide-react';

export function OrganizationList(
	{ organizations, organization, setOrganization }: {
		organizations: ServerDoc<typeof Organization_$memberProfileData>[];
		organization: ServerDoc<typeof Organization_$memberProfileData> | undefined;
		setOrganization: (
			organization: ServerDoc<typeof Organization_$memberProfileData>,
		) => void;
	},
) {
	const documentBody = useDocumentBody();

	return (
		<Select
			value={organization?._id}
			onValueChange={(newValue) => {
				const newOrganization = organizations.find((org) =>
					org._id === newValue
				);
				if (newOrganization) {
					setOrganization(newOrganization);
				}
			}}
		>
			<SelectTriggerUnstyled
				className={cn(buttonVariants({
					className:
						'w-full justify-between flex flex-row group px-2 text-muted-foreground gap-x-2',
					variant: 'ghost',
					size: 'sm',
				}))}
			>
				<Avatar size={'sm'}>
					{organization?.profileImageUrl && (
						<AvatarImage src={organization.profileImageUrl} />
					)}
				</Avatar>
				<p className="text-sm font-medium">
					{organization ? organization.name : 'Switch organizations'}
				</p>
				<ChevronsUpDown size={12} className="text-muted-foreground" />
			</SelectTriggerUnstyled>

			<SelectContent align="end" container={documentBody}>
				{organizations.map((org) => (
					<SelectItem
						key={org._id}
						onClick={() => setOrganization(org)}
						className="flex flex-row justify-start items-center"
						value={org._id}
					>
						<div className="flex flex-row justify-start items-center gap-x-2">
							<Avatar size="sm">
								{org.profileImageUrl !== null && (
									<AvatarImage src={org.profileImageUrl} />
								)}
							</Avatar>
							{org.name}
						</div>
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
