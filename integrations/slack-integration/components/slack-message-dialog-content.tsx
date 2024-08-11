'use client';

import type { SlackContext } from '#types';
import {
	Button,
	DialogBody,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@-/design-system/v1';
import type { SlackForm } from '@-/integrations';
import { ComboboxRow } from '@-/integrations/shared-components';
import { ArrowLeft, GalleryHorizontalEnd } from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';
import { SlackChannelsCombobox } from './slack-channels-combobox.tsx';

export function SlackMessageDialogContent({
	slackContext,
	slackMessage,
	setSlackMessage,
	onSave,
	onBack,
}: {
	slackContext: SlackContext;
	slackMessage: SlackForm | null;
	setSlackMessage: Dispatch<SetStateAction<SlackForm | null>>;
	onSave: () => void;
	onBack: () => void;
}) {
	const { channel } = slackContext;

	return (
		<>
			<DialogHeader>
				<DialogTitle className="gap-x-3 flex flex-row justify-start items-center">
					<Button onClick={onBack} variant="outline" size="icon">
						<ArrowLeft size={14} />
					</Button>
					Create Slack message
				</DialogTitle>
			</DialogHeader>
			<DialogBody>
				<div className="flex flex-col justify-start items-start w-full last:border-none last:border-b-transparent">
					<ComboboxRow
						title="Channel"
						icon={
							<GalleryHorizontalEnd
								size={14}
								className="text-muted-foreground"
							/>
						}
						combobox={<SlackChannelsCombobox slackContext={slackContext} />}
						isRequired={true}
						isPadded={false}
					/>
				</div>
			</DialogBody>
			<DialogFooter className="gap-x-2">
				{slackMessage && (
					<Button
						onClick={() => {
							setSlackMessage(null);
							onSave();
						}}
						variant="outline"
					>
						Remove
					</Button>
				)}
				<Button
					disabled={!channel}
					onClick={() => {
						if (channel !== null) {
							setSlackMessage({
								channel,
							});
							onSave();
						}
					}}
					variant="blue"
				>
					Save
				</Button>
			</DialogFooter>
		</>
	);
}
