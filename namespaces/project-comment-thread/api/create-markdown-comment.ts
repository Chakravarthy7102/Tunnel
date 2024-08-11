import type { ServerDoc } from '@-/database';
import type {
	Project_$organizationAndCommentThreads,
} from '@-/database/selections';
import { outdent } from 'outdent';

// Creates the message for gitlab and github comments in markdown
export function ApiProjectCommentThread_createMarkdownMessage({
	projects,
	branchName,
	baseUrl,
}: {
	projects: ServerDoc<typeof Project_$organizationAndCommentThreads>[];
	branchName: string;
	baseUrl: string;
}) {
	let resolvedComments = 0;
	let unresolvedComments = 0;
	const timezone = { name: 'UTC', abbreviation: 'UTC' };

	const message = outdent`
				**The latest updates on your projects**. Learn more about [Tunnel ↗︎](https://tunnel.dev)
				| Project | Status | Link | Updated (${timezone.abbreviation}) |
				| :--- | :----- | :------ | :------ |
				${
		projects
			.map((project) => {
				const commentThreads = project.commentThreads.filter(
					(commentThread) =>
						commentThread.gitMetadata_?.branchName ===
							branchName,
				);

				let latestThread = commentThreads[0];
				let updatedAt = new Date().toLocaleString('en-US', {
					timeZone: timezone.name,
					month: 'short',
					day: 'numeric',
					year: 'numeric',
					hour: 'numeric',
					minute: 'numeric',
					hour12: true,
				});

				if (latestThread !== undefined) {
					for (const thread of commentThreads) {
						if (thread.updatedAt > latestThread.updatedAt) {
							latestThread = thread;
						}
					}

					updatedAt = new Date(latestThread.updatedAt).toLocaleString(
						'en-US',
						{
							timeZone: 'UTC',
							month: 'short',
							day: 'numeric',
							year: 'numeric',
							hour: 'numeric',
							minute: 'numeric',
							hour12: true,
						},
					);

					resolvedComments = commentThreads.filter(
						(thread) => thread.resolvedByUser,
					).length;

					unresolvedComments = commentThreads.length - resolvedComments;
				}

				return `| **${project.name}** | ${
					unresolvedComments === 0 ?
						'✅ Ready' :
						`💬 ${unresolvedComments} unresolved comments${
							resolvedComments !== 0 ?
								`<br />✅ ${resolvedComments} resolved comments` :
								''
						}`
				} | [Visit Dashboard](${baseUrl}/${project.organization.slug}/projects/${project.slug}) | ${updatedAt} |\n`;
			})
			.join('')
	}
			`;

	return { message, unresolvedComments, resolvedComments };
}
