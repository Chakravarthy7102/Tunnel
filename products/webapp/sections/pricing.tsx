import {
	Display2,
	Display3,
	Paragraph2,
	Paragraph3,
} from '#components/v1/marketing/typography.tsx';
import { Button } from '#components/v1/marketing/ui/button.tsx';
import { Icon, type IconProps } from '#components/v1/marketing/ui/icon.tsx';
import { BlockContainer } from '#components/v1/marketing/ui/layout.tsx';
import { Link } from '#components/v1/marketing/ui/link.tsx';

export interface PricingProps {
	title: string;
	subtitle: string;
	plans: Plan[];
}

type Plan = {
	variant: 'default' | 'secondary';
	name: string;
	description: string;
	features: {
		icon: IconProps['name'];
		name: string;
	}[];
	callToAction: {
		href: string;
		text: string;
	};
} & (PlanWithPrice | PlanWithoutPrice);

interface PlanWithPrice {
	hasPrice: true;
	price: string;
	title?: never;
}

interface PlanWithoutPrice {
	hasPrice: false;
	price?: never;
	title: string;
}

export const Pricing = ({ title, subtitle, plans }: PricingProps) => {
	return (
		<BlockContainer className="sm:gap-16 gap-8">
			<div className="flex flex-col items-center justify-center text-center gap-2 sm:gap-6
      ">
				<Display2 className="max-w-3xl">{title}</Display2>
				<Paragraph2 className="max-w-md text-muted-foreground">
					{subtitle}
				</Paragraph2>
			</div>
			<div className="flex md:flex-row flex-col gap-3 w-full">
				{plans.map((plan, index) => (
					<div
						key={index}
						className="flex flex-1 bg-secondary/20 border border-input rounded-3xl flex-col gap-4 w-full justify-between items-start p-6"
					>
						<div className="flex flex-col gap-3">
							<Paragraph3 className="text-muted-foreground">
								{plan.name}
							</Paragraph3>
							<div className="flex flex-row items-end gap-1">
								<Display3>
									{plan.hasPrice ? `$${plan.price}` : plan.title}
								</Display3>
								{plan.hasPrice && (
									<Paragraph3 className="text-muted-foreground">
										/user/month
									</Paragraph3>
								)}
							</div>
							<Paragraph3 className="text-muted-foreground">
								{plan.description}
							</Paragraph3>
							<div className="flex flex-col gap-2 text-muted-foreground mb-2">
								{plan.features.map((feature) => {
									return (
										<div
											key={index}
											className="flex flex-row gap-2 items-center"
										>
											<Icon
												name={feature.icon}
												className="w-4 h-4 text-secondary-foreground"
											/>
											<Paragraph3 className="text-foreground">
												{feature.name}
											</Paragraph3>
										</div>
									);
								})}
							</div>
						</div>
						<Button
							variant={plan.variant}
							size="default"
							className="w-full"
							asChild
						>
							<Link href={plan.callToAction.href}>
								{plan.callToAction.text}
							</Link>
						</Button>
					</div>
				))}
			</div>
		</BlockContainer>
	);
};
