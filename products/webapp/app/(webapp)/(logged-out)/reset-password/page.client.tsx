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
	Input,
} from '@-/design-system';
import { z } from '@-/zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import zxcvbn from 'zxcvbn';
import { Card } from '../card.tsx';

export default function ResetPasswordClientPage(
	{ token }: { token: string; email: string },
) {
	const resetPassword = trpc.auth.resetPassword.useMutation();

	const resetSchema = z.object({
		password: z.string().min(10, 'Must be at least 10 characters.').refine(
			(val) => zxcvbn(val).score >= 3,
			'Password is too weak.',
		),
		confirmPassword: z.string(),
	}).refine(({ password, confirmPassword }) => confirmPassword === password, {
		path: ['confirmPassword'],
		message: 'Passwords do not match',
	});
	const form = useForm<z.infer<typeof resetSchema>>({
		resolver: zodResolver(resetSchema),
		defaultValues: {
			password: '',
			confirmPassword: '',
		},
	});

	const onSubmit = async ({ password }: z.infer<typeof resetSchema>) => {
		const result = await resetPassword.mutateAsync({
			token,
			newPassword: password,
		});
		if (result.isOk()) {
			window.location.href = `/home?wos-session=${
				encodeURIComponent(result.value.wosSessionString)
			}`;
		} else {
			form.setError('root', { message: result.error.message });
		}
	};

	return (
		<Card title="Reset your Password">
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="w-full flex flex-col justify-center items-center gap-y-6"
				>
					<FormFieldGroup>
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
							isLoading={resetPassword.isPending}
						>
							Reset Password
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
		</Card>
	);
}
