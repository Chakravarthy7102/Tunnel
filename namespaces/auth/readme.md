# @-/auth

We use WorkOS for user management. In preview deployments, we use the **Staging** environment as it works well with Convex Preview deployments, where the database is initially empty.

## WorkOS

When synchronizing state with WorkOS, we treat our database as the source of truth about users and organization memberships.

### Synchronizing our database users with WorkOS

If there's a user in our database that doesn't exist in WorkOS (i.e. the WorkOS user referenced by `workosUserId` can't be found), we use the `v.User_ensureWorkosUser` Convex action.

### Synchronizing WorkOS users with our database

Since a WorkOS user needs to exist for the user to authenticate in Tunnel, we only need to perform this synchronization when a user authenticates into our app:

1. If the user with the given WorkOS ID does not exist in our database, we try to lookup a user with the same email as the WorkOS user's email.
2. If a user with a matching email is found, we update it with the new WorkOS ID. Otherwise, we create a new database user based on the authenticated WorkOS user.

We shouldn't need to worry about double-creating WorkOS users because it's rare for a user to be authenticating simultaneously from two sessions.
