import * as testApps from '#apps/_.js';
import type {
	NormalizedTestAppDefinition,
	NormalizedTestServiceDeclaration,
	NormalizedTestServiceDefinition,
	TestApp,
	TestAppDefinitionContext,
	TestAppDefinitionInput,
	TestService,
	TestServiceDeclarationInput,
} from '#types';
import { packageDirpaths } from '@-/packages-config';
import mapObject from 'map-obj';
import fs from 'node:fs';
import pProps from 'p-props';
import path from 'pathe';
import {
	normalizeTestServiceDeclaration,
	normalizeTestServiceDefinition,
} from './service.ts';

export function defineTestApp<
	$TestServiceDeclarations extends Record<string, TestServiceDeclarationInput>,
>(
	testServiceDeclarations: $TestServiceDeclarations,
	testAppDefinition: TestAppDefinitionInput<$TestServiceDeclarations>,
): NormalizedTestAppDefinition {
	const serviceDeclarations = mapObject(
		testServiceDeclarations,
		(serviceSlug, service) =>
			[
				serviceSlug as string,
				normalizeTestServiceDeclaration(serviceSlug as string, service),
			] as const,
	);
	return {
		...testAppDefinition,
		serviceDeclarations,
		async services(context: TestAppDefinitionContext) {
			const serviceDefinitions = testAppDefinition.services(context);
			return pProps(
				serviceDefinitions,
				async (serviceDefinition, serviceSlug) =>
					getTestService({
						context,
						appRepo: testAppDefinition.repo,
						serviceSlug: serviceSlug as string,
						serviceDeclarations,
						serviceDefinition: normalizeTestServiceDefinition(
							serviceDefinition,
						),
					}),
			);
		},
	};
}

export async function getTestService({
	context,
	serviceDefinition,
	serviceDeclarations,
	serviceSlug,
	appRepo,
}: {
	context: TestAppDefinitionContext;
	appRepo: string;
	serviceDeclarations: Record<string, NormalizedTestServiceDeclaration>;
	serviceDefinition: NormalizedTestServiceDefinition;
	serviceSlug: string;
}): Promise<TestService> {
	const publicPort = context.servicesConfig[serviceSlug]?.port;
	if (publicPort === undefined) {
		throw new Error(`Missing port for service in ${appRepo}: ${serviceSlug}`);
	}

	const subdomain = serviceDeclarations[serviceSlug]?.subdomain;
	if (subdomain === undefined) {
		throw new Error(
			`Missing subdomain for service in ${appRepo}: ${serviceSlug}`,
		);
	}

	return {
		appRepo,
		dockerPort: await serviceDefinition.dockerPort(),
		dockerfile: await serviceDefinition.dockerfile({ app: { repo: appRepo } }),
		publicPort,
		slug: serviceSlug,
		environment: await serviceDefinition.environment(context.servicesConfig),
		subdomain,
		submodules: serviceDefinition.submodules,
	};
}

export async function getApp(
	repo: string,
	{ servicesConfig }: { servicesConfig: Record<string, { port: number }> },
): Promise<TestApp> {
	const testApp = Object.values(testApps).find((app) => app.repo === repo);

	if (testApp === undefined) {
		throw new Error(`App not found: ${repo}`);
	}

	// Verify that the submodule repo has been pulled
	const appRepoDirpath = path.join(packageDirpaths.monorepo, 'repos', repo);
	if (
		!fs.existsSync(appRepoDirpath) ||
		fs.readdirSync(appRepoDirpath).length === 0
	) {
		throw new Error(`Missing repo: ${repo}`);
	}

	const context: TestAppDefinitionContext = { servicesConfig };

	return {
		repo: testApp.repo,
		services: await testApp.services(context),
		servicesConfig,
	};
}
