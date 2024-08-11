import type {
	NormalizedTestServiceDeclaration,
	NormalizedTestServiceDefinition,
	TestAppDefinitionContext,
	TestServiceDeclarationInput,
	TestServiceDefinitionInput,
} from '#types';
import mapObject from 'map-obj';
import nullthrows from 'nullthrows-es';

export function normalizeTestServiceDeclaration(
	testServiceSlug: string,
	testServiceDeclaration: TestServiceDeclarationInput,
): NormalizedTestServiceDeclaration {
	return {
		...testServiceDeclaration,
		slug: testServiceSlug,
	};
}

/**
	The service slugs should typically match those in the project's `docker-compose.yml` file
*/
export function declareTestServices<
	$TestServices extends Record<string, TestServiceDeclarationInput>,
>(
	testServices: $TestServices,
): {
	[$TestServiceSlug in keyof $TestServices]: NormalizedTestServiceDeclaration;
} {
	// @ts-expect-error: broken
	return mapObject(
		testServices,
		(
			slug,
			testService,
		) => [
			slug as string,
			normalizeTestServiceDeclaration(slug as string, testService),
		],
	);
}

export function getTestServicePort(
	context: TestAppDefinitionContext,
	testService: NormalizedTestServiceDeclaration,
) {
	return nullthrows(context.servicesConfig[testService.slug]).port;
}

export function normalizeTestServiceDefinition(
	testServiceDefinitionInput: TestServiceDefinitionInput,
): NormalizedTestServiceDefinition {
	return {
		...testServiceDefinitionInput,
		dependsOn: [testServiceDefinitionInput.dependsOn ?? []].flat(),
		dockerPort: async () =>
			typeof testServiceDefinitionInput.dockerPort === 'function' ?
				testServiceDefinitionInput.dockerPort() :
				testServiceDefinitionInput.dockerPort,
		dockerfile: async (args) =>
			typeof testServiceDefinitionInput.dockerfile === 'function' ?
				testServiceDefinitionInput.dockerfile(args) :
				`FROM ${testServiceDefinitionInput.dockerfile}`,
		environment: async (app) =>
			typeof testServiceDefinitionInput.environment === 'function' ?
				testServiceDefinitionInput.environment(app) :
				testServiceDefinitionInput.environment ?? {},
		submodules: testServiceDefinitionInput.submodules ?? {},
	};
}
