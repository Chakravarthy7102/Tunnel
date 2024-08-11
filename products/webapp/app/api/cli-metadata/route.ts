import { getBundledDatabaseApiVersion } from '@-/database/constants';
import { tunnelPublicPackagesMetadata } from '@-/tunnel-public-packages-metadata';
import { NextResponse } from 'next/server';

export async function GET() {
	return NextResponse.json({
		'@tunnel/cli-source': tunnelPublicPackagesMetadata['@tunnel/cli-source'],
		'@tunnel/cli-single-executable-application':
			tunnelPublicPackagesMetadata['@tunnel/cli-single-executable-application'],
		'@-/database': {
			version: getBundledDatabaseApiVersion(),
		},
	});
}
