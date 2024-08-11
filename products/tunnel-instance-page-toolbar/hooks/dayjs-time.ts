import { dayjs } from '@tunnel/dayjs';
import { useEffect, useState } from 'react';

export function useDayjsTime(time: number) {
	const [timeString, setTimeString] = useState(dayjs(time).fromNow());

	useEffect(() => {
		const interval = setInterval(() => {
			setTimeString(dayjs(time).fromNow());
		}, 30_000);

		return () => {
			clearInterval(interval);
		};
	}, [time]);

	return timeString;
}

export default useDayjsTime;
