import { defineTestApp } from '#utils/app.ts';
import { declareTestServices } from '#utils/service.ts';
import { Dockerfile } from 'js-dockerfile';
import { outdent } from 'outdent';

const testServices = declareTestServices({
	candybox2: {
		subdomain: 'candybox2',
	},
});

export const candybox2 = defineTestApp(testServices, {
	repo: 'candybox2/candybox2.github.io',
	services: () => ({
		candybox2: {
			dockerPort: 3000,
			dockerfile() {
				const d = Dockerfile.create();

				// Setup
				d.FROM('node:20');
				d.RUN(outdent`
					apt-get update && \\
					apt-get install -y \\
					python3 \\
					python3-pip \\
					default-jre \\
					default-jdk \\
					p7zip-full \\
					&& apt-get clean \\
					&& rm -rf /var/lib/apt/lists/*
				`);
				d.RUN(outdent`
					ln -s /usr/bin/python3 /usr/bin/python
				`);
				d.RUN('npm install -g typescript yuicompressor http-server');
				d.WORKDIR('/root');
				d.COPY('.', '.');
				d.RUN('./compile.sh');

				// Adding the Tunnel <script> tag
				d.RUN(outdent`
					sed -i 's/<head>/<head><script src="https:\\/\\/tunnel.test\\/__tunnel\\/script.js"><\\/script>/' index.html
				`);

				d.CMD('http-server -p 3000');

				return d.toString();
			},
		},
	}),
});
