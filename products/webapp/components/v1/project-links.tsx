import type {
	DocBase,
	ServerDoc,
} from '@-/database';
import type {
	Organization_$dashboardPageData,
	OrganizationMember_$actorProfileData,
	Project_$dashboardPageData,
	User_$profileData,
} from '@-/database/selections';
import {
	Badge,
	buttonVariants,
	cn,
} from '@-/design-system/v1';
import Link from 'next/link';
import type { Dispatch, SetStateAction } from 'react';
import { CreateProjectButton } from './create-project-button.tsx';
import { StatusIndicator } from './status-indicator.tsx';

export function ProjectLinks({
	projects,
	actorUser,
	organization,
	setProjects,
	actorOrganizationMember,
}: {
	projects: ServerDoc<typeof Project_$dashboardPageData>[];
	actorUser: ServerDoc<typeof User_$profileData>;
	organization: ServerDoc<typeof Organization_$dashboardPageData>;
	setProjects: Dispatch<
		SetStateAction<ServerDoc<typeof Project_$dashboardPageData>[]>
	>;
	actorOrganizationMember:
		| ServerDoc<typeof OrganizationMember_$actorProfileData>
		| null;
}) {
	return (
		<div className="flex flex-col justify-center items-start w-full">
			{projects.length > 0 ?
				(
					<div className="flex flex-col justify-center items-center w-full gap-y-8">
						<div className="flex flex-col justify-center items-center w-full">
							{projects.map((project) => {
								const unresolvedComments = project.commentThreads.filter(
									(commentThread) => commentThread.resolvedByUser === null,
								);

								const resolvedComments = project.commentThreads.length -
									unresolvedComments.length;

								return (
									<Link
										key={project._id}
										href={`/${organization.slug}/projects/${project.slug}`}
										className="w-full border border-input hover:border-blue-500 last:border-b-input border-b-transparent border-solid transition-all bg-[#262626] first:rounded-t-[5px] last:rounded-b-[5px] p-3 flex flex-row justify-between items-center"
									>
										<div className="flex flex-row justify-start items-center gap-3">
											<div className="flex flex-row justify-center items-center gap-2">
												<p className="text-sm ">{project.name}</p>
											</div>
										</div>
										<div
											className="flex flex-row-reverse items-center justify-start gap-2"
											onClick={(e) => {
												e.preventDefault();
											}}
										>
											<Badge size="md" className="gap-x-2">
												{project.livePreviews.length}{' '}
												{project.livePreviews.length === 1 ?
													'preview' :
													'previews'}
											</Badge>
											{project.commentThreads.length > 0 && (
												<Badge size="md">
													{unresolvedComments.length === 0 ?
														`All comments resolved` :
														`${unresolvedComments.length} unresolved`}
													<StatusIndicator
														width={22}
														total={project.commentThreads.length}
														value={unresolvedComments.length}
														completed={resolvedComments ===
															project.commentThreads.length}
														reversed
													/>
												</Badge>
											)}
										</div>
									</Link>
								);
							})}
						</div>
					</div>
				) :
				(
					<div className="flex flex-col justify-center items-center border border-dashed border-input bg-inherit py-6 px-2 gap-y-3 w-full rounded-md">
						<div className="flex flex-col justify-center items-center text-center gap-y-1">
							<p className="text-sm font-medium">No projects</p>
							<p className="text-sm text-muted-foreground">
								Projects help you organize tunnels and make collaborating
								easier.
							</p>
						</div>
						{actorOrganizationMember &&
							actorOrganizationMember.role !== 'guest' && (
							<CreateProjectButton
								actorUser={actorUser}
								organization={organization}
								setProjects={setProjects}
								actorOrganizationMember={actorOrganizationMember}
								variant={'outline'}
								size="sm"
							>
								New project
							</CreateProjectButton>
						)}
					</div>
				)}
		</div>
	);
}

function _ProjectLimit({
	organization,
}: {
	organization: DocBase<'Organization'>;
}) {
	return (
		<div className="flex flex-col justify-center items-center border border-dashed border-input bg-inherit py-6 px-2 gap-y-3 w-full rounded-md">
			<div className="flex flex-col justify-center items-center text-center gap-y-1">
				<p className="text-sm font-medium">
					You have reached the limit of projects for your plan.
				</p>
				<p className="text-sm text-muted-foreground">
					Upgrade your plan to create more projects.
				</p>
			</div>

			<Link
				className={cn(
					buttonVariants({
						variant: 'outline',
						size: 'sm',
					}),
				)}
				href={`/${organization.slug}/settings/billing`}
			>
				Upgrade
			</Link>
		</div>
	);
}
