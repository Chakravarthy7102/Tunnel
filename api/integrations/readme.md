# @-/integrations

## Representation in our database

In our database, personal OAuth integrations are "owned" by a `User` and not separate `OrganizationMember`s. By having `User`s own integrations, we can use one set of refresh tokens + access tokens. This means that if a user revokes the OAuth integration from the external service and then wants to relink it, we only need to update the tokens in a single source in our database. In contrast, if OAuth integrations are owned by separate `OrganizationMember`s, the user would need to relink their personal account for each separate `Organization` they're part of (since we would need to generate a new unique pair of tokens for each individual integration as we can't reuse the same refresh token in each `OrganizationMember` since they rotate).
