import { cn } from '@-/design-system/v1';

export function ComboboxRow({
	className,
	title,
	combobox,
	icon,
	isRequired = false,
	isPadded,
	description,
}: {
	className?: string;
	title: string;
	combobox: React.ReactNode;
	icon: React.ReactNode;
	isRequired?: boolean;
	isPadded: boolean;
	description?: string;
}) {
	return (
		<div
			className={cn(
				'flex md:flex-row flex-col w-full md:justify-between md:items-center items-start justify-center gap-4 border-b border-solid border-input last:border-none',
				isPadded ? 'p-4' : 'py-4',
				className,
			)}
		>
			<div className="flex flex-row justify-center items-center gap-3">
				<div className="min-w-max">{icon}</div>

				<div className="flex flex-col justify-center items-start">
					<div className="flex flex-row justify-center items-center gap-x-1">
						<p className="text-foreground font-medium">{title}</p>
						{isRequired && (
							<p className="text-muted-foreground text-sm">(required)</p>
						)}
					</div>
					{description && (
						<p className="text-muted-foreground text-sm">{description}</p>
					)}
				</div>
			</div>
			{combobox}
		</div>
	);
}
