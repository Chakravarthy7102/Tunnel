import { useComments } from '#hooks/comments.ts';
import type { CommentsContext } from '#types';
import { type ClientDoc, select } from '@-/client-doc';
import { clientId } from '@-/database';
import { getInclude } from '@-/database/selection-utils';
import {
	OrganizationMember_$actorProfileData,
	type ProjectComment_$commentsProviderData,
} from '@-/database/selections';
import {
	AspectRatio,
	Button,
	cn,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@-/design-system/v1';
import { getFileUrl } from '@-/file';
import { SlackIcon } from '@-/integrations/components';
import { toast } from '@-/tunnel-error';
import { UserAvatar } from '@-/user/components';
import { dayjs } from '@tunnel/dayjs';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import { ExpandableImage } from './expandable-image.tsx';
import { ReadTiptapEditor } from './tiptap/editor.tsx';

export function Comment({
	commentsContext,
	comment,
}: {
	commentsContext: CommentsContext;
	comment: ClientDoc<typeof ProjectComment_$commentsProviderData>;
	shouldRenderReadEditor: boolean;
}) {
	const { commentsState, deleteComment } = useComments(commentsContext);
	const actorOrganizationMember = select(
		commentsState,
		'OrganizationMember',
		commentsState.actorOrganizationMemberId,
		getInclude(OrganizationMember_$actorProfileData),
	);

	if (comment.authorUser === null) {
		return null;
	}

	const user = comment.authorUser;
	const profileImageUrl = comment.authorInformation?.displayProfileImageUrl ??
		user.profileImageUrl;

	return (
		<div className="w-full max-w-3xl flex flex-row justify-center items-start gap-x-3">
			<div className="flex flex-col justify-start items-center py-1">
				<div className="relative">
					<UserAvatar
						size="sm"
						profileImageUrl={profileImageUrl}
						name={comment.authorInformation?.displayName ??
							user.fullName}
					/>
					{comment.sentBySlack && (
						<SlackIcon size="xs" className="absolute -bottom-1 -right-1" />
					)}
				</div>
			</div>
			<div className="flex flex-col justify-start items-center w-full">
				<div className="flex flex-row justify-between items-center w-full gap-2">
					<div className="flex flex-row justify-center items-center gap-2">
						<p className="text-sm font-normal text-foreground line-clamp-1">
							{comment.authorInformation?.displayName ?? user.fullName}
						</p>
						<p className="text-sm font-light text-muted-foreground min-w-max">
							{dayjs(comment._creationTime).fromNow()}
						</p>
					</div>

					<div className="flex flex-row justify-center items-center h-full gap-2">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									size="xs"
									variant="ghost"
									data-testid="comment-more-button"
								>
									<MoreHorizontal size={14} className="text-foreground" />
								</Button>
							</DropdownMenuTrigger>

							<DropdownMenuContent
								container={commentsState.container}
								align="end"
								style={{
									zIndex: 1000,
								}}
							>
								{(user._id === commentsState.userActor.data.id) ||
										(actorOrganizationMember !== null &&
											(actorOrganizationMember.role !== 'member')) ?
									(
										<DropdownMenuItem
											onClick={async () => {
												const result = await deleteComment.server(
													deleteComment.action({ commentId: comment._id }),
													{ commentId: comment._id },
												);

												if (result.isErr()) {
													toast.procedureError(result);
												} else {
													toast.success('Successfully deleted comment');
												}
											}}
											danger
										>
											<Trash2 size={14} />
											Delete
										</DropdownMenuItem>
									) :
									null}
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
				<div className="flex flex-col justify-center items-center w-full gap-y-4 mt-1">
					<div className="text-left w-full">
						<ReadTiptapEditor
							commentsContext={commentsContext}
							className={cn(
								'text-left text-sm text-secondary-foreground font-light',
							)}
							content={comment.content}
						/>
					</div>
					{comment.files.length > 0 && (
						<div className="flex flex-row justify-start w-full gap-3 flex-wrap">
							{comment.files.map((file, i) => {
								return (
									<div
										key={clientId(file._id)}
										className="flex justify-center items-center relative"
									>
										<div className="w-36 border border-solid border-border rounded-[5px] overflow-hidden bg-background">
											<AspectRatio
												ratio={16 / 9}
												className="flex flex-col justify-center items-center"
											>
												<ExpandableImage
													commentsContext={commentsContext}
													src={getFileUrl(file)}
													type={file.type}
													className="object-cover"
												/>
											</AspectRatio>
										</div>
										<div className="absolute -top-2.5 -right-2.5 h-5 w-5 rounded-full bg-secondary border border-solid border-border flex justify-center items-center text-[10px] text-medium text-muted-foreground">
											<div className="flex">{i + 1}</div>
										</div>
									</div>
								);
							})}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
