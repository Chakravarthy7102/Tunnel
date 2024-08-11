import { defineTestApp } from '#utils/app.ts';
import { fromDockerfile } from '#utils/dockerfile.ts';
import { declareTestServices, getTestServicePort } from '#utils/service.ts';
import { env } from '@-/env';
import escapesh from 'escapesh';
import { outdent } from 'outdent';

const testServices = declareTestServices({
	'monkeytype-frontend': {
		subdomain: 'monkeytype',
	},
	'monkeytype-backend': {
		subdomain: 'monkeytype-backend',
	},
	'monkeytype-redis': {
		subdomain: 'monkeytype-redis',
	},
	'monkeytype-mongodb': {
		subdomain: 'monkeytype-mongodb',
	},
});

const firebaseConfig = {
	apiKey: env('MONKEYTYPE_FIREBASE_API_KEY'),
	authDomain: env('MONKEYTYPE_FIREBASE_AUTHDOMAIN'),
	projectId: env('MONKEYTYPE_FIREBASE_PROJECTID'),
	storageBucket: env('MONKEYTYPE_FIREBASE_STORAGEBUCKET'),
	messagingSenderId: env(
		'MONKEYTYPE_FIREBASE_MESSAGINGSENDERID',
	),
	appId: env('MONKEYTYPE_FIREBASE_APPID'),
};

const firebaseRc = JSON.stringify({
	projects: {
		default: 'tunnel-monkeytype',
	},
});

const backendConfiguration = {
	configuration: {
		results: {
			savingEnabled: true,
		},
		users: {
			signUp: true,
			profiles: {
				enabled: true,
			},
		},
		dailyLeaderboards: {
			enabled: true,
			maxResults: 250,
			leaderboardExpirationTimeInDays: 1,
			validModeRules: [
				{
					language: 'english',
					mode: 'time',
					mode2: '15',
				},
				{
					language: 'english',
					mode: 'time',
					mode2: '60',
				},
			],
		},
	},
};

// We re-stringify the service account key to make it a single line
const monkeytypeServiceAccountKey = JSON.stringify(
	// eslint-disable-next-line no-restricted-properties -- Guaranteed to be valid JSON
	JSON.parse(env('MONKEYTYPE_SERVICE_ACCOUNT_KEY')),
);

export const monkeytype = defineTestApp(testServices, {
	repo: 'monkeytypegame/monkeytype',
	services(context) {
		return {
			'monkeytype-frontend': {
				dependsOn: [testServices['monkeytype-backend'].slug],
				dockerPort: 80,
				dockerfile: fromDockerfile(
					'docker/frontend/Dockerfile',
					(dockerfile) => {
						return dockerfile
							.replace(
								'###MONKEYTYPE_BACKENDURL###',
								'https://monkeytype-backend.tunneldev.test',
							)
							.replace(
								'###RECAPTCHA_SITE_KEY###',
								env('MONKEYTYPE_RECAPTCHA_SITE_KEY'),
							)
							.replace(
								outdent`
									COPY docker/frontend/firebase-config-live.ts frontend/src/ts/constants/firebase-config.ts
									COPY docker/frontend/firebase-config-live.ts frontend/src/ts/constants/firebase-config-live.ts
								`,
								// dprint-ignore
								outdent`
									RUN echo ${
										escapesh(
											'export const firebaseConfig = ' +
												JSON.stringify(firebaseConfig),
										)
									} > frontend/src/ts/constants/firebase-config.ts
									RUN echo ${
										escapesh(
											'export const firebaseConfig = ' +
												JSON.stringify(firebaseConfig),
										)
									} > frontend/src/ts/constants/firebase-config-live.ts
								`,
							)
							.replace(
								'RUN npm ci',
								// dprint-ignore
								outdent`
									RUN npm ci
									RUN echo ${escapesh(firebaseRc)} > .firebaserc
									RUN sed -i 's/<head>/<head><script src="https:\\/\\/tunnel.test\\/__tunnel\\/script.js"><\\/script>/' frontend/src/html/head.html
								`,
							);
					},
				),
				environment: {
					RECAPTCHA_SITE_KEY: env('MONKEYTYPE_RECAPTCHA_SITE_KEY'),
					FIREBASE_APIKEY: env('MONKEYTYPE_FIREBASE_API_KEY'),
					FIREBASE_AUTHDOMAIN: env('MONKEYTYPE_FIREBASE_AUTHDOMAIN'),
					FIREBASE_PROJECTID: env('MONKEYTYPE_FIREBASE_PROJECTID'),
					FIREBASE_STORAGEBUCKET: env('MONKEYTYPE_FIREBASE_STORAGEBUCKET'),
					FIREBASE_MESSAGINGSENDERID: env(
						'MONKEYTYPE_FIREBASE_MESSAGINGSENDERID',
					),
					FIREBASE_APPID: env('MONKEYTYPE_FIREBASE_APPID'),
					MONKEYTYPE_BACKENDURL: 'https://monkeytype-backend.tunneldev.test',
				},
			},
			'monkeytype-backend': {
				dependsOn: [
					testServices['monkeytype-redis'].slug,
					testServices['monkeytype-mongodb'].slug,
				],
				dockerPort: 5005,
				dockerfile: fromDockerfile(
					'docker/backend/Dockerfile',
					(dockerfile) => {
						const apkAddDepsCommands = outdent`
							ENV PYTHONUNBUFFERED=1
							RUN apk add --update --no-cache python3 && ln -sf python3 /usr/bin/python
							RUN apk add --no-cache make gcc g++
						`;

						return dockerfile
							.replace(
								'FROM node:18.19.1-alpine3.19 as builder',
								outdent`
									$&
									${apkAddDepsCommands}
								`,
							)
							.replace(
								'COPY --from=builder /app/backend/build .',
								// dprint-ignore
								outdent`
									$&

									# @see https://github.com/monkeytypegame/monkeytype/blob/master/docker/docker-compose.yml#L44
									RUN echo ${
										escapesh(JSON.stringify(backendConfiguration))
									} > /app/backend-configuration.json

									# We write to \`serviceAccountKey.json\` to enable accounts on Monkeytype
									# @see https://github.com/monkeytypegame/monkeytype/blob/master/docker/docker-compose.yml#L39
									RUN mkdir -p /src/credentials
									RUN echo ${
										escapesh(monkeytypeServiceAccountKey)
									} > /src/credentials/serviceAccountKey.json
								`,
							)
							.replace(
								'FROM node:hydrogen-alpine',
								outdent`
									$&
									${apkAddDepsCommands}
								`,
							);
					},
				),
				environment: {
					DB_NAME: 'monkeytype',
					DB_URI: `mongodb://host.docker.internal:${
						getTestServicePort(context, testServices['monkeytype-mongodb'])
					}`,
					REDIS_URI: `redis://host.docker.internal:${
						getTestServicePort(context, testServices['monkeytype-redis'])
					}`,
					FRONTEND_URL: 'https://monkeytype.tunneldev.test',
					RECAPTCHA_SECRET: env('MONKEYTYPE_RECAPTCHA_SECRET'),
				},
			},
			'monkeytype-redis': {
				dockerPort: 6379,
				dockerfile: 'redis:6.2.6',
			},
			'monkeytype-mongodb': {
				dockerPort: 27_017,
				dockerfile: 'mongo:5.0.8',
			},
		};
	},
});
