import { useDocumentBody } from '#utils/document.ts';
import { frameworkOptions } from '#utils/frameworks.tsx';
import {
	MuratSelectContent,
	MuratSelectItem,
	MuratSelectTrigger,
	Select,
	SelectValue,
} from '@-/design-system/v1';

export const FrameworkSelect = (
	{ framework, setFramework }: {
		framework: keyof typeof frameworkOptions;
		setFramework: (framework: keyof typeof frameworkOptions) => void;
	},
) => {
	const documentBody = useDocumentBody();
	return (
		<Select
			value={framework}
			onValueChange={(f) => setFramework(f as keyof typeof frameworkOptions)}
		>
			<MuratSelectTrigger className="max-w-max gap-2">
				<SelectValue />
			</MuratSelectTrigger>
			<MuratSelectContent
				container={documentBody}
				align="start"
				className="z-[1002]"
			>
				{Object.keys(frameworkOptions).map((framework, i) => (
					<FrameworkSelectItem
						key={i}
						framework={framework as keyof typeof frameworkOptions}
					/>
				))}
			</MuratSelectContent>
		</Select>
	);
};

const FrameworkSelectItem = (
	{ framework }: { framework: keyof typeof frameworkOptions },
) => (
	<MuratSelectItem value={framework}>
		<div className="flex flex-row justify-start items-center gap-x-2 [&>svg]:text-neutral-400">
			{frameworkOptions[framework].icon}
			{frameworkOptions[framework].label}
		</div>
	</MuratSelectItem>
);
