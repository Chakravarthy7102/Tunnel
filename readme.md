# Tunnel

> This repository is a shallow copy (no git history) of the private version in the [@Tunnel-Labs](https://github.com/Tunnel-Labs) GitHub organization.

To clone the Tunnel repository, you will need to install and set up [Git](https://git-scm.org). All the other dependencies in Tunnel will get auto-installed using [pkgx](https://pkgx.sh).

Once you have Git installed, download and set up the repo by running the following commands:

```sh
git clone git@github.com:Tunnel-Labs/Tunnel && cd Tunnel

# Installs pkgx
curl -fsS https://pkgx.sh | sh

# Integrates pkgx into your shell
pkgx integrate

# ------------------------------------------------------------ #
# Open a new terminal for the pkgx integrations to take effect #
# ------------------------------------------------------------ #

# Installs pkgx dependencies for Tunnel
dev

# Install dependencies and runs Tunnel's setup script
pnpm install && pnpm run setup
```

We use local `.test` domains in development.

## CI/CD

### `main` branch

When a change is pushed to main, we build and publish a new version of `@tunnel/cli-source` and then push to the `release` branch to trigger a webapp deployment that reflects the new `@tunnel/cli-source` version.

### @tunnel/cli-single-executable-application

To release a new version of `@tunnel/cli-single-executable-application`, the [Build and publish @tunnel/cli-single-executable-application](https://github.com/Tunnel-Labs/Tunnel/actions/workflows/build-and-publish-tunnel-cli-single-executable-application.yaml) workflow should be triggered manually. When this workflow completes, it will also trigger a push to `release` with the newly updated `@tunnel/cli-single-executable-application` version to be reflected by the webapp.

### @tunnel/cli

To release a new version of `@tunnel/cli`, the [Build and publish @tunnel/cli](https://github.com/Tunnel-Labs/Tunnel/actions/workflows/build-and-publish-tunnel-cli.yaml) workflow should be triggered manually.
