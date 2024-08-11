import type { StepScreenProps } from '#types';
import { Button } from '@-/design-system/v1';

export function HomeStepScreen({ onContinue }: StepScreenProps) {
	return (
		<>
			<h1 className="text-2xl font-medium text-neutral-0">Welcome to Tunnel</h1>
			<p className="mb-6 text-base text-neutral-400 max-w-xs text-center">
				Tunnel allows you to collaborate and give feedback on live webapps
			</p>
			<Button
				variant="muratblue"
				onClick={onContinue}
			>
				Get started
			</Button>
		</>
	);
}
