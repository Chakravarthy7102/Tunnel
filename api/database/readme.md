# @-/database

If a field can be null, we should always use `vNullable` instead of `v.optional()`; `v.optional()` should only be used in the implementation of `vNew` and `vDeprecated`.

## File Structure

Tables use PascalCase in order to reflect their actual name. This makes it easier to auto-generate migrations for adding/removing fields.

## Migrations

Migrations are run asynchronously and only after production has been swapped. Most migrations should only consist of either populating fields with default values or setting all values of a field to undefined so it can be safely removed from the schema.

## Schema changes

In order to have zero-downtime deployments, Convex schema changes and data migrations must be fully backwards compatible.

> This [blog post](https://stack.convex.dev/intro-to-migrations) by Convex provides more information about database migrations.

### Adding new fields

Newly added fields should use the `vNew` validator, which uses `v.optional` to make the field optional.

> New fields must be optional because the logic in production currently inserts documents without this field (thus, if the field were mandatory, it would break `db.insert()` calls in production).

However, application logic that writes to the database should never leave this field blank, which will be enforced by the types of `dbInsert` and `dbPatch`. But, application logic that reads from the database should handle the case where this field is empty.

The `vNew` validator function takes in the type of a "deferred migration" function as a generic type parameter. This migration function should be a `protectedMutation` that asynchronously populates the field with values.

> This migration will not yet be run until production is swapped with application logic that always includes a value for the new field. This way, once the migration is executed, we guarantee that all the documents in the database will contain this field and can be safely changed to non-optional.

When this new schema is swapped into production, a new PR should be created that removes the `vNew` around the field to make it non-optional. This PR also changes the "deferred migration" to a "pending migration" that will be run during CI/CD. Any logic that checks if the field is empty should also be removed in this PR.

> This PR needs to be created manually for now, but we have plans to semi-automate the creation of this PR.

### Removing a field

To remove a field, the field must first be deprecated using `vDeprecated`, which uses `v.optional` to make the field optional. Fields cannot be removed immediately, as the logic in production currently inserts documents with this field (thus, if the field were removed, it would break `db.insert()` calls in production).

Deprecated fields should be treated as read-only in the application logic. Database insert calls should not insert a value for these deprecated fields, which will be enforced by the types of `dbInsert` and `dbPatch`.

The `vDeprecated` validator function takes the type of the deprecated field and the type of a "deferred migration" function as generic type parameters. This migration function should be a `protectedMutation` that asynchronously removes the field from existing documents (by setting it to `undefined`).

> This migration will not yet be run until production is swapped with application logic that always leaves the new field empty. This way, once the migration is executed, we guarantee that this field will be empty for all documents in the database, and can be safely removed from theschema.

When this new schema is swapped into production, a new PR should be created that removes any `vDeprecated` fields and selections. This PR also changes the "deferred migration" to a "pending migration" that will be run during CI/CD.

> This PR needs to be created manually for now, but we have plans to semi-automate the creation of this PR.

### Renaming a field

Renaming a field requires using `vNew` to add a new field with the new name and using `vDeprecated` to deprecate the current field with the existing name.

### Changing the type of a field

To change the type of a field, you should rename the field by appending an underscore with the new type (e.g. `windowMetadata` -> `windowMetadata_`), and then follow the workflow for [renaming a field](#renaming-a-field).

> It's likely possible to improve this workflow using a `v.union` in the future, but this will require handling edge cases like changing a field's type from a value to a virtual, or vice versa.
