# @-/cli-storage

The Tunnel CLI storage contains global CLI state (e.g. authentication data).

```json
{
  "currentActorString": "User|0",
  "savedActors": {
    "User|1": {
      "accessToken": "secret1"
    },
    "User|2": {
      "accessToken": "secret2"
    },
    // ...
  }
}
```

Note that the CLI authentication state is synchronized with the browser state whenever possible (e.g. when using the wrapper command, switching an account in the browser will also switch the account in the CLI).

In local environments, we generally want to prefer saving state on the user's computer instead of on the browser so that the user can switch between browsers while maintaining the same Tunnel settings.
