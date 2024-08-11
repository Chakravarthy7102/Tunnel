import type {
	FilterKey,
	NormalizedFilterChoice,
} from '@-/project-comment-thread';
import { OrderedMap } from 'js-sdsl';

const createChoiceMap = () =>
	new OrderedMap<string, Omit<NormalizedFilterChoice, 'id'>>();

export function createLinearFilterChoicesMaps() {
	return {
		oneOfLinearIssueTeamIds: createChoiceMap(),
		oneOfLinearIssueProjectIds: createChoiceMap(),
		oneOfLinearIssuePriorityLabels: createChoiceMap(),
		oneOfLinearIssueStatusIds: createChoiceMap(),
		oneOfLinearIssueAssigneeIds: createChoiceMap(),
		oneOfLinearIssueIdentifiers: createChoiceMap(),
		allOfLinearIssueLabelIds: createChoiceMap(),
	} satisfies {
		[$FilterKey in FilterKey]?: unknown;
	};
}
