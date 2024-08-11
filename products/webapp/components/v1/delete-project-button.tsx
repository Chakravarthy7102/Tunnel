import { useDocumentBody } from '#utils/document.ts';
import { trpc } from '#utils/trpc.ts';
import type { ServerDoc } from '@-/database';
import type {
	Organization_$dashboardPageData,
	Project_$dashboardPageData,
	User_$profileData,
} from '@-/database/selections';
import {
	Button,
	type ButtonProps,
	Dialog,
	DialogBody,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	Input,
} from '@-/design-system/v1';
import { toast } from '@-/tunnel-error';
import { useRouter } from 'next/navigation';
import { type Dispatch, type SetStateAction, useState } from 'react';
import { useForm } from 'react-hook-form';

export function DeleteProjectButton({
	organization,
	setProjects,
	project,
	actorUser,
	...props
}: ButtonProps & {
	organization: ServerDoc<typeof Organization_$dashboardPageData>;
	setProjects: Dispatch<
		SetStateAction<ServerDoc<typeof Project_$dashboardPageData>[]>
	>;
	project: ServerDoc<typeof Project_$dashboardPageData>;
	actorUser: ServerDoc<typeof User_$profileData>;
}) {
	const [name, setName] = useState<string>('');
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isOpen, setIsOpen] = useState<boolean>(false);

	const deleteProject = trpc.project.delete.useMutation();

	const form = useForm();
	const router = useRouter();
	const documentBody = useDocumentBody();

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button {...props} />
			</DialogTrigger>

			<DialogContent container={documentBody}>
				<DialogHeader>
					<DialogTitle>Delete Project</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form className="w-full" onSubmit={(e) => e.preventDefault()}>
						<DialogBody>
							<FormField
								control={form.control}
								name="confirm-organization-name"
								render={({ field }) => (
									<FormItem className="w-full">
										<FormLabel className="select-none">
											To confirm, type "{project.name}" in the box below
										</FormLabel>

										<FormControl>
											<Input
												{...field}
												onChange={(e) => setName(e.target.value)}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
						</DialogBody>

						<DialogFooter>
							<Button
								className="mt-4"
								variant="destructive"
								disabled={name !== project.name}
								isLoading={isLoading}
								onClick={async () => {
									setIsLoading(true);
									const result = await deleteProject.mutateAsync(
										{
											project: {
												id: project._id,
											},
											actor: { type: 'User', data: { id: actorUser._id } },
										},
									);
									setIsLoading(false);
									if (result.isErr()) {
										toast.procedureError(result);
										return;
									}

									setProjects((projects) =>
										projects.filter((p) => p._id !== project._id)
									);
									toast.PROJECT_DELETE_SUCCESS(project.name);
									router.push(`/${organization.slug}/`);
								}}
							>
								Delete this project
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
