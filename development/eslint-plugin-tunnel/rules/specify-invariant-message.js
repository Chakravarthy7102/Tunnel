module.exports = {
	meta: {
		messages: {
			missingMessage:
				'A message should be specified for `invariant(condition, message)` calls.',
		},
	},
	create(context) {
		return {
			CallExpression(node) {
				if (
					node.callee?.type === 'Identifier' &&
					node.callee.name === 'invariant' &&
					node.arguments?.length !== 2
				) {
					context.report({
						node,
						messageId: 'missingMessage',
					});
				}
			},
		};
	},
};
