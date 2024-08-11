'use client';

import type { StepScreenProps } from '#types';
import { useAuth } from '#utils/auth.client.ts';
import { useDocumentBody } from '#utils/document.ts';
import { useRouteContext } from '#utils/route-context.ts';
import type { ServerDoc } from '@-/database';
import type {
	Organization_$dashboardPageData,
	OrganizationMember_$dashboardPageData,
	Project_$dashboardPageData,
} from '@-/database/selections';
import {
	Button,
	cn,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@-/design-system/v1';
import { UserAvatar } from '@-/user/components';
import { motion } from 'framer-motion';
import { LogOut } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import {
	ConnectStepScreen,
	CreateProjectStepScreen,
	GitStepScreen,
	HomeStepScreen,
	HostedAppStepScreen,
	InvitationsStepScreen,
	MessagingStepScreen,
	ProductManagementStepScreen,
} from './step-screens/_.ts';

const STEP_ANIMATION = {
	initial: {
		opacity: 0,
		y: 20,
	},
	animate: {
		opacity: 1,
		y: 0,
	},
	exit: {
		opacity: 0,
		y: -20,
	},
};

const STEPS = [
	HomeStepScreen,
	InvitationsStepScreen,
	GitStepScreen,
	ProductManagementStepScreen,
	MessagingStepScreen,
	CreateProjectStepScreen,
	HostedAppStepScreen,
	ConnectStepScreen,
];

export default function WelcomeClient({
	actorOrganizationMember,
	organization,
	project,
}: {
	actorOrganizationMember: ServerDoc<
		typeof OrganizationMember_$dashboardPageData
	>;
	organization: ServerDoc<typeof Organization_$dashboardPageData>;
	project: ServerDoc<typeof Project_$dashboardPageData> | null;
}) {
	const { actorUser } = useRouteContext('(webapp)/(logged-in)');
	const documentBody = useDocumentBody();
	const { signOut } = useAuth();
	const [step, setStep] = useState(organization.projectsCount > 0 ? 6 : 0);

	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const page = urlParams.get('page');

		if (page === 'git') {
			setStep(2);
		}

		if (page === 'product') {
			setStep(3);
		}

		if (page === 'messaging') {
			setStep(4);
		}
	}, []);

	const nextStep = useCallback(() => {
		setStep((step) => {
			if (step === STEPS.length - 1) {
				return step;
			}

			return step + 1;
		});
	}, []);

	const previousStep = useCallback(() => {
		setStep((step) => (step === 0 ? 0 : step - 1));
	}, []);

	useHotkeys('right', nextStep, [step]);
	useHotkeys('left', previousStep, [step]);

	const StepComponent = STEPS[step] as ({
		onContinue,
		actorOrganizationMember,
		project,
		organization,
	}: StepScreenProps) => JSX.Element;

	return (
		<div className="flex flex-col relative md:justify-center items-start justify-start min-h-screen w-full bg-neutral-900">
			<div className="px-6 h-[72px] w-full flex flex-row justify-between items-center gap-x-2.5 fixed top-0 border-b border-[#ffffff10] md:border-transparent bg-neutral-900">
				<div className="">
					<a href="/home" target="_blank">
						<img
							src="/assets/images/light-full-transparent.svg"
							className="h-6"
						/>
					</a>
				</div>

				<div className="text-sm md:flex hidden">
					<DropdownMenu>
						<DropdownMenuTrigger asChild className="w-full">
							<Button
								className="w-full justify-between flex flex-row group px-2 text-muted-foreground"
								variant="ghost"
								size="sm"
							>
								<div className="flex flex-row justify-center items-center gap-x-2">
									<UserAvatar
										size="sm"
										profileImageUrl={actorUser.profileImageUrl}
										name={actorUser.fullName}
									/>
									<p className="text-sm font-medium">{actorUser.email}</p>
								</div>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" container={documentBody}>
							<DropdownMenuItem
								onClick={async () => {
									signOut();
									window.location.href = '/login';
								}}
								danger
							>
								<LogOut size={14} />
								Sign out
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			<motion.div
				animate={STEP_ANIMATION.animate}
				initial={STEP_ANIMATION.initial}
				exit={STEP_ANIMATION.exit}
				className="flex flex-col md:justify-center  justify-start items-center h-full w-full md:py-12 pt-[108px] px-4"
				key={step}
			>
				<StepComponent
					onContinue={() => setStep(step + 1)}
					actorOrganizationMember={actorOrganizationMember}
					organization={organization}
					project={project}
				/>
			</motion.div>
			<div className="w-full h-[100px] md:hidden flex"></div>

			<div className="h-[50px] w-full flex flex-row justify-center items-center gap-x-2.5 fixed bottom-0 border-t border-[#ffffff10] md:border-transparent bg-neutral-900">
				{STEPS.map((_, index) => (
					<PageChangeButton
						key={index}
						onClick={() => setStep(index)}
						isActive={index === step}
						disabled={((index === 6 || index === 7) &&
							organization.projectsCount === 0) &&
							(step !== 6 && step !== 7)}
					/>
				))}
			</div>
		</div>
	);
}

function PageChangeButton({
	isActive,
	...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
	isActive: boolean;
}) {
	return (
		<button
			type="button"
			className={cn(
				'h-3 w-3 rounded-full transition-all border-[0.5px] border-solid border-[#ffffff10] disabled:bg-neutral-800 disabled:cursor-not-allowed',
				isActive ?
					'bg-muratblue-base' :
					'bg-neutral-600 shadow-stroke-opacity-white hover:bg-neutral-500 disabled:shadow-none',
			)}
			{...props}
		>
		</button>
	);
}
