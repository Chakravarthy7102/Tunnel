import type { PageToolbarContext } from '#types';

export function LogoSection(_props: { context: PageToolbarContext }) {
	return (
		<div className="h-8 w-8 flex justify-center items-center">
			<svg
				width="16"
				height="16"
				viewBox="0 0 16 16"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					fillRule="evenodd"
					clipRule="evenodd"
					d="M8 0C3.58172 0 0 3.58172 0 8V15.8413C0 15.9288 0.0709238 15.9997 0.158413 15.9997L2.18799 15.9997V8.25117C2.18799 5.06019 4.77479 2.47339 7.96577 2.47339C11.1567 2.47339 13.7435 5.06019 13.7435 8.25116V15.9997L15.8416 15.9997C15.9291 15.9997 16 15.9288 16 15.8413V8C16 3.58172 12.4183 0 8 0Z"
					fill="white"
				/>
				<path
					d="M10.3608 7.41005C10.7248 7.41005 10.9597 7.03373 10.7361 6.74657C10.6374 6.61986 10.529 6.49939 10.4114 6.38628C9.76049 5.76052 8.87991 5.41121 7.96334 5.41519C7.04678 5.41918 6.16932 5.77613 5.52399 6.40752C5.41473 6.51442 5.31364 6.62771 5.2211 6.74647C4.99736 7.03361 5.23234 7.41005 5.59636 7.41005H7.97845H10.3608Z"
					fill="white"
				/>
				<rect
					x="4.46582"
					y="9.70416"
					width="7.02505"
					height="1.99489"
					rx="0.5"
					fill="white"
				/>
				<rect
					x="4.46582"
					y="13.9932"
					width="7.02505"
					height="1.99489"
					rx="0.5"
					fill="white"
				/>
			</svg>
		</div>
	);
}
