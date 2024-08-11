# Forge App

## Initialization

Developing the Forge app needs you to install the Forge CLI globally.

```shell
pnpm add -g @forge/cli
```

Once you've installed the CLI, you need to create a new Atlassian API Token. To do that, navigate to [your Atlassian profile's API Tokens page](https://id.atlassian.com/manage-profile/security/api-tokens) and press the "Create API Token" button.

Once you've copied the API token to your clipboard, type the following in a terminal to log into the Forge CLI:

```shell
forge login
```

You'll be prompted for your Atlassian email, and then paste in the API key you created in the previous step when it prompts for your Atlassian API token.

> **Note:** If you aren't able to login, you can alternatively create an `env.local` file in the root of the `@-/forge-app` package. It should contain your Atlassian email and Forge API token in the following format:

```env
FORGE_EMAIL=<your Atlassian email>
FORGE_API_TOKEN=<your Forge API token>
```

Then, to deploy a development instance of your Forge app to your Atlassian account, run the following command:

```shell
pnpm forge-app/deploy
```

## Configure Page

TODO

## Web Trigger

Read more about web triggers [here](https://developer.atlassian.com/platform/forge/manifest-reference/modules/web-trigger/).
