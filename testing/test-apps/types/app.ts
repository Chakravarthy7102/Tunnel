import type {
	NormalizedTestServiceDeclaration,
	TestService,
	TestServiceDeclarationInput,
	TestServiceDefinitionInput,
	TestServicesConfig,
} from '#types';

export interface TestAppDefinitionInput<
	$TestServiceDeclarationInputs extends Record<
		string,
		TestServiceDeclarationInput
	> = Record<string, TestServiceDeclarationInput>,
> {
	repo: string;
	services: (context: TestAppDefinitionContext) => Record<
		keyof $TestServiceDeclarationInputs,
		TestServiceDefinitionInput
	>;
}

export interface NormalizedTestAppDefinition {
	repo: string;
	serviceDeclarations: Record<string, NormalizedTestServiceDeclaration>;
	services: (
		context: TestAppDefinitionContext,
	) => Promise<Record<string, TestService>>;
}

export interface TestApp {
	repo: string;
	services: Record<string, TestService>;
	servicesConfig: TestServicesConfig;
}

export interface TestAppDefinitionContext {
	servicesConfig: TestServicesConfig;
}
