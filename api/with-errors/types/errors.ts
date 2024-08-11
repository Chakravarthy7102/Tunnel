export type Errors<$ErrorsDefinition> = Array<
	$ErrorsDefinition[keyof $ErrorsDefinition]
>;
