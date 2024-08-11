import { Button } from '@-/design-system/v1';
import {
	IntegrationIcon,
	TunnelIcon,
} from '@-/integrations/components';
import { invoke, router } from '@forge/bridge';
import { ArrowLeftRight } from 'lucide-react';

export default function App() {
	return (
		<div className="flex flex-col justify-center items-center w-full h-screen bg-background p-8">
			<div className="flex flex-col justify-center items-center md:p-6 rounded-md w-full max-w-md">
				<div className="flex flex-row justify-center items-center gap-x-2 mb-4">
					<TunnelIcon
						variant={'rounded'}
						size={'lg'}
						className="border border-solid border-input"
					/>
					<ArrowLeftRight size={24} className="text-blue-600" />
					<IntegrationIcon
						variant={'rounded'}
						size={'lg'}
						src="https://tunnel.dev/assets/images/jira.svg"
					/>
				</div>

				<h1 className="text-xl text-foreground font-medium mb-1 text-center">
					Connect Tunnel to Jira
				</h1>
				<p className="text-muted-foreground w-full px-4 text-center">
					Please authorize Tunnel to connect to your Jira account below.
				</p>

				<Button
					variant="ghost"
					className="mt-5"
					onClick={async () => {
						const url: string = await invoke('getWebTriggerUrl');
						await router.open(
							`{TUNNEL_DOMAIN}/jira/link?url=${url}`,
						);
					}}
				>
					Continue with Jira
				</Button>
			</div>
		</div>
	);
}
