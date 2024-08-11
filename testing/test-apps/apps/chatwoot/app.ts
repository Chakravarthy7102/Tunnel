/*
import { defineTestApp } from '#utils/app.ts';
import { declareTestServices } from '#utils/service.ts';
import { fromDockerfile } from '../../utils/dockerfile.ts';

const testServices = declareTestServices({
	rails: {
		subdomain: 'chatwoot',
	},
	sidekiq: {
		subdomain: 'chatwoot-sidekiq',
	},
	postgres: {
		subdomain: 'chatwoot-postgres',
	},
	redis: {
		subdomain: 'chatwoot-redis',
	},
});

export const chatwoot = defineTestApp(testServices, {
	repo: 'chatwoot/chatwoot',
	services: () => ({
		rails: {
			dockerfile: fromDockerfile(
				'docker/Dockerfile',
				(dockerfile) => (dockerfile
					.replace()),
			),
			dependsOn: [testServices.postgres.slug, testServices.redis.slug],
		},
		sidekiq: {
			dependsOn: [testServices.postgres.slug, testServices.redis.slug],
			environment: {
				NODE_ENV: 'production',
				RAILS_ENV: 'production',
				INSTALLATION_ENV: 'docker',
			},
		},
		postgres: {
			dockerfile: 'postgres:12',
			dockerPort: 5432,
			environment: {
				POSTGRES_DB: 'chatwoot',
				POSTGRES_DB: 'postgres',
				POSTGRES_PASSWORD: 'tunnel',
			},
		},
		redis: {},
	}),
});
*/

export {};
