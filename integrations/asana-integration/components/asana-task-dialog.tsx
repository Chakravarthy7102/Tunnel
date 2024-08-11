'use client';

import type { AsanaContext } from '#types';
import { type CommentsContext, useComments } from '@-/comments';
import {
	Button,
	DialogBody,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	Input,
} from '@-/design-system/v1';
import type { AsanaForm } from '@-/integrations';
import { getIntegrationPrompt } from '@-/integrations/shared';
import { ComboboxRow } from '@-/integrations/shared-components';
import {
	ArrowLeft,
	CaseSensitive,
	FolderKanban,
	GaugeCircle,
	Grid2x2,
	Loader2,
	Tags,
	UserCircle,
} from 'lucide-react';
import { type Dispatch, type SetStateAction, useEffect, useState } from 'react';
import { AsanaAssigneeCombobox } from './asana-assignee-combobox.tsx';
import { AsanaParentTaskCombobox } from './asana-parent-task-combobox.tsx';
import { AsanaProjectCombobox } from './asana-project-combobox.tsx';
import { AsanaSectionCombobox } from './asana-section-combobox.tsx';
import { AsanaTagsCombobox } from './asana-tags-combobox.tsx';

export function AsanaTaskDialogContent({
	asanaContext,
	commentsContext,
	editorText,
	asanaTask,
	setAsanaTask,
	onSave,
	onBack,
}: {
	asanaContext: AsanaContext;
	commentsContext: CommentsContext;
	editorText: string;
	asanaTask: AsanaForm | null;
	setAsanaTask: Dispatch<SetStateAction<AsanaForm | null>>;
	onSave: () => void;
	onBack: () => void;
}) {
	const [isLoading, setIsLoading] = useState(false);

	const {
		name,
		setName,
		project,
		section,
		assignee,
		tags,
	} = asanaContext;
	const { generateIntegrationTitle } = useComments(commentsContext);

	useEffect(() => {
		if (name) {
			return;
		}

		const generateIssueTitle = async () => {
			setIsLoading(true);

			try {
				const generatedTitle = (await generateIntegrationTitle.mutateAsync({
					prompt: getIntegrationPrompt(editorText),
				})).unwrapOr(editorText);

				setName(generatedTitle);
				setIsLoading(false);
			} catch {
				setIsLoading(true);
			}
		};

		void generateIssueTitle();
	}, []);

	return (
		<>
			<DialogHeader>
				<DialogTitle className="gap-x-3 flex flex-row justify-start items-center">
					<Button onClick={onBack} variant="outline" size="icon">
						<ArrowLeft size={14} />
					</Button>
					Create Asana task
				</DialogTitle>
			</DialogHeader>
			<DialogBody>
				<div className="flex flex-col justify-start items-start w-full last:border-none last:border-b-transparent">
					<ComboboxRow
						className="flex md:flex-col flex-col md:items-start items-start"
						isPadded={false}
						title="Name"
						icon={<CaseSensitive size={16} className="text-muted-foreground" />}
						combobox={
							<div className="w-full flex justify-end items-center relative">
								<div className="absolute mr-2">
									{isLoading && <Loader2 size={16} className="animate-spin" />}
								</div>

								<Input
									className={isLoading ? 'pr-8' : ''}
									placeholder="Task name"
									value={name ?? editorText}
									onChange={(e) => setName(e.target.value)}
									disabled={isLoading}
								/>
							</div>
						}
						isRequired={true}
					/>

					<ComboboxRow
						isPadded={false}
						title="Project"
						icon={<Grid2x2 size={14} className="text-muted-foreground" />}
						combobox={<AsanaProjectCombobox asanaContext={asanaContext} />}
						isRequired={true}
					/>

					{project && (
						<ComboboxRow
							isPadded={false}
							title="Section"
							icon={<GaugeCircle size={14} className="text-muted-foreground" />}
							combobox={<AsanaSectionCombobox asanaContext={asanaContext} />}
						/>
					)}

					<ComboboxRow
						isPadded={false}
						title="Assignee"
						icon={<UserCircle size={14} className="text-muted-foreground" />}
						combobox={<AsanaAssigneeCombobox asanaContext={asanaContext} />}
					/>

					<ComboboxRow
						isPadded={false}
						title="Tags"
						icon={<Tags size={14} className="text-muted-foreground" />}
						combobox={<AsanaTagsCombobox asanaContext={asanaContext} />}
					/>

					{project && (
						<ComboboxRow
							isPadded={false}
							title="Parent Task"
							icon={
								<FolderKanban size={16} className="text-muted-foreground" />
							}
							combobox={<AsanaParentTaskCombobox asanaContext={asanaContext} />}
						/>
					)}
				</div>
			</DialogBody>

			<DialogFooter className="gap-x-2">
				{asanaTask && (
					<Button
						onClick={() => {
							setAsanaTask(null);
							onSave();
						}}
						variant="outline"
					>
						Remove
					</Button>
				)}
				<Button
					disabled={!project}
					onClick={() => {
						setAsanaTask({
							name,
							project,
							section,
							assignee,
							tags,
							parentTask: null,
						});
						onSave();
					}}
					variant="blue"
				>
					Save
				</Button>
			</DialogFooter>
		</>
	);
}
