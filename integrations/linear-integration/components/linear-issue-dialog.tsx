'use client';

import type { LinearContext } from '#types';
import { type CommentsContext, useComments } from '@-/comments';
import {
	Button,
	DialogBody,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	Input,
} from '@-/design-system/v1';
import type { LinearForm } from '@-/integrations';
import { getIntegrationPrompt } from '@-/integrations/shared';
import { ComboboxRow } from '@-/integrations/shared-components';
import {
	ArrowLeft,
	BarChart,
	CaseSensitive,
	GaugeCircle,
	Grid2x2,
	Loader2,
	Tags,
	UserCircle,
	UserSquare,
} from 'lucide-react';
import { type Dispatch, type SetStateAction, useEffect, useState } from 'react';
import { LinearAssigneeCombobox } from './linear-assignee-combobox.tsx';
import { LinearLabelsCombobox } from './linear-labels-combobox.tsx';
import { LinearPriorityCombobox } from './linear-priority-combobox.tsx';
import { LinearProjectCombobox } from './linear-project-combobox.tsx';
import { LinearStatusCombobox } from './linear-status-combobox.tsx';
import { LinearTeamCombobox } from './linear-team-combobox.tsx';

export function LinearIssueDialogContent({
	linearContext,
	commentsContext,
	editorText,
	linearIssue,
	setLinearIssue,
	onSave,
	onBack,
}: {
	commentsContext: CommentsContext;
	linearContext: LinearContext;
	editorText: string;
	linearIssue: LinearForm | null;
	setLinearIssue: Dispatch<SetStateAction<LinearForm | null>>;
	onSave: () => void;
	onBack: () => void;
}) {
	const [isLoading, setIsLoading] = useState(false);

	const {
		title,
		setTitle,
		team,
		project,
		priority,
		assignee,
		status,
		labels,
	} = linearContext;
	const { generateIntegrationTitle } = useComments(commentsContext);

	useEffect(() => {
		if (title) {
			return;
		}

		const generateIssueTitle = async () => {
			setIsLoading(true);

			try {
				const generatedTitle = (await generateIntegrationTitle.mutateAsync({
					prompt: getIntegrationPrompt(editorText),
				})).unwrapOr(editorText);

				setTitle(generatedTitle);
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
					Create Linear issue
				</DialogTitle>
			</DialogHeader>
			<DialogBody>
				<div className="flex flex-col justify-start items-start w-full last:border-none last:border-b-transparent">
					<ComboboxRow
						className="flex md:flex-col flex-col md:items-start items-start"
						isPadded={false}
						title="Title"
						icon={<CaseSensitive size={16} className="text-muted-foreground" />}
						combobox={
							<div className="w-full flex justify-end items-center relative">
								<div className="absolute mr-2">
									{isLoading && <Loader2 size={16} className="animate-spin" />}
								</div>

								<Input
									className={isLoading ? 'pr-8' : ''}
									placeholder="Issue title"
									value={title ?? editorText}
									onChange={(e) => setTitle(e.target.value)}
									disabled={isLoading}
								/>
							</div>
						}
						isRequired={true}
					/>

					<ComboboxRow
						isPadded={false}
						title="Team"
						icon={<UserSquare size={14} className="text-muted-foreground" />}
						combobox={<LinearTeamCombobox linearContext={linearContext} />}
						isRequired={true}
					/>
					{team && (
						<>
							<ComboboxRow
								isPadded={false}
								title="Project"
								icon={<Grid2x2 size={14} className="text-muted-foreground" />}
								combobox={
									<LinearProjectCombobox linearContext={linearContext} />
								}
							/>
							<ComboboxRow
								isPadded={false}
								title="Status"
								icon={
									<GaugeCircle size={14} className="text-muted-foreground" />
								}
								combobox={
									<LinearStatusCombobox linearContext={linearContext} />
								}
							/>
							<ComboboxRow
								isPadded={false}
								title="Labels"
								icon={<Tags size={14} className="text-muted-foreground" />}
								combobox={
									<LinearLabelsCombobox linearContext={linearContext} />
								}
							/>
							<ComboboxRow
								isPadded={false}
								title="Assignee"
								icon={
									<UserCircle size={14} className="text-muted-foreground" />
								}
								combobox={
									<LinearAssigneeCombobox linearContext={linearContext} />
								}
							/>
						</>
					)}
					<ComboboxRow
						isPadded={false}
						title="Priority"
						icon={<BarChart size={14} className="text-muted-foreground" />}
						combobox={<LinearPriorityCombobox linearContext={linearContext} />}
					/>
				</div>
			</DialogBody>

			<DialogFooter className="gap-x-2">
				{linearIssue && (
					<Button
						onClick={() => {
							setLinearIssue(null);
							onSave();
						}}
						variant="outline"
					>
						Remove
					</Button>
				)}
				<Button
					disabled={!team}
					onClick={() => {
						setLinearIssue({
							title,
							team,
							project,
							priority,
							assignee,
							status,
							labels,
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
