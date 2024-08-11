import { registerRouteMocks } from '#utils/route.ts';
import type { LinearIssue } from '@-/integrations';
import type { Page } from 'playwright';

export async function registerLinearPageMocks(page: Page) {
	const routeMockFunctions = await registerRouteMocks(page, {
		'https://tunnel.test/api/trpc/*': {
			'POST /linear.createIssue'(): LinearIssue {
				return {
					id: 'issueid',
					identifier: 'TUN-1',
					url: 'https://linear.app/tunnel-dev/issue/TUN-44/issue-title',
					project: { id: '', name: '' },
					assignee: { id: '', name: '' },
					priority: { label: '', priority: 0 },
					status: { id: '', name: '' },
					team: { id: '', name: '' },
					labels: [],
				};
			},
			'GET /linear.getTeams'(): Array<{ id: string; name: string }> {
				return [{
					id: '',
					name: 'My Team',
				}];
			},
		},
	});

	return { routeMockFunctions };
}
