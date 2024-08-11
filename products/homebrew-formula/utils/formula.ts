import type { HomebrewBottle } from '#types';
import { getOctokit } from '@-/octokit';
import indentString from 'indent-string';
import { outdent } from 'outdent';

export function getTunnelCliSingleExecutableApplicationFormula({
	version,
	targets,
	bottles,
}: {
	version: string;
	targets: {
		'darwin-arm64': {
			sha256Hash: string;
		};
		'darwin-x64': {
			sha256Hash: string;
		};
		'linux-x64': {
			sha256Hash: string;
		};
		'linux-arm64': {
			sha256Hash: string;
		};
	};
	bottles: Record<string, HomebrewBottle> | null;
}) {
	// dprint-ignore
	const maybeBottlesEntry =
		bottles === null ?
			'' :
		indentString(
			outdent({
				trimLeadingNewline: false,
				trimTrailingNewline: false
			})`
				bottle do
					root_url "https://github.com/Tunnel-Labs/homebrew-tunnel/releases/download/v${version}"
				${
					Object.entries(bottles)
						.map(([target, { sha256Hash }]) =>
							`\tsha256 cellar: :any, ${target}: ${JSON.stringify(sha256Hash)}`
						)
						.join('\n')
				}
				end
			`,
			1,
			{ indent: '\t' }
		);

	return outdent`
		class TunnelCli < Formula
			desc "Tunnel CLI"
			homepage "https://tunnel.dev"
			version ${JSON.stringify(version)}
			depends_on :macos
		${maybeBottlesEntry}
			on_macos do
				if Hardware::CPU.arm?
					url "https://registry.npmjs.org/@tunnel/cli-single-executable-application-darwin-arm64/-/cli-single-executable-application-darwin-arm64-${version}.tgz"
					sha256 ${JSON.stringify(targets['darwin-arm64'].sha256Hash)}

					def install
						bin.install "tunnel"
					end
				end
				if Hardware::CPU.intel?
					url "https://registry.npmjs.org/@tunnel/cli-single-executable-application-darwin-x64/-/cli-single-executable-application-darwin-x64-${version}.tgz"
					sha256 ${JSON.stringify(targets['darwin-x64'].sha256Hash)}

					def install
						bin.install "tunnel"
					end
				end
			end

			on_linux do
				if Hardware::CPU.arm? && Hardware::CPU.is_64_bit?
					url "https://registry.npmjs.org/@tunnel/cli-single-executable-application-linux-arm64/-/cli-single-executable-application-linux-arm64-${version}.tgz"
					sha256 ${JSON.stringify(targets['linux-arm64'].sha256Hash)}

					def install
						bin.install "leaf"
					end
				end
				if Hardware::CPU.intel?
					url "https://registry.npmjs.org/@tunnel/cli-single-executable-application-linux-x64/-/cli-single-executable-application-linux-x64-${version}.tgz"
					sha256 ${JSON.stringify(targets['linux-x64'].sha256Hash)}

					def install
						bin.install "leaf"
					end
				end
			end
		end
	`;
}

export async function updateFormulaFileOnGithub({
	formula,
}: {
	formula: string;
}) {
	const octokit = getOctokit();

	await octokit.createOrUpdateTextFile({
		owner: 'Tunnel-Labs',
		repo: 'homebrew-tunnel',
		path: 'tunnel-cli.rb',
		content: formula,
		message: 'Update tunnel-cli.rb',
	});
}
