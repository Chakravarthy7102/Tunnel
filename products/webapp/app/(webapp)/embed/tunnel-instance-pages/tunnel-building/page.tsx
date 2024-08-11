export default function TunnelBuildingPage() {
	return (
		<div className="flex relative flex-col justify-center items-center w-full h-screen bg-background p-8">
			<div className="absolute top-0 left-0 p-8">
				<a href="/home" target="_blank">
					<img
						src="/assets/images/light-full-transparent.svg"
						className="h-8"
					/>
				</a>
			</div>
			<div className="flex flex-col justify-center items-center bg-accent border-input border border-solid p-6 rounded-md w-full max-w-md">
				<h1 className="text-3xl text-foreground font-medium mb-1">
					Tunnel is Building
				</h1>
				<p className="text-muted-foreground w-full px-4 text-center">
					Please check back soon, we'll have this tunnel ready by then.
				</p>
			</div>
		</div>
	);
}
