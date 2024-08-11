import type {
	FilterKey,
	NormalizedFilterChoice,
} from '@-/project-comment-thread';
import { OrderedMap } from 'js-sdsl';

const createChoiceMap = () => new OrderedMap<string, NormalizedFilterChoice>();

export function createJiraFilterChoicesMaps() {
	return {
		oneOfJiraIssueAssigneeAccountIds: createChoiceMap(),
		oneOfJiraIssueKeys: createChoiceMap(),
		oneOfJiraIssueTypeIds: createChoiceMap(),
		oneOfJiraIssueProjectIds: createChoiceMap(),
		allOfJiraLabels: createChoiceMap(),
	} satisfies {
		[$FilterKey in FilterKey]?: unknown;
	};
}
