import type { Promisable } from 'type-fest';

export interface TestServiceDeclarationInput {
	subdomain: string;
}

export interface NormalizedTestServiceDeclaration {
	slug: string;
	subdomain: string;
}

export interface TestServiceDefinitionInput {
	dependsOn?: Array<string>;
	dockerPort: number | (() => Promisable<number>);
	dockerfile:
		| ((args: { app: { repo: string } }) => Promisable<string>)
		| string;
	environment?:
		| Record<string, string>
		| ((
			app: Record<string, { port: number }>,
		) => Promisable<Record<string, string>>);
	/**
		A map from a path to a git submodule within the repo to the submodule's repo name
	*/
	submodules?: Record<string, string>;
}

export interface NormalizedTestServiceDefinition {
	dependsOn: Array<string>;
	dockerPort(): Promise<number>;
	dockerfile: (args: { app: { repo: string } }) => Promise<string>;
	environment(
		app: Record<string, { port: number }>,
	): Promise<Record<string, string>>;
	submodules: Record<string, string>;
}

export interface TestService {
	appRepo: string;
	dockerPort: number;
	dockerfile: string;
	publicPort: number;
	slug: string;
	environment: Record<string, string>;
	subdomain: string;
	submodules: Record<string, string>;
}

export type TestServicesConfig = Record<string, { port: number }>;
