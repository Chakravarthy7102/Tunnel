import { Badge } from '@-/design-system/v1';

export interface CodeStep {
	text: string;
	code: React.ReactNode;
}

export function CodeSteps({
	steps,
}: {
	steps: CodeStep[];
}) {
	return (
		<div className="flex flex-col gap-y-6 w-full">
			{steps.map((step, i) => {
				return <CodeStep step={step} position={i + 1} key={i} />;
			})}
		</div>
	);
}

function CodeStep({
	step,
	position,
}: {
	step: CodeStep;
	position: number;
}) {
	return (
		<div className="flex flex-col w-full gap-y-2">
			<div className="flex flex-row justify-start gap-x-2 items-center">
				<Badge
					size="sm"
					variant={position === 1 ?
						'blue' :
						position === 2 ?
						'green' :
						'orange'}
				>
					{`Step ${position}`}
				</Badge>
				<p className="text-left text-neutral-0 text-sm font-normal">
					{step.text}
				</p>
			</div>
			{step.code}
		</div>
	);
}
