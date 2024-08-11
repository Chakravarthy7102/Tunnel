'use client';

import { trpc } from '#utils/trpc.ts';
import {
	Alert,
	AlertTitle,
	Button,
	Form,
	FormControl,
	FormField,
	FormFieldGroup,
	FormItem,
	FormLabel,
	FormMessage,
	Google,
	Input,
	Separator,
} from '@-/design-system';
import { z } from '@-/zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { SiGithub } from '@icons-pack/react-simple-icons';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import zxcvbn from 'zxcvbn';
import { Card } from '../card.tsx';

export default function SignupClientPage({
	githubOauthUrl,
	googleOauthUrl,
	next,
}: {
	githubOauthUrl: string;
	googleOauthUrl: string;
	next: string | null;
}) {
	const signUpWithEmailPassword = trpc.auth.signUpWithEmailPassword
		.useMutation();

	const signupSchema = z.object({
		email: z.string().email('Please enter a valid email address.'),
		password: z.string().min(10, 'Must be at least 10 characters.').refine(
			(val) => zxcvbn(val).score >= 3,
			'Password is too weak.',
		),
		confirmPassword: z.string(),
	}).refine(({ password, confirmPassword }) => confirmPassword === password, {
		path: ['confirmPassword'],
		message: 'Passwords do not match',
	});
	const form = useForm<z.infer<typeof signupSchema>>({
		resolver: zodResolver(signupSchema),
		defaultValues: {
			email: '',
			password: '',
			confirmPassword: '',
		},
	});

	const onSubmit = async (
		{ email, password }: z.infer<typeof signupSchema>,
	) => {
		const result = await signUpWithEmailPassword.mutateAsync({
			email,
			password,
		});
		if (result.isOk()) {
			if ('wosSessionString' in result.value) {
				window.location.href = `/home?wos-session=${
					encodeURIComponent(result.value.wosSessionString)
				}${next === null ? '' : `&next=${encodeURIComponent(next)}`}`;
			} else {
				const { pendingAuthenticationToken, workosUserId } = result.value;
				window.location.href =
					`/verify-email?pending-authentication-token=${pendingAuthenticationToken}&workos-user-id=${workosUserId}`;
			}
		} else {
			form.setError('root', { message: result.error.message });
		}
	};

	return (
		<Card title="Sign up for Tunnel" showDisclaimer>
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="w-full flex flex-col justify-center items-center gap-y-6"
				>
					<div className="w-full flex flex-row justify-start items-center gap-x-3">
						<Button variant="secondary" className="flex-grow" asChild>
							<a href={googleOauthUrl}>
								<Google width={20} height={20} />
							</a>
						</Button>
						<Button variant="secondary" className="flex-grow" asChild>
							<a href={githubOauthUrl}>
								<SiGithub size={20} />
							</a>
						</Button>
					</div>
					<div className="w-full flex flex-row justify-between items-center gap-x-2">
						<Separator className="shrink" />
						<p className="text-xs text-v2-soft-400 px-1">OR</p>
						<Separator className="shrink" />
					</div>
					<FormFieldGroup>
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem className="w-full">
									<FormLabel>
										Email
									</FormLabel>
									<FormControl>
										<Input
											{...field}
											hasError={form.formState.errors.email !==
												undefined}
											className="w-full"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem className="w-full">
									<FormLabel>
										Password
									</FormLabel>
									<FormControl>
										<Input
											{...field}
											type="password"
											hasError={form.formState.errors.password !==
												undefined}
											className="w-full"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="confirmPassword"
							render={({ field }) => (
								<FormItem className="w-full">
									<FormLabel>
										Confirm Password
									</FormLabel>
									<FormControl>
										<Input
											{...field}
											type="password"
											hasError={form.formState.errors.confirmPassword !==
												undefined}
											className="w-full"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</FormFieldGroup>
					<div className="w-full flex flex-col justify-center items-center gap-y-2">
						<Button
							type="submit"
							className="w-full"
							isLoading={signUpWithEmailPassword.isPending}
						>
							Continue
						</Button>
						{form.formState.errors.root && (
							<Alert
								variant="destructive"
								className="w-full"
							>
								<AlertCircle size={16} />
								<AlertTitle>
									{form.formState.errors.root.message}
								</AlertTitle>
							</Alert>
						)}
					</div>
				</form>
			</Form>
			<div className="w-full flex flex-row justify-center items-center gap-x-2">
				<p className="text-sm text-v2-soft-400">
					Already have an account?
				</p>
				<Button
					variant="secondary"
					size="xs"
					asChild
				>
					<Link href="/login">Log in</Link>
				</Button>
			</div>
		</Card>
	);
}
