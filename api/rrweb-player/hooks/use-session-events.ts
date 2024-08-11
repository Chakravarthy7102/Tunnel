import type { ClientDoc } from '@-/client-doc';
import { getFileUrl } from '@-/file';
import { useEffect, useState } from 'react';

export function useSessionEventsFromFileDoc({
	sessionEventsFile,
	sessionEventsThumbnailFile,
}: {
	sessionEventsFile: ClientDoc<'File'> | null;
	sessionEventsThumbnailFile: ClientDoc<'File'> | null;
}) {
	const [sessionEvents, setSessionEvents] = useState<any[]>([]);
	const [sessionThumbnail, setSessionThumbnail] = useState<File | null>(null);

	useEffect(() => {
		const fetchSessionEventsFile = async () => {
			if (sessionEventsFile && sessionEvents.length === 0) {
				const sessionEventsFileResponse = await fetch(
					getFileUrl(sessionEventsFile),
				);

				const sessionEventsArray = await sessionEventsFileResponse.text().then((
					text,
				) =>
					// eslint-disable-next-line no-restricted-properties -- Guaranteed to be valid json
					JSON.parse(text)
				);

				if (sessionEventsArray.length > 1) {
					setSessionEvents(sessionEventsArray);
				}
			}
		};

		const fetchSessionEventsThumbnailFile = async () => {
			if (sessionEventsThumbnailFile) {
				const response = await fetch(getFileUrl(sessionEventsThumbnailFile));
				const blob = await response.blob();
				const sessionThumbnail = new File([blob], 'session-thumbnail.png', {
					type: 'image/png',
				});
				setSessionThumbnail(sessionThumbnail);
			}
		};

		void fetchSessionEventsFile();
		void fetchSessionEventsThumbnailFile();
	}, [sessionEventsFile, sessionEventsThumbnailFile]);

	return {
		sessionEvents,
		setSessionEvents,
		sessionThumbnail,
		setSessionThumbnail,
	};
}

export function useSessionEventsFromLocalFile({
	sessionEventsFile,
}: {
	sessionEventsFile: File | null;
}) {
	const [sessionEvents, setSessionEvents] = useState<any[]>([]);

	useEffect(() => {
		if (sessionEventsFile) {
			sessionEventsFile.text().then((text) => {
				// eslint-disable-next-line no-restricted-properties -- Guaranteed to be valid json
				const parsedSessionEvents = JSON.parse(text);
				setSessionEvents(parsedSessionEvents);
			}).catch((_error) => {
				// Log error using a more appropriate logging mechanism
				// For example, using a logging library or sending to an error tracking service
			});
		}
	}, [sessionEventsFile]);

	return { sessionEvents, setSessionEvents };
}
