import type {
	BrowserContext,
	Organization,
	OrganizationMember,
	Project,
	ProjectComment,
	ProjectCommentThread,
	User,
} from '#fixtures/_.ts';
import type { AuthSession } from '#types';
import type { Simplify } from 'type-fest';

export interface FixturesWithInput<
	$TestSlug extends string,
	$FixturesSpecInput,
> {
	BrowserContext: typeof BrowserContext<$TestSlug, $FixturesSpecInput>;
	Organization: typeof Organization<$TestSlug, $FixturesSpecInput>;
	OrganizationMember: typeof OrganizationMember<$TestSlug, $FixturesSpecInput>;
	User: typeof User<$TestSlug, $FixturesSpecInput>;
	Project: typeof Project<$TestSlug, $FixturesSpecInput>;
	ProjectComment: typeof ProjectComment<
		$TestSlug,
		$FixturesSpecInput
	>;
	ProjectCommentThread: typeof ProjectCommentThread<
		$TestSlug,
		$FixturesSpecInput
	>;
}

export type FixtureType = keyof FixturesWithInput<string, any>;

export type FixtureCreateFunction<
	$TestSlug extends string,
	$FixturesSpecInput,
	$FixtureType extends FixtureType,
> = ReturnType<
	FixturesWithInput<$TestSlug, $FixturesSpecInput>[$FixtureType]
>['create'];

export type FixtureValue<
	$TestSlug extends string,
	$FixtureType extends FixtureType,
> = Awaited<
	ReturnType<
		FixtureCreateFunction<
			$TestSlug,
			/* doesn't matter for the return type */ any,
			$FixtureType
		>
	>
>;

export interface FixturesThis {
	getFixture<$FixtureType extends FixtureType>(
		key: keyof any,
	): Promise<FixtureValue<string, $FixtureType>>;
	getKey(): string;
}

// dprint-ignore
export type FixtureKeyOfType<$FixturesSpecInput, $Type> = keyof {
	[
		$FixtureKey in keyof $FixturesSpecInput as
			// @ts-expect-error: works
			$FixturesSpec[$FixtureKey]['type'] extends $Type ?
				$FixtureKey :
			never
	]: $FixturesSpecInput[$FixtureKey];
};

// dprint-ignore
export type FixtureSpec<$TestSlug extends string, $FixturesSpecInput> = {
	[$FixtureType in FixtureType]: Simplify<
		{ type: $FixtureType; relations?: Array<keyof $FixturesSpecInput> } &
		(
			Parameters<FixtureCreateFunction<$TestSlug, $FixturesSpecInput, $FixtureType>> extends [] ?
			 	{} :
			Parameters<FixtureCreateFunction<$TestSlug, $FixturesSpecInput, $FixtureType>>[0]
		)
	>;
}[FixtureType];

export type FixturesSpec<$TestSlug extends string, $FixturesSpecInput> = Record<
	string,
	FixtureSpec<$TestSlug, $FixturesSpecInput>
>;

export interface GetFixturesSpecArgs {
	authSession: {
		actor(): AuthSession;
		(index: 1 | 2): AuthSession;
	};
}
