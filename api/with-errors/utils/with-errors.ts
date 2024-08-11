export function withErrors<$Errors, $Function extends Function>(
	errors: $Errors,
	functionGetter: (errors: $Errors) => $Function,
) {
	return Object.assign(functionGetter(errors), {
		errors,
	});
}
