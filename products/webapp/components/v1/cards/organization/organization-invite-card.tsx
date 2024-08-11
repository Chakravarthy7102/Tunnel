import { DashboardCard } from '#components/v1/cards/card.tsx';
import { useRouteContext } from '#utils/route-context.ts';
import { trpc } from '#utils/trpc.ts';
import { Button, Input, Switch } from '@-/design-system/v1';
import { toast } from '@-/tunnel-error';
import { ApiUrl } from '@-/url/api';
import { init } from '@paralleldrive/cuid2';
import { Check, Clipboard } from 'lucide-react';
import { DateTime } from 'luxon';
import { useState } from 'react';

export function OrganizationInviteCard() {
	const { actorUser } = useRouteContext('(webapp)/(logged-in)');
	const { organization } = useRouteContext(
		'(webapp)/(logged-in)/[organization-slug]/(members)',
	);
	const mutateUpdateOrganization = trpc.organization.update.useMutation();

	const [enabled, setEnabled] = useState(Boolean(organization.invite));

	const inviteUrl = ApiUrl.getWebappUrl({
		fromWindow: true,
		withScheme: true,
		path: `/invite/${organization.invite?.id ?? ''}`,
	});

	const generateLink = async () => {
		const createInviteId = init({
			random: Math.random,
			length: 12,
		});

		(await mutateUpdateOrganization.mutateAsync({
			actor: {
				type: 'User',
				data: { id: actorUser._id },
			},
			organization: {
				id: organization._id,
			},
			updates: {
				invite: {
					id: createInviteId(),
					createdAt: DateTime.now().toSeconds(),
				},
			},
		})).unwrapOrThrow();
	};

	const disableLink = async () => {
		(await mutateUpdateOrganization.mutateAsync({
			actor: {
				type: 'User',
				data: { id: actorUser._id },
			},
			organization: {
				id: organization._id,
			},
			updates: {
				invite: null,
			},
		})).unwrapOrThrow();
	};

	return (
		<DashboardCard
			title="Invite by link"
			subtitle="Allow anyone to join your organization by sharing this link"
			toggle={
				<Switch
					checked={enabled}
					onCheckedChange={async (checked) => {
						setEnabled(checked);

						if (checked) {
							return generateLink();
						} else {
							await disableLink();
						}
					}}
				/>
			}
		>
			{organization.invite &&
				(
					<>
						<div className="flex items-center w-full gap-x-2">
							<Input
								value={inviteUrl}
								readOnly
							/>
							<Copy
								text={inviteUrl}
							/>
						</div>
					</>
				)}
		</DashboardCard>
	);
}

function Copy({
	text,
}: {
	text: string;
}) {
	const [isClicked, setIsClicked] = useState(false);

	return (
		<Button
			variant="muratsecondary"
			size="icon"
			className="h-9 w-9 p-0"
			onClick={async () => {
				setIsClicked(true);
				await navigator.clipboard.writeText(text);
				toast.COPY_CLIPBOARD_SUCCESS();
				setTimeout(() => {
					setIsClicked(false);
				}, 2000);
			}}
		>
			{isClicked ?
				<Check color="#22c55e" size={14} /> :
				<Clipboard size={14} />}
		</Button>
	);
}
