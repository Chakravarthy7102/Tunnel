import { cn } from '@-/design-system/v1';
import { useDrag } from '@use-gesture/react';
import { useEffect, useRef, useState } from 'react';

interface DraggableProps {
	className?: string;
	children: React.ReactNode;
	xPos?: number;
	yPos?: number;
	id?: string;
}
export function Draggable({
	className,
	children,
	xPos = 0,
	yPos = 0,
	id,
}: DraggableProps) {
	const [position, setPosition] = useState({
		x: (xPos / window.innerWidth) * 100,
		y: (yPos / window.innerHeight) * 100,
	});
	const [translate, setTranslate] = useState({ x: 0, y: 0 });

	const ref = useRef<HTMLDivElement>(null);

	const bind = useDrag(({ down, movement: [mx, my] }) => {
		if (down) {
			if (!ref.current) return;

			const newX = (position.x * window.innerWidth) / 100 + mx;
			const newY = (position.y * window.innerHeight) / 100 + my;

			const maxX = window.innerWidth - ref.current.offsetWidth / 2;
			const maxY = window.innerHeight - ref.current.offsetHeight;

			const adjustedX = Math.max(
				ref.current.offsetWidth / 2,
				Math.min(maxX, newX),
			);

			const adjustedY = Math.max(0, Math.min(maxY, newY));

			if (adjustedX !== newX) {
				mx = adjustedX > newX ?
					mx - (newX - adjustedX) :
					mx + (adjustedX - newX);
			}

			if (adjustedY !== newY) {
				my = adjustedY > newY ?
					my - (newY - adjustedY) :
					my + (adjustedY - newY);
			}

			setTranslate({ x: mx, y: my });
		} else {
			setTranslate({ x: 0, y: 0 });

			if (ref.current) {
				setPosition((prev) => {
					return {
						x: (((prev.x * window.innerWidth) / 100 + translate.x) /
							window.innerWidth) *
							100,
						y: (((prev.y * window.innerHeight) / 100 + translate.y) /
							window.innerHeight) *
							100,
					};
				});
			}
		}
	});

	useEffect(() => {
		let oldWidth = window.innerWidth;
		let oldHeight = window.innerHeight;

		const updatePosition = () => {
			const newWidth = window.innerWidth;
			const newHeight = window.innerHeight;

			setPosition((prev) => {
				const previousX = (prev.x * oldWidth) / 100;
				const previousY = (prev.y * oldHeight) / 100;
				let newX = (previousX * newWidth) / oldWidth;
				let newY = (previousY * newHeight) / oldHeight;

				if (ref.current) {
					const minX = ref.current.offsetWidth / 2;
					const maxX = newWidth - ref.current.offsetWidth / 2;
					const maxY = newHeight - ref.current.offsetHeight;

					newX = Math.max(minX, Math.min(maxX, newX));
					newY = Math.max(0, Math.min(maxY, newY));
				}

				return { x: (newX / newWidth) * 100, y: (newY / newHeight) * 100 };
			});

			oldWidth = newWidth;
			oldHeight = newHeight;
		};

		window.addEventListener('resize', updatePosition);

		return () => {
			window.removeEventListener('resize', updatePosition);
		};
	}, []);

	return (
		<div
			{...bind()}
			ref={ref}
			style={{
				position: 'fixed',
				top: `${position.y}%`,
				left: `${position.x}%`,
				transform:
					`translateX(-50%) translate(${translate.x}px, ${translate.y}px)`,
				transformOrigin: 'center',
				willChange: 'transform',
				cursor: 'pointer',
			}}
			className={cn(className)}
			id={id}
		>
			{children}
		</div>
	);
}
