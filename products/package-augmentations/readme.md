# @-/package-augmentation

Rules of package augmentations:

- Augmentations must emit valid JavaScript syntax.
- Augmentations must emit code that "noop"s when Tunnel is not running.
- Augmentations must not alter the references of existing AST nodes. They may only add new AST nodes.
- Any new identifiers the augmentation introduces must be uniquely prefixed with the pattern `$$[ID]__` (e.g. if your augmentation ID is `tunnel`, then your unique prefix is `$$tunnel__`)
- Augmentation state should be stored on the global `TNL__.$$[ID]` object (e.g. `TNL__.$$.tunnel`)

Every augmentation will be passed the original, unmodified AST of the file. If multiple augmentations add new AST nodes in the same location, we add them in alphabetical order (in order to be deterministic).

If the file has already been augmented, we make sure to reset it before re-applying all the augmentations.
