import { useDocumentBody } from '#utils/document.ts';
import { useRouteContext } from '#utils/route-context.ts';
import { trpc } from '#utils/trpc.ts';
import type { ServerDoc } from '@-/database';
import type { User_$profileData } from '@-/database/selections';
import {
	Button,
	Checkbox,
	cn,
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DropdownMenu,
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	Textarea,
	ToggleGroup,
	ToggleGroupItem,
} from '@-/design-system';
import { toast } from '@-/tunnel-error';
import { z } from '@-/zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Bell, BookOpen, Bug, HelpCircle, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

export function Sidebar({ children }: { children: React.ReactNode }) {
	const { actorUser } = useRouteContext('(webapp)/(logged-in)');

	return (
		<div className="relative flex flex-col h-full bg-[#18181B] w-[264px] min-w-[264px]">
			{children}
			<HelpMenu actorUser={actorUser} />
		</div>
	);
}

export function SidebarGroup(
	{ className, children, ...props }: React.HTMLProps<HTMLDivElement>,
) {
	return (
		<div
			className={cn('flex flex-col px-3 gap-y-1 mt-4', className)}
			{...props}
		>
			{children}
		</div>
	);
}

export function SidebarItemGroup(
	{ className, children, ...props }: React.HTMLProps<HTMLDivElement>,
) {
	return (
		<div className={cn('flex flex-col gap-y-0.5', className)} {...props}>
			{children}
		</div>
	);
}

export function SidebarItem({
	href,
	children,
	active = false,
}: {
	href: string;
	children: React.ReactNode;
	active?: boolean;
}) {
	return (
		<Link
			href={href}
			className={cn(
				'text-sm px-2 py-1.5 rounded-lg text-v2-soft-400 border border-transparent transition-colors hover:border-v2-soft-200 hover:bg-v2-neutral-600 hover:text-white hover:shadow-v2-button-important focus:border-v2-soft-200 focus:bg-v2-neutral-600 focus:text-white focus:outline-0',
				active &&
					'bg-v2-neutral-700 border-v2-soft-200 shadow-v2-button-important text-white',
				!active &&
					'',
				'w-full flex flex-row justify-start items-center gap-x-2',
			)}
		>
			{children}
		</Link>
	);
}

export function SidebarLabel({ children }: { children: React.ReactNode }) {
	return <p className="text-xs text-v2-sub-500 px-2">{children}</p>;
}

function HelpMenu(
	{ actorUser }: { actorUser: ServerDoc<typeof User_$profileData> },
) {
	const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
	const documentBody = useDocumentBody();

	return (
		<Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger asChild>
					<button className="absolute left-3 bottom-3 flex items-center justify-center h-6 w-6 text-sm rounded-full border border-v2-soft-200 bg-v2-neutral-800 text-v2-soft-400 hover:bg-[#1E1E21] transition-colors shadow-v2-button-important focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-v2-soft-200 focus:ring-offset-v2-neutral-900 select-none">
						?
					</button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content
					container={documentBody}
					align="start"
					className="w-[240px] min-w-[240px] mb-1"
				>
					<div className="flex flex-col gap-y-1 p-2">
						<p className="text-sm font-medium text-white">Need help?</p>
						<p className="text-xs text-v2-soft-400">
							Get help setting up and using Tunnel with your team.
						</p>
					</div>
					<DropdownMenu.Item asChild>
						<a href="https://docs.tunnel.dev" target="_blank">
							<BookOpen size={16} />
							Read the docs
						</a>
					</DropdownMenu.Item>
					<DialogTrigger asChild>
						<DropdownMenu.Item
							onSelect={() =>
								setIsContactDialogOpen(true)}
						>
							<Bell size={16} />
							Contact us
						</DropdownMenu.Item>
					</DialogTrigger>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
			<ContactForm
				actorUser={actorUser}
				setIsDialogOpen={setIsContactDialogOpen}
			/>
		</Dialog>
	);
}

function ContactForm(
	{ actorUser, setIsDialogOpen }: {
		actorUser: ServerDoc<typeof User_$profileData>;
		setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
	},
) {
	const ticketSchema = z.object({
		type: z.enum(['bug', 'feedback', 'question']).default('bug'),
		message: z.string().min(1, 'Describe the issue you are having'),
		isUrgent: z.boolean().default(false).optional(),
	});
	const form = useForm<z.infer<typeof ticketSchema>>({
		resolver: zodResolver(ticketSchema),
		defaultValues: {
			type: 'bug',
			message: '',
			isUrgent: false,
		},
	});

	const type = form.watch('type');

	const submitContactForm = trpc.support.submitContactForm.useMutation();
	async function onSubmit(values: z.infer<typeof ticketSchema>) {
		setIsDialogOpen(false);
		const result = await submitContactForm.mutateAsync({
			user: { id: actorUser._id },
			actor: { type: 'User', data: { id: actorUser._id } },
			submission: {
				type: values.type,
				message: values.message,
				isUrgent: values.isUrgent,
			},
		});

		if (result.isErr()) {
			toast.procedureError(result);
			return;
		}

		if (type === 'bug') {
			toast.success('Thanks for the bug report!');
		} else if (type === 'feedback') {
			toast.success('Thanks for the feedback!');
		} else {
			toast.success(
				'Thanks for the question!',
			);
		}

		form.reset();
	}

	return (
		<DialogContent className="sm:max-w-[512px]">
			<DialogHeader className="justify-between">
				<DialogTitle>
					{type === 'bug' ?
						'Report a bug' :
						type === 'feedback' ?
						'Send feedback' :
						'Ask a question'}
				</DialogTitle>
				<DialogClose />
			</DialogHeader>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<div className="flex flex-col items-start gap-y-4 p-4 bg-v2-neutral-7000">
						<FormField
							control={form.control}
							name="type"
							render={({ field }) => (
								<ToggleGroup
									type="single"
									value={field.value}
									onValueChange={field.onChange}
								>
									<ToggleGroupItem value="bug" size="sm">
										<Bug size={16} />Bug
									</ToggleGroupItem>
									<ToggleGroupItem value="feedback" size="sm">
										<MessageCircle size={16} />Feedback
									</ToggleGroupItem>
									<ToggleGroupItem value="question" size="sm">
										<HelpCircle size={16} />Question
									</ToggleGroupItem>
								</ToggleGroup>
							)}
						/>
						<FormField
							control={form.control}
							name="message"
							render={({ field }) => (
								<FormItem className="w-full">
									<FormLabel>
										{type === 'bug' ?
											'What happened?' :
											type === 'feedback' ?
											'How can we improve?' :
											'What do you want to know?'}
									</FormLabel>
									<FormControl>
										<Textarea
											{...field}
											placeholder={type === 'bug' ?
												'When I...' :
												type === 'feedback' ?
												'It would be great if...' :
												'Do you...'}
											rows={5}
											hasError={form.formState.errors.message !==
												undefined}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						{type === 'bug' && (
							<FormField
								control={form.control}
								name="isUrgent"
								render={({ field }) => (
									<FormItem className="items-top flex space-x-2 space-y-0">
										<Checkbox
											checked={field.value}
											onCheckedChange={field.onChange}
										/>
										<div className="grid gap-1.5 leading-none">
											<FormLabel>
												Is this urgent?
											</FormLabel>
											<p className="text-xs text-v2-soft-400">
												Check this if the bug is preventing you from using
												Tunnel
											</p>
										</div>
									</FormItem>
								)}
							/>
						)}
					</div>
					<DialogFooter className="sm:justify-between sm:items-center">
						<p className="text-xs text-v2-soft-400">
							You can also email us at{' '}
							<a
								href="mailto:support@tunnel.dev"
								className="text-neutral-300 hover:underline"
							>
								support@tunnel.dev
							</a>
						</p>
						<Button size="sm" type="submit">
							{type === 'bug' ?
								'Submit bug' :
								type === 'feedback' ?
								'Send feedback' :
								'Ask question'}
						</Button>
					</DialogFooter>
				</form>
			</Form>
		</DialogContent>
	);
}
