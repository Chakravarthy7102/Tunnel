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
	FormMessage,
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from '@-/design-system';
import { toast } from '@-/tunnel-error';
import { z } from '@-/zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Card } from '../card.tsx';

export default function VerifyEmailClientPage({
	next,
	pendingAuthenticationToken,
	email,
}: {
	next: string | null;
	pendingAuthenticationToken: string;
	email: string;
}) {
	const sendVerificationEmail = trpc.auth.sendVerificationEmail.useMutation();
	const verifyEmailAndAuthenticate = trpc.auth.verifyEmailAndAuthenticate
		.useMutation();

	const verificationCodeSchema = z.object({
		verificationCode: z.string().regex(/^\d{6}$/, {
			message: 'Please enter a 6-digit code.',
		}),
	});
	const form = useForm<z.infer<typeof verificationCodeSchema>>({
		resolver: zodResolver(verificationCodeSchema),
		defaultValues: {
			verificationCode: '',
		},
	});

	const onSubmit = async (
		{ verificationCode }: z.infer<typeof verificationCodeSchema>,
	) => {
		const result = await verifyEmailAndAuthenticate.mutateAsync({
			pendingAuthenticationToken,
			code: verificationCode,
		});
		if (result.isOk()) {
			window.location.href = `/home?wos-session=${
				encodeURIComponent(result.value.wosSessionString)
			}${next ? `&next=${encodeURIComponent(next)}` : ''}`;
		} else {
			form.setError('root', { message: result.error.message });
		}
	};

	const resendVerificationEmail = async () => {
		const result = await sendVerificationEmail.mutateAsync({
			email,
		});
		if (result.isOk()) {
			toast.success('Verification email sent');
		} else {
			toast.error(result.error.message);
		}
	};

	return (
		<Card title="Enter verification code">
			<Form {...form}>
				<form
					className="w-full flex flex-col justify-center items-center gap-y-6"
					onSubmit={form.handleSubmit(onSubmit)}
				>
					<FormField
						control={form.control}
						name="verificationCode"
						render={({ field }) => (
							<FormItem className="w-full">
								<FormControl>
									<InputOTP
										maxLength={6}
										{...field}
										disabled={sendVerificationEmail.isPending}
									>
										<InputOTPGroup>
											<InputOTPSlot
												index={0}
												hasError={form.formState.errors.verificationCode !==
													undefined}
											/>
											<InputOTPSlot
												index={1}
												hasError={form.formState.errors.verificationCode !==
													undefined}
											/>
											<InputOTPSlot
												index={2}
												hasError={form.formState.errors.verificationCode !==
													undefined}
											/>
											<InputOTPSlot
												index={3}
												hasError={form.formState.errors.verificationCode !==
													undefined}
											/>
											<InputOTPSlot
												index={4}
												hasError={form.formState.errors.verificationCode !==
													undefined}
											/>
											<InputOTPSlot
												index={5}
												hasError={form.formState.errors.verificationCode !==
													undefined}
											/>
										</InputOTPGroup>
									</InputOTP>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<div className="w-full flex flex-col justify-center items-center gap-y-2">
						<Button
							type="submit"
							className="w-full"
							isLoading={verifyEmailAndAuthenticate.isPending}
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
				<p className="text-sm text-v2-soft-400">
					Didn't receive the code?
				</p>
				<Button
					variant="secondary"
					size="xs"
					onClick={resendVerificationEmail}
					isLoading={sendVerificationEmail.isPending}
				>
					Resend code
				</Button>
			</div>
		</Card>
	);
}
