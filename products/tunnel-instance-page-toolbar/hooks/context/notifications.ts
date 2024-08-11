import type {
	Notification,
	PageToolbarContext,
	PageToolbarState,
} from '#types';

export function useContextNotifications({
	context,
}: {
	context: PageToolbarContext;
}) {
	const addNotification = {
		action(
			{ notification }: { notification: Notification },
		): <$State extends PageToolbarState>(state: $State) => $State {
			setTimeout(() => {
				context.store.setState(
					removeNotification.action({ notificationId: notification.id }),
				);
			}, 5000);

			return (state) => ({
				...state,
				notifications: [...state.notifications, notification],
			});
		},
	};

	const removeNotification = {
		action({
			notificationId,
		}: {
			notificationId: string;
		}): <$State extends PageToolbarState>(state: $State) => $State {
			return (state) => ({
				...state,
				notifications: state.notifications.filter(
					(notification) => notification.id !== notificationId,
				),
			});
		},
	};

	return {
		addNotification,
		removeNotification,
	};
}
