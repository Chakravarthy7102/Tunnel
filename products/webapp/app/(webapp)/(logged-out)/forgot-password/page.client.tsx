'use client';

import { trpc } from '#utils/trpc.ts';
import {
	Alert,
	AlertTitle,
	Button,
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	Input,
} from '@-/design-system';
import { toast } from '@-/tunnel-error';
import { z } from '@-/zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { Card } from '../card.tsx';

export default function ResetPasswordClientPage() {
	const sendResetPasswordEmail = trpc.auth.sendResetPasswordEmail.useMutation();

	const forgotPasswordSchema = z.object({
		email: z.string().email('Please enter a valid email address.'),
	});
	const form = useForm<z.infer<typeof forgotPasswordSchema>>({
		resolver: zodResolver(forgotPasswordSchema),
		defaultValues: {
			email: '',
		},
	});

	const onSubmit = async ({ email }: z.infer<typeof forgotPasswordSchema>) => {
		const result = await sendResetPasswordEmail.mutateAsync({ email });
		if (result.isOk()) {
			toast.message(
				'Reset password email sent, check your inbox for further instructions',
			);
		} else {
			form.setError('root', { message: result.error.message });
		}
	};

	return (
		<Card title="Forgot your password?">
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="w-full flex flex-col justify-center items-center gap-y-6"
				>
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
					<div className="w-full flex flex-col justify-center items-center gap-y-2">
						<Button
							type="submit"
							className="w-full"
							isLoading={sendResetPasswordEmail.isPending}
						>
							Send Reset Instructions
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
					Remember your password?
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
