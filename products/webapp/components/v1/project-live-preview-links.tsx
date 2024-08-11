import type {
	DocBase,
	ServerDoc,
} from '@-/database';
import type { ProjectLivePreview_$linkData } from '@-/database/selections';
import { Badge } from '@-/design-system/v1';
import Link from 'next/link';
import { CreateTunnelButton } from './create-tunnel-button.tsx';
import { StatusIndicator } from './status-indicator.tsx';

export function ProjectLivePreviewLinks({
	projectLivePreviews,
}: {
	projectLivePreviews: Array<
		ServerDoc<
			typeof ProjectLivePreview_$linkData
		>
	>;
	organization: DocBase<'Organization'>;
	project: DocBase<'Project'>;
	actorUser: DocBase<'User'>;
}) {
	return (
		<div className="flex flex-col justify-center items-start w-full">
			{projectLivePreviews.length > 0 ?
				(
					<div className="flex flex-col justify-center items-center w-full">
						{projectLivePreviews.map((projectLivePreview) => {
							const commentThreads =
								projectLivePreview.linkedProjectCommentThreads;

							const unresolvedComments = commentThreads.filter(
								(commentThread) => commentThread.resolvedByUser !== null,
							);

							const resolvedComments = commentThreads.length -
								unresolvedComments.length;

							return (
								<Link
									key={projectLivePreview._id}
									href={`/${projectLivePreview.project.organization.slug}/projects/${projectLivePreview.project.slug}/previews/${projectLivePreview.slug}`}
									className="w-full border border-input hover:border-blue-500 border-b-transparent last:border-b-input  border-solid transition-all bg-[#262626] first:rounded-t-[5px] last:rounded-b-[5px] p-3 flex flex-row justify-between items-center"
								>
									<div className="flex flex-row justify-start items-center gap-3">
										<div className="flex flex-row justify-center items-center gap-2">
											<p className="text-sm">
												{projectLivePreview.url}
											</p>
										</div>
										<div className="sm:flex flex-row justify-center items-center hidden">
											{
												/* {users.map(
												(user, i) => {
													if (i < 4) {
														return (
															<UserAvatar
																key={user._id}
																profileImageUrl={user.profileImageUrl}
																name={user.fullName}
																className="first:m-0 ml-[-10px] border-2 border-solid border-inherit"
															/>
														);
													} else if (i === 4) {
														return (
															<div
																key="plus"
																className="flex flex-row justify-center items-center gap-2 rounded-full bg-pink-500 border-2 border-inherit border-solid w-8 h-8 ml-[-10px]"
															>
																<p className="text-sm text-background">
																	{users.length - 4}
																	+
																</p>
															</div>
														);
													} else {
														return null;
													}
												},
											)} */
											}
										</div>
									</div>

									<div
										className="flex flex-row-reverse items-center justify-start gap-2"
										onClick={(e) => {
											e.preventDefault();
										}}
									>
										{commentThreads.length > 0 && (
											<Badge size="md">
												{unresolvedComments.length}/{commentThreads.length}{' '}
												resolved
												<StatusIndicator
													width={22}
													total={commentThreads.length}
													value={unresolvedComments.length}
													completed={resolvedComments === commentThreads.length}
												/>
											</Badge>
										)}
									</div>
								</Link>
							);
						})}
					</div>
				) :
				(
					<div className="flex flex-col justify-center items-center border border-dashed border-input bg-inherit py-6 px-2 gap-y-3 w-full rounded-md">
						<div className="flex flex-col justify-center items-center text-center gap-y-1">
							<p className="text-sm font-medium">No previews</p>
							<p className="text-sm text-muted-foreground">
								Previews allow you to collaborate on applications with your
								entire team.
							</p>
						</div>
						<CreateTunnelButton variant="outline" size="sm">
							New live preview
						</CreateTunnelButton>
					</div>
				)}
		</div>
	);
}
