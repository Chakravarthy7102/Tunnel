# @-/client-doc

Invariant: If the CID of a document is present client-side, then the document should exist in the `$collections` array. However, only non-excluded and non-relations are guaranteed to be present in `$collections` through direct lookup by a `string` CID. For a more specific document type, you need to perform a lookup by a `Id<$TableName, $Selection>` type (which is a string at runtime).

## State updates

Because React's state updates are asynchronous, we structure our code to work well with asynchronous state updates.

Helper functions that need a state update should always return a _action_ function, which should be passed to `setState` by the caller.

Helper functions that update state on the server should accept a action function as its first argument, which will first called by `setState`. The callback to update the server state will be passed to the second parameter of `setState` so that it's triggered only after the client-side state is fully updated (this makes it possible for it to use the newly updated state from the action function).

## Pending actions

To make client-side updates work well with Convex's reactive hooks (e.g. `useQuery`), we use "pending actions" that are special actions which are always applied after state updates from a Convex hook.
