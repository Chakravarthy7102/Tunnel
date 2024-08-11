export default function AuthenticationSuccessfulCliPage() {
	return (
		<div className="w-full flex flex-col justify-start items-center min-h-[800px] h-screen bg-background">
			<div className="flex flex-col justify-start items-center w-full max-w-xs h-full px-4 gap-6 py-40">
				<div className="flex flex-col justify-center items-start w-full text-foreground gap-4">
					<div className="flex flex-row w-full justify-start items-center gap-2">
						<p className="text-xl font-medium">Authentication successful</p>
					</div>
					<p className="text-muted-foreground text-left">
						You can now safely close this window and return to the CLI
					</p>
				</div>
			</div>
		</div>
	);
}
