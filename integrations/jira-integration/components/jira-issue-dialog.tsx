'use client';

import type { JiraContext } from '#types';
import { type CommentsContext, useComments } from '@-/comments';
import {
	Button,
	DialogBody,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	Input,
} from '@-/design-system/v1';
import type { JiraForm } from '@-/integrations';
import { getIntegrationPrompt } from '@-/integrations/shared';
import { ComboboxRow } from '@-/integrations/shared-components';
import {
	ArrowLeft,
	BadgeAlert,
	CaseSensitive,
	FolderKanban,
	Layers,
	Loader2,
	Tags,
	UserCircle,
} from 'lucide-react';
import { type Dispatch, type SetStateAction, useEffect, useState } from 'react';
import { JiraProjectIssueTypeCombobox } from './jira-issue-type-combobox.tsx';
import { JiraLabelsCombobox } from './jira-labels-combobox.tsx';
import { JiraParentIssueCombobox } from './jira-parent-issue-combobox.tsx';
import { JiraProjectCombobox } from './jira-project-combobox.tsx';
import { JiraUsersCombobox } from './jira-users-combobox.tsx';

export function JiraIssueDialogContent({
	commentsContext,
	jiraContext,
	editorText,
	jiraIssue,
	setJiraIssue,
	onSave,
	onBack,
}: {
	commentsContext: CommentsContext;
	jiraContext: JiraContext;
	editorText: string;
	jiraIssue: JiraForm | null;
	setJiraIssue: Dispatch<SetStateAction<JiraForm | null>>;
	onSave: () => void;
	onBack: () => void;
}) {
	const [isLoading, setIsLoading] = useState(false);
	const {
		title,
		setTitle,
		project,
		issueType,
		assignee,
		labels,
		parentIssue,
	} = jiraContext;
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
					Create Jira issue
				</DialogTitle>
			</DialogHeader>
			<DialogBody>
				<div className="flex flex-col justify-start items-start w-full last:border-none last:border-b-transparent">
					<ComboboxRow
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
						className="w-full flex md:flex-col flex-col justify-start items-start"
						isRequired={true}
					/>

					<ComboboxRow
						isPadded={false}
						title="Project"
						icon={<FolderKanban size={16} className="text-muted-foreground" />}
						combobox={<JiraProjectCombobox jiraContext={jiraContext} />}
						isRequired={true}
					/>

					{project !== null && (
						<>
							<ComboboxRow
								isPadded={false}
								title="Issue type"
								icon={
									<BadgeAlert size={16} className="text-muted-foreground" />
								}
								combobox={
									<JiraProjectIssueTypeCombobox
										jiraContext={jiraContext}
										projectId={project.id}
									/>
								}
								isRequired={true}
							/>
							{issueType && issueType.subtask && (
								<ComboboxRow
									isPadded={false}
									title="Parent issue"
									icon={<Layers size={16} className="text-muted-foreground" />}
									combobox={
										<JiraParentIssueCombobox
											jiraContext={jiraContext}
											projectId={project.id}
										/>
									}
									isRequired={true}
								/>
							)}
							<ComboboxRow
								isPadded={false}
								title="Labels"
								icon={<Tags size={16} className="text-muted-foreground" />}
								combobox={<JiraLabelsCombobox jiraContext={jiraContext} />}
							/>
						</>
					)}
					<ComboboxRow
						isPadded={false}
						title="Assignee"
						icon={<UserCircle size={16} className="text-muted-foreground" />}
						combobox={<JiraUsersCombobox jiraContext={jiraContext} />}
					/>
				</div>
			</DialogBody>

			<DialogFooter className="gap-x-2">
				{jiraIssue && (
					<Button
						onClick={() => {
							setJiraIssue(null);
							onSave();
						}}
						variant="outline"
					>
						Remove
					</Button>
				)}
				<Button
					disabled={!project || !issueType ||
						(issueType.subtask && !parentIssue)}
					onClick={() => {
						setJiraIssue({
							title,
							assignee,
							labels,
							issueType,
							project,
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
