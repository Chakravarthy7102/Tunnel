import React, {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useState,
} from 'react';

export const MentionList = forwardRef(
	(
		props: {
			items: {
				id: string;
				text: string;
				profileImageUrl: string;
			}[];
			[key: string]: any;
		},
		ref,
	) => {
		const [selectedIndex, setSelectedIndex] = useState(0);

		const selectItem = (index: number) => {
			const item = props.items[index];

			if (item) {
				props.command({ id: item.id, label: item.text });
			}
		};

		const upHandler = () => {
			setSelectedIndex(
				(selectedIndex + props.items.length - 1) % props.items.length,
			);
		};

		const downHandler = () => {
			setSelectedIndex((selectedIndex + 1) % props.items.length);
		};

		const enterHandler = () => {
			selectItem(selectedIndex);
		};

		useEffect(() => setSelectedIndex(0), [props.items]);

		useImperativeHandle(ref, () => ({
			onKeyDown({ event }: { event: KeyboardEvent }) {
				if (event.key === 'ArrowUp') {
					upHandler();
					return true;
				}

				if (event.key === 'ArrowDown') {
					downHandler();
					return true;
				}

				if (event.key === 'Enter') {
					enterHandler();
					return true;
				}

				return false;
			},
		}));

		return (
			<div className="items">
				{props.items.length > 0 ?
					(
						props.items.map((item, index) => (
							<button
								className={`item ${
									index === selectedIndex ? 'is-selected' : ''
								}`}
								key={item.id}
								onClick={() => {
									selectItem(index);
								}}
							>
								{item.text}
							</button>
						))
					) :
					<div className="item">No result</div>}
			</div>
		);
	},
);
