import type { FilterKey } from '@-/project-comment-thread';
import {
	BadgeAlert,
	FolderKanban,
	GaugeCircle,
	Grid2x2,
	Key,
	Tags,
	UserCircle,
} from 'lucide-react';
import type { ReactNode } from 'react';

export const filterMetadata: Record<
	FilterKey,
	{
		singular: string;
		plural: string;
		dropdownLabel: string;
		icon: ReactNode;
		canIncludeNull: boolean;
	}
> = {
	allOfJiraLabels: {
		singular: 'Jira Label',
		plural: 'labels',
		dropdownLabel: 'Label',
		icon: <Tags size={14} className="text-muted-foreground" />,
		canIncludeNull: false,
	},
	allOfLinearIssueLabelIds: {
		singular: 'Linear Label',
		plural: 'labels',
		dropdownLabel: 'Label',
		icon: <Tags size={14} className="text-muted-foreground" />,
		canIncludeNull: false,
	},
	oneOfAuthorUserIds: {
		singular: 'Author',
		plural: 'users',
		dropdownLabel: 'Author',
		icon: <UserCircle size={14} className="text-muted-foreground" />,
		canIncludeNull: false,
	},
	oneOfJiraIssueAssigneeAccountIds: {
		singular: 'Jira Assignee',
		plural: 'assignees',
		dropdownLabel: 'Assignee',
		icon: <UserCircle size={14} className="text-muted-foreground" />,
		canIncludeNull: true,
	},
	oneOfJiraIssueKeys: {
		plural: 'keys',
		singular: 'Jira Key',
		dropdownLabel: 'Key',
		icon: <Key size={14} className="text-muted-foreground" />,
		canIncludeNull: false,
	},
	oneOfJiraIssueProjectIds: {
		plural: 'projects',
		singular: 'Jira Project',
		dropdownLabel: 'Project',
		icon: <FolderKanban size={14} className="text-muted-foreground" />,
		canIncludeNull: true,
	},
	oneOfJiraIssueTypeIds: {
		plural: 'issue types',
		singular: 'Jira Issue Type',
		dropdownLabel: 'Issue Type',
		icon: <BadgeAlert size={14} className="text-muted-foreground" />,
		canIncludeNull: true,
	},
	oneOfLinearIssueAssigneeIds: {
		plural: 'assignees',
		singular: 'Linear Assignee',
		dropdownLabel: 'Assignee',
		icon: <UserCircle size={14} className="text-muted-foreground" />,
		canIncludeNull: true,
	},
	oneOfLinearIssueIdentifiers: {
		plural: 'identifiers',
		singular: 'Linear Identifier',
		dropdownLabel: 'Identifier',
		icon: <Key size={14} className="text-muted-foreground" />,
		canIncludeNull: false,
	},
	oneOfLinearIssuePriorityLabels: {
		plural: 'priorities',
		singular: 'Linear Priority',
		dropdownLabel: 'Priority',
		icon: <Tags size={14} className="text-muted-foreground" />,
		canIncludeNull: true,
	},
	oneOfLinearIssueProjectIds: {
		plural: 'projects',
		singular: 'Linear Project',
		dropdownLabel: 'Project',
		icon: <Grid2x2 size={14} className="text-muted-foreground" />,
		canIncludeNull: true,
	},
	oneOfLinearIssueStatusIds: {
		plural: 'statuses',
		singular: 'Linear Status',
		dropdownLabel: 'Status',
		icon: <GaugeCircle size={14} className="text-muted-foreground" />,
		canIncludeNull: false,
	},
	oneOfLinearIssueTeamIds: {
		plural: 'teams',
		singular: 'Linear Team',
		dropdownLabel: 'Team',
		icon: <Tags size={14} className="text-muted-foreground" />,
		canIncludeNull: false,
	},
	oneOfProjectIds: {
		plural: 'projects',
		singular: 'Project',
		dropdownLabel: 'Project',
		icon: <FolderKanban size={14} className="text-muted-foreground" />,
		canIncludeNull: false,
	},
	oneOfStatus: {
		plural: 'status',
		singular: 'status',
		dropdownLabel: 'Status',
		icon: <BadgeAlert size={14} className="text-muted-foreground" />,
		canIncludeNull: false,
	},
};
