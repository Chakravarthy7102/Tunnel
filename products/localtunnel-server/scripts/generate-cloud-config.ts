#!/usr/bin/env tsx

import { env } from '@-/env';
import { servicesConfig } from '@-/services-config';
import escapesh from 'escapesh';
import { outdent } from 'outdent';

const getNginxServerBlock = (
	{ domain, port }: { domain: string; port: number },
) => (outdent`
	server {
		listen ${port} ${port === 443 ? 'ssl' : ''};
		server_name ${domain};

		location / {
			proxy_pass http://127.0.0.1:${servicesConfig.localtunnelServer.port};
			proxy_http_version 1.1;
			proxy_set_header Upgrade $http_upgrade;
			proxy_set_header Connection 'upgrade';
			proxy_set_header Host $host;
			proxy_cache_bypass $http_upgrade;
		}
	}
`);

const nginxBlock = outdent`
	${getNginxServerBlock({ domain: 'tunnelapp.dev', port: 80 })}

	server {
		listen 443 ssl;
		server_name tunnelapp.dev;
		ssl_certificate /etc/letsencrypt/live/tunnelapp.dev/fullchain.pem;
		ssl_certificate_key /etc/letsencrypt/live/tunnelapp.dev/privkey.pem;

		location / {
			proxy_pass http://127.0.0.1:${servicesConfig.localtunnelServer.port};
			proxy_http_version 1.1;
			proxy_set_header Upgrade $http_upgrade;
			proxy_set_header Connection 'upgrade';
			proxy_set_header Host $host;
			proxy_cache_bypass $http_upgrade;
		}
	}

	${getNginxServerBlock({ domain: '*.tunnelapp.dev', port: 80 })}

	server {
		listen 443 ssl;
		server_name *.tunnelapp.dev;
		ssl_certificate /etc/letsencrypt/live/tunnelapp.dev/fullchain.pem;
		ssl_certificate_key /etc/letsencrypt/live/tunnelapp.dev/privkey.pem;

		location / {
			proxy_pass http://127.0.0.1:${servicesConfig.localtunnelServer.port};
			proxy_http_version 1.1;
			proxy_set_header Upgrade $http_upgrade;
			proxy_set_header Connection 'upgrade';
			proxy_set_header Host $host;
			proxy_cache_bypass $http_upgrade;
		}
	}

	${getNginxServerBlock({ domain: '*.staging.tunnelapp.dev', port: 80 })}

	server {
		listen 443 ssl;
		server_name *.staging.tunnelapp.dev;
		ssl_certificate /etc/letsencrypt/live/tunnelapp.dev/fullchain.pem;
		ssl_certificate_key /etc/letsencrypt/live/tunnelapp.dev/privkey.pem;

		location / {
			proxy_pass http://127.0.0.1:${servicesConfig.localtunnelServer.port};
			proxy_http_version 1.1;
			proxy_set_header Upgrade $http_upgrade;
			proxy_set_header Connection 'upgrade';
			proxy_set_header Host $host;
			proxy_cache_bypass $http_upgrade;
		}
	}
`;

const _certbotCommand = outdent`
	sudo certbot certonly --manual --preferred-challenges=dns --server https://acme-v02.api.letsencrypt.org/directory --agree-tos -d tunnelapp.dev -d '*.tunnelapp.dev' -d '*.staging.tunnelapp.dev'
`;

// dprint-ignore
export const getUserData = () => (outdent({ trimTrailingNewline: false })`
	#!/bin/bash

	cd

	sudo apt update
	sudo apt install -y certbot nginx python3-certbot-nginx

	echo ${
		escapesh(nginxBlock)
	} > /etc/nginx/sites-available/tunnelapp.dev
	sudo ln -sf /etc/nginx/sites-available/tunnelapp.dev /etc/nginx/sites-enabled/tunnelapp.dev
	rm -rf /etc/nginx/sites-enabled/default /etc/nginx/sites-available/default
	sudo nginx -t && sudo systemctl restart nginx

	echo ${escapesh(env('DIGITALOCEAN_PRIVATE_KEY'))} > ~/.ssh/id_rsa
	chmod 400 ~/.ssh/id_rsa
	ssh-keyscan github.com >> ~/.ssh/known_hosts

	curl -fsSL https://get.pnpm.io/install.sh | sh -
	source ~/.bashrc
	pnpm env use --global 20.10.0

	rm -rf Tunnel
	git clone -b release --single-branch git@github.com:Tunnel-Labs/Tunnel.git
	cd Tunnel

	cd ./products/localtunnel-server
	pnpm install --filter=@-/localtunnel-server...
	pnpm add -g tsx pm2

	pm2 start ecosystem.config.cjs
`);
