'use client';

import { cn } from '#utils/style.ts';
import { OTPInput, OTPInputContext } from 'input-otp';
import { Dot } from 'lucide-react';
import nullthrows from 'nullthrows-es';
import * as React from 'react';

const InputOTP = React.forwardRef<
	React.ElementRef<typeof OTPInput>,
	React.ComponentPropsWithoutRef<typeof OTPInput>
>(({ className, containerClassName, ...props }, ref) => {
	return (
		<OTPInput
			ref={ref}
			containerClassName={cn(
				'w-full flex items-center gap-2 has-[:disabled]:opacity-50',
				containerClassName,
			)}
			className={cn('disabled:cursor-not-allowed', className)}
			{...props}
		/>
	);
});
InputOTP.displayName = 'InputOTP';

const InputOTPGroup = React.forwardRef<
	React.ElementRef<'div'>,
	React.ComponentPropsWithoutRef<'div'>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn('w-full flex items-center gap-3', className)}
		{...props}
	/>
));
InputOTPGroup.displayName = 'InputOTPGroup';

const InputOTPSlot = React.forwardRef<
	React.ElementRef<'div'>,
	React.ComponentPropsWithoutRef<'div'> & { index: number; hasError?: boolean }
>(({ index, className, hasError, ...props }, ref) => {
	const inputOTPContext = React.useContext(OTPInputContext);
	const { char, hasFakeCaret, isActive } = nullthrows(
		inputOTPContext.slots[index],
	);

	return (
		<div
			ref={ref}
			className={cn(
				'relative flex h-16 w-full items-center rounded-lg justify-center text-2xl font-medium transition-all shadow-v2-input border border-transparent',
				isActive && 'z-10 shadow-v2-input-focus',
				hasError && 'border-v2-danger-500 shadow-v2-input-error',
				(isActive && hasError) && '!shadow-v2-input-error-focus',
				className,
			)}
			{...props}
		>
			{char}
			{hasFakeCaret && (
				<div className="pointer-events-none absolute inset-0 flex items-center justify-center">
					<div className="h-8 w-0.5 bg-white" />
				</div>
			)}
		</div>
	);
});
InputOTPSlot.displayName = 'InputOTPSlot';

const InputOTPSeparator = React.forwardRef<
	React.ElementRef<'div'>,
	React.ComponentPropsWithoutRef<'div'>
>(({ ...props }, ref) => (
	<div ref={ref} role="separator" {...props}>
		<Dot />
	</div>
));
InputOTPSeparator.displayName = 'InputOTPSeparator';

export { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot };
