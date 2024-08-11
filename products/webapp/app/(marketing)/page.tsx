export const revalidate = 30;

import { WebappApiRedirect } from '#api-redirect';
import { CallToAction, CardGrid, Code, Hero } from '#sections/_sections.ts';
import { getUser } from '@workos-inc/authkit-nextjs';
import { redirect } from 'next/navigation';

export async function generateMetadata() {
	return {
		title: 'Tunnel - Bug reporting infrastructure for software comapanies',
		description:
			'Tunnel turns your entire organization into great bug reporters. Tunnel helps companies collect, organize, and resolve feedback with a single line of code.',
	};
}

export default async function LandingPage(
	{ shouldRedirectOnLoggedIn = true }: { shouldRedirectOnLoggedIn?: boolean },
) {
	const { user: workosUser } = await getUser();

	if (workosUser !== null && shouldRedirectOnLoggedIn) {
		redirect(
			await WebappApiRedirect.getHomeRedirectPath({
				actorUser: workosUser,
			}),
		);
	}

	return (
		<>
			<Hero
				eyebrow={{
					text: "See what's new in the changelog",
					href: '/changelog',
					external: false,
				}}
				title="Bug reporting infrastructure for software companies"
				subtitle="Tunnel helps organizations collect, organize, and resolve feedback with a single line of code."
				callsToAction={[
					{
						text: 'Get started',
						href: '/signup',
						external: true,
						variant: 'default',
					},
					{
						text: 'Read the docs',
						href: 'https://docs.tunnel.dev',
						external: true,
						variant: 'secondary',
					},
				]}
				thumbnail={{
					src: '/assets/images/demo-thumbnail.jpg',
					alt: 'The YouTube thumbnail for the latest Tunnel demo',
				}}
				videoUrl="https://www.youtube.com/watch?v=aOTRCoGhuz4"
			/>
			<Code
				title="Integrate in minutes"
				subtitle="Add Tunnel to your app in a single line of code"
				tabs={[
					{
						title: 'React',
						code: {
							language: 'jsx',
							code:
								`import { TunnelToolbar } from @tunnel/react;\n\nexport default function App() {\n  return (\n    <>\n      <h1>My App</h1>\n      <TunnelToolbar \n        projectId=YOUR_PROJECT_ID\n        branch=BRANCH_NAME\n      />\n    </>\n  );\n}`,
							fileName: 'App.tsx',
							githubLink: 'https://github.com/Tunnel-Labs/tunnel-vite-react',
						},
					},
					{
						title: 'Next.js (/app)',
						code: {
							language: 'jsx',
							code:
								`import { TunnelToolbar } from @tunnel/nextjs;\n\nexport default function RootLayout({ children }) {\n  return (\n    <html lang=en>\n      <body>\n        {children}\n        <TunnelToolbar \n          projectId=YOUR_PROJECT_ID \n          branch=BRANCH_NAME\n        />\n      </body>\n    </html>\n  );\n}`,
							fileName: 'layout.tsx',
							githubLink: 'https://github.com/Tunnel-Labs/tunnel-next',
						},
					},
					{
						title: 'Next.js (/pages)',
						code: {
							language: 'jsx',
							code:
								`import { TunnelToolbar } from @tunnel/nextjs;\n\nexport default function App({ Component, pageProps }) {\n  return (\n    <>\n      <Component {...pageProps} />\n      <TunnelToolbar \n        projectId=YOUR_PROJECT_ID \n        branch=BRANCH_NAME\n      />\n    </>\n  );\n}`,
							fileName: '_app.tsx',
							githubLink: 'https://github.com/Tunnel-Labs/tunnel-next',
						},
					},
					{
						title: 'Other frameworks',
						code: {
							language: 'html',
							code:
								`<script\n  src="https://tunnelapp.dev/__tunnel/script.js"\n  data-project-id="PROJECT_ID"\n></script>`,
							fileName: 'index.html',
							githubLink: 'https://github.com/Tunnel-Labs/tunnel-vite-vanilla',
						},
					},
				]}
			/>
			<CardGrid
				title="Collect feedback with built-in tools"
				subtitle="Reviewing your product with Tunnel feels like Figma or Google Docs."
				cards={[
					{
						icon: 'MessageCircle',
						title: 'Comments',
						description: 'Attach feedback directly to website elements',
						image: {
							src: '/assets/images/comment.png',
							alt: 'A screenshot of a comment on a website',
						},
						size: {
							width: '50%',
							height: 'md',
						},
					},
					{
						icon: 'MousePointerSquareDashed',
						title: 'Screenshots',
						description: 'Drag to screenshot elements to provide more context.',
						image: {
							src: '/assets/images/screenshot.png',
							alt: 'A screenshot of a screenshot on a website',
						},
						size: {
							width: '50%',
							height: 'md',
						},
					},
					{
						icon: 'ListTodo',
						title: 'Issue tracking',
						description:
							"Address feedback and resolve comments once they're done.",
						image: {
							src: '/assets/images/resolve-comment.png',
							alt: 'A screenshot of a screenshot on a website',
						},
						size: {
							width: '40%',
							height: 'sm',
						},
					},
					{
						icon: 'Code',
						title: 'Toolbar embed',
						description:
							"Embed feedback tools in your app, so they're always there when you need them.",
						image: {
							src: '/assets/images/toolbar.png',
							alt: 'A screenshot of a screenshot on a website',
						},
						size: {
							width: '60%',
							height: 'sm',
						},
					},
				]}
			/>
			<CardGrid
				title="Create custom workflows"
				subtitle="We integrate with all your tools so Tunnel works the way you do."
				cards={[
					{
						icon: 'Repeat',
						title: 'Synced threads',
						description: 'Threads two-way synced with Slack or Teams.',
						image: {
							src: '/assets/images/slack-broadcast.png',
							alt: 'A screenshot of Slack broadcast created by Tunnel',
						},
						size: {
							width: '40%',
							height: 'md',
						},
					},
					{
						icon: 'GitPullRequestClosed',
						title: 'Linked pull requests',
						description:
							'Link feedback to pull requests with comments that track resolved comments.',
						image: {
							src: '/assets/images/pr-status.png',
							alt: 'A screenshot of pull request comment created by Tunnel',
						},
						size: {
							width: '60%',
							height: 'md',
						},
					},
					{
						icon: 'Kanban',
						title: 'Template issues',
						description:
							'Create correspondign issues in Jira or Linear to assign tickets and track progress.',
						image: {
							src: '/assets/images/jira-template.png',
							alt: 'A screenshot of a Jira issue template',
						},
						size: {
							width: '60%',
							height: 'md',
						},
					},
					{
						icon: 'Webhook',
						title: 'And more',
						description:
							'More powerful integrations available now and in the works.',
						image: {
							src: '/assets/images/integrations.png',
							alt:
								'A graphic showing the logos of tools Tunnel integrates with',
						},
						size: {
							width: '40%',
							height: 'md',
						},
					},
				]}
			/>
			<CardGrid
				title="Debug with context"
				subtitle="Automatically capture all the information developers need."
				cards={[
					{
						icon: 'TerminalSquare',
						title: 'Console logs',
						description: 'Automatically capture a snapshot of the console.',
						image: {
							src: '/assets/images/console-logs.png',
							alt: 'A screenshot of console logs on Tunnel',
						},
						size: {
							width: '50%',
							height: 'sm',
						},
					},
					{
						icon: 'Network',
						title: 'Network logs',
						description: 'Automatically capture requests and responses.',
						image: {
							src: '/assets/images/network-logs.png',
							alt: 'A screenshot of network logs on Tunnel',
						},
						size: {
							width: '50%',
							height: 'sm',
						},
					},
				]}
				grid={[
					{
						icon: 'AppWindow',
						title: 'Browser',
						description:
							"Automatically capture the user's browser type and version.",
					},
					{
						icon: 'Laptop',
						title: 'Device',
						description:
							"Automatically capture the user's device type and operating system.",
					},
					{
						icon: 'GitPullRequestClosed',
						title: 'Git',
						description:
							'Link feedback to pull requests, branches, and commits.',
					},
				]}
			/>
			<CallToAction
				title="You deserve better feedback"
				subtitle="Turn your entire organization into great bug reporters in minutes."
				callsToAction={[
					{
						text: 'Get started',
						href: '/signup',
						external: true,
						variant: 'default',
					},
					{
						text: 'Schedule a demo',
						href: 'https://cal.com/thomas-dave/tunnel-onboarding',
						external: true,
						variant: 'secondary',
					},
				]}
			/>
		</>
	);
}
