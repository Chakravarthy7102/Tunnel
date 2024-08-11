import { defineTestApp } from '#utils/app.ts';
import { fromDockerfile } from '#utils/dockerfile.ts';
import { declareTestServices, getTestServicePort } from '#utils/service.ts';
import escapesh from 'escapesh';
import { outdent } from 'outdent';

const testServices = declareTestServices({
	app: {
		subdomain: 'habitica',
	},
	mongo: {
		subdomain: 'habitica-mongo',
	},
});

const appDockerPort = 3000;

const getHabiticaConfig = ({ mongoPort }: { mongoPort: number }) => ({
	'ACCOUNT_MIN_CHAT_AGE': '0',
	'ADMIN_EMAIL': 'you@example.com',
	'AMAZON_PAYMENTS_CLIENT_ID': '',
	'AMAZON_PAYMENTS_MODE': '',
	'AMAZON_PAYMENTS_MWS_KEY': '',
	'AMAZON_PAYMENTS_MWS_SECRET': '',
	'AMAZON_PAYMENTS_SELLER_ID': '',
	'AMPLITUDE_KEY': '',
	'AMPLITUDE_SECRET': '',
	'BASE_URL': `https://${testServices.app.subdomain}.tunneldev.test`,
	'CRON_SAFE_MODE': 'false',
	'CRON_SEMI_SAFE_MODE': 'false',
	'DISABLE_REQUEST_LOGGING': 'true',
	'EMAILS_COMMUNITY_MANAGER_EMAIL': 'admin@habitica.com',
	'EMAILS_PRESS_ENQUIRY_EMAIL': 'admin@habitica.com',
	'EMAILS_TECH_ASSISTANCE_EMAIL': 'admin@habitica.com',
	'EMAIL_SERVER_AUTH_PASSWORD': '',
	'EMAIL_SERVER_AUTH_USER': '',
	'EMAIL_SERVER_URL': '',
	'ENABLE_CONSOLE_LOGS_IN_PROD': 'false',
	'ENABLE_CONSOLE_LOGS_IN_TEST': 'false',
	'FACEBOOK_KEY': '',
	'FACEBOOK_SECRET': '',
	'FLAG_REPORT_EMAIL': 'email@example.com, email2@example.com',
	'GA_ID': 'GA_ID',
	'GOOGLE_CLIENT_ID': '123456789012345',
	'GOOGLE_CLIENT_SECRET': 'aaaabbbbccccddddeeeeffff00001111',
	'IAP_GOOGLE_KEYDIR': '/path/to/google/public/key/dir/',
	'IGNORE_REDIRECT': 'true',
	'ITUNES_SHARED_SECRET': '',
	'LOGGLY_CLIENT_TOKEN': '',
	'LOGGLY_SUBDOMAIN': '',
	'LOGGLY_TOKEN': '',
	'MAINTENANCE_MODE': 'false',
	'NODE_DB_URI':
		`mongodb://host.docker.internal:${mongoPort}/habitica-dev?directConnection=true`,
	'TEST_DB_URI':
		`mongodb://host.docker.internal:${mongoPort}/habitica-test?directConnection=true`,
	'MONGODB_POOL_SIZE': '10',
	'NODE_ENV': 'production',
	'PATH': 'bin:node_modules/.bin:/usr/local/bin:/usr/bin:/bin',
	'PAYPAL_BILLING_PLANS_basic_12mo': 'basic_12mo',
	'PAYPAL_BILLING_PLANS_basic_3mo': 'basic_3mo',
	'PAYPAL_BILLING_PLANS_basic_6mo': 'basic_6mo',
	'PAYPAL_BILLING_PLANS_basic_earned': 'basic_earned',
	'PAYPAL_BILLING_PLANS_google_6mo': 'google_6mo',
	'PAYPAL_CLIENT_ID': 'client_id',
	'PAYPAL_CLIENT_SECRET': 'client_secret',
	'PAYPAL_EXPERIENCE_PROFILE_ID': 'xp_profile_id',
	'PAYPAL_MODE': 'sandbox',
	'PLAY_API_ACCESS_TOKEN': '',
	'PLAY_API_CLIENT_ID': '',
	'PLAY_API_CLIENT_SECRET': '',
	'PLAY_API_REFRESH_TOKEN': '',
	'PORT': appDockerPort,
	'PUSH_CONFIGS_APN_ENABLED': 'false',
	'PUSH_CONFIGS_APN_KEY': '',
	'PUSH_CONFIGS_APN_KEY_ID': '',
	'PUSH_CONFIGS_APN_TEAM_ID': '',
	'PUSH_CONFIGS_FCM_SERVER_API_KEY': '',
	'S3_ACCESS_KEY_ID': '',
	'S3_BUCKET': '',
	'S3_SECRET_ACCESS_KEY': '',
	'SESSION_SECRET': 'YOUR SECRET HERE',
	'SESSION_SECRET_IV': '12345678912345678912345678912345',
	'SESSION_SECRET_KEY':
		'1234567891234567891234567891234567891234567891234567891234567891',
	'SITE_HTTP_AUTH_ENABLED': 'false',
	'SITE_HTTP_AUTH_PASSWORDS': 'password,wordpass,passkey',
	'SITE_HTTP_AUTH_USERNAMES': 'admin,tester,contributor',
	'SLACK_FLAGGING_FOOTER_LINK': '',
	'SLACK_FLAGGING_URL': '',
	'SLACK_SUBSCRIPTIONS_URL': '',
	'SLACK_URL': '',
	'STRIPE_API_KEY': '',
	'STRIPE_PUB_KEY': '',
	'STRIPE_WEBHOOKS_ENDPOINT_SECRET': '',
	'TRANSIFEX_SLACK_CHANNEL': 'transifex',
	'WEB_CONCURRENCY': 1,
	'SKIP_SSL_CHECK_KEY': 'key',
	'ENABLE_STACKDRIVER_TRACING': 'false',
	'APPLE_AUTH_PRIVATE_KEY': '',
	'APPLE_TEAM_ID': '',
	'APPLE_AUTH_CLIENT_ID': '',
	'APPLE_AUTH_KEY_ID': '',
	'BLOCKED_IPS': '',
	'LOG_AMPLITUDE_EVENTS': 'false',
	'RATE_LIMITER_ENABLED': 'false',
	'REDIS_HOST': '',
	'REDIS_PORT': '',
	'REDIS_PASSWORD': '',
	'TRUSTED_DOMAINS': 'https://habitica.tunneldev.test,https://habitica.com',
});

export const habitica = defineTestApp(testServices, {
	repo: 'HabitRPG/habitica',
	services: (context) => ({
		app: {
			dependsOn: [testServices.mongo.slug],
			dockerPort: appDockerPort,
			dockerfile: fromDockerfile(
				'Dockerfile-Dev',
				(dockerfile) => (dockerfile
					.replace(
						'\n\n',
						'\n\nENV NODE_ENV=production\n',
					)
					.replace(
						'RUN npm install -g gulp-cli mocha\n',
						'RUN npm install -g gulp-cli mocha http-server\n',
					)
					.replace(
						'COPY . /usr/src/habitica',
						// dprint-ignore
						outdent`
							$&
							RUN echo ${
								escapesh(JSON.stringify(getHabiticaConfig({
									mongoPort: getTestServicePort(context, testServices.mongo),
								})))
							} > config.json

							RUN sed -i 's/app.use(forceSSL);//' website/server/middlewares/index.js
						`,
					)
					.replace(
						'RUN npm install\n',
						'',
					)
					.replace(
						'RUN npm run postinstall',
						outdent`
							RUN sed -i 's/<head>/<head><script src="https:\\/\\/tunnel.test\\/__tunnel\\/script.js"><\\/script>/' website/client/public/index.html

							RUN npm install --dev
							RUN NODE_ENV=development npm run sprites
						`,
					)
					.replace(
						/$/,
						'CMD ["node", "website/transpiled-babel/index.js"]',
					)),
			),
			submodules: {
				'habitica-images': 'HabitRPG/habitica-images',
			},
			environment: {
				BASE_URL: `https://${testServices.app.subdomain}.tunneldev.test`,
			},
		},
		mongo: {
			dockerfile: 'mongo:3.6',
			dockerPort: 27_017,
		},
	}),
});
