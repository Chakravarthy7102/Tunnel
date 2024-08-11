'use client';

import { DISCORD_URL } from '#utils/constants.ts';

export default function Error({
	error,
}: {
	error: Error & { digest?: string };
}) {
	return (
		<html>
			<body>
				<div className="flex relative flex-col justify-center items-center w-full h-screen bg-background p-8">
					<div className="absolute top-0 left-0 p-8">
						<a href="/home" target="_blank">
							<img
								src="https://tunnel.dev/assets/images/light-full-transparent.svg"
								className="h-6"
							/>
						</a>
					</div>
					<div className="flex flex-col justify-center items-center bg-accent border-input border border-solid p-6 rounded-md w-full max-w-md">
						<h1 className="text-3xl text-foreground font-medium mb-1">
							Whoops!
						</h1>
						<p className="text-muted-foreground w-full px-4 text-center">
							Uh oh, well this is awkward. The team was notified and should be
							on a fix ASAP. in the meantime, you can try reloading the page or
							logging out and back in. We're online 24/7 on{' '}
							<a href={DISCORD_URL}>Discord</a>
						</p>
					</div>
				</div>
			</body>
		</html>
	);
}
