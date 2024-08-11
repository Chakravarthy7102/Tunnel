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
	LinkButton,
	Separator,
} from '@-/design-system';
import { toast } from '@-/tunnel-error';
import { z } from '@-/zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { SiGithub } from '@icons-pack/react-simple-icons';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { Card } from '../card.tsx';

export default function LoginClientPage({
	next,
	githubOauthUrl,
	googleOauthUrl,
}: {
	next: string | null;
	githubOauthUrl: string;
	googleOauthUrl: string;
}) {
	const login = trpc.auth.login.useMutation();

	const loginSchema = z.object({
		email: z.string().email('Must be a valid email address.'),
		password: z.string(),
	});
	const form = useForm<z.infer<typeof loginSchema>>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: '',
			password: '',
		},
	});

	async function onSubmit({ email, password }: z.infer<typeof loginSchema>) {
		const result = await login.mutateAsync({ email, password });
		if (result.isOk()) {
			if ('wosSessionString' in result.value) {
				window.location.href = `/home?wos-session=${
					encodeURIComponent(result.value.wosSessionString)
				}${next === null ? '' : `&next=${encodeURIComponent(next)}`}`;
			} else {
				toast.message('MFA is not yet supported');
			}
		} else {
			form.setError('root', { message: 'Invalid email or password.' });
		}
	}

	return (
		<Card title="Log in to Tunnel">
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
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="w-full flex flex-col justify-center items-center gap-y-6"
				>
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
					</FormFieldGroup>
					<div className="flex flex-col self-stretch items-end gap-y-2">
						<LinkButton variant="secondary" size="sm" asChild>
							<Link href="/forgot-password">
								Forgot Password?
							</Link>
						</LinkButton>
					</div>
					<div className="w-full flex flex-col justify-center items-center gap-y-2">
						<Button
							type="submit"
							className="w-full"
							isLoading={login.isPending}
						>
							Login
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
				<p className="text-sm text-v2-soft-400">Don't have an account?</p>
				<Button
					variant="secondary"
					size="xs"
					asChild
				>
					<Link href="/signup">Sign up</Link>
				</Button>
			</div>
		</Card>
	);
}
