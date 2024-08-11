import { defineTestApp } from '#utils/app.ts';
import { fromDockerfile } from '#utils/dockerfile.ts';
import { declareTestServices } from '#utils/service.ts';
import { outdent } from 'outdent';

const testServices = declareTestServices({
	codecombat: {
		subdomain: 'codecombat',
	},
});

export const codecombat = defineTestApp(testServices, {
	repo: 'codecombat/codecombat',
	services: () => ({
		codecombat: {
			dockerPort: 3000,
			dockerfile: fromDockerfile(
				'development/docker/Dockerfile',
				(dockerfile) => (dockerfile
					.replace(
						'FROM node:8.15.1-jessie',
						'FROM node:20',
					)
					.replace(
						/$/,
						outdent`
							RUN npm install
							RUN npm run build
							CMD npm run proxy
						`,
					)),
			),
			environment: {
				DEV_CONTAINER: '1',
			},
		},
	}),
});
