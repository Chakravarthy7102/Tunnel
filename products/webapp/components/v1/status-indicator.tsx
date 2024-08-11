export function StatusIndicator({
	total,
	value,
	width,
	completed,
	reversed,
}: {
	total: number;
	value: number;
	width: number;
	completed: boolean;
	reversed?: boolean;
}) {
	const radius = width / 2 - 5;
	const circumference = 2 * Math.PI * radius;
	const fill = reversed ?
		((total - value) / total) * circumference :
		(value / total) * circumference;

	return (
		<svg width={width} height={width}>
			<circle
				cx={width / 2}
				cy={width / 2}
				r={radius}
				fill="none"
				stroke={completed ? '#4299e1' : '#fff'} // bg-blue-500
				strokeWidth="2"
			/>
			<circle
				cx={width / 2}
				cy={width / 2}
				r={radius}
				fill="none"
				stroke="#4299e1" // bg-blue-500
				strokeWidth="2"
				strokeDasharray={`${fill} ${circumference}`}
				transform={`rotate(-90 ${width / 2} ${width / 2})`}
			/>
		</svg>
	);
}
