// @ts-check

const path = require('pathe');
// @ts-expect-error: works
const { getMonorepoDirpath } = require('get-monorepo-root');
const defaultTheme = require('tailwindcss/defaultTheme');

/**
	@returns {import('tailwindcss').Config}
*/
function getTailwindConfig() {
	const monorepoDirpath = getMonorepoDirpath(__dirname);

	if (monorepoDirpath === undefined) {
		throw new Error('Could not find monorepo root directory');
	}

	const content = [
		'api/comments/components',
		'api/integrations/components',
		'api/rrweb-player/components',
		'design/design-system/components',
		'products/webapp/components',
		'products/webapp/app',
		'products/webapp/sections',
		'products/tunnel-instance-page-toolbar/components',
	].map((basedir) =>
		path.join(monorepoDirpath, basedir, '**/*.{js,ts,jsx,tsx}')
	);

	return {
		content,
		darkMode: ['class'],
		theme: {
			container: {
				center: true,
				padding: '2rem',
				screens: {
					'2xl': '1400px',
				},
			},
			screens: {
				xs: '475px',
				...defaultTheme.screens,
			},
			extend: {
				colors: {
					'v2-soft': {
						200: 'rgba(255, 255, 255, 0.10)',
						400: '#7D7D7F',
						500: '#6c6c6e',
					},
					'v2-neutral': {
						900: '#18181B',
						800: '#171719',
						700: '#1E1E21',
						600: '#262629',
						500: '#515154',
						400: '#7D7D7F',
						300: '#A8A8A9',
						200: '#D4D4D4',
						100: '#E9E9EA',
						0: '#FAFAFA',
					},
					'v2-weak': {
						100: '#262629',
					},
					'v2-surface': {
						700: '#1E1E21',
					},
					'v2-main': {
						900: '#FAFAFA',
					},
					'v2-danger': {
						500: '#DF1C41',
					},
					'v2-sub': {
						500: '#515154',
					},
					'v2-primary': {
						'lighter': '#375DFB16',
						'light': '#C2D6FF',
						'base': '#375DFB',
						'dark': '#253EA7',
						'darker': '#162664',
					},
					'v2-red': {
						'base': '#DF1C41',
						'dark': '#AF1D38',
						'lighter': '#DF1C4129',
					},
					neutral: {
						900: '#18181B',
						800: '#171719',
						700: '#1E1E21',
						600: '#262629',
						500: '#515154',
						400: '#7D7D7F',
						300: '#A8A8A9',
						200: '#D4D4D4',
						100: '#E9E9EA',
						0: '#FAFAFA',
					},
					muratblue: {
						darker: '#162664',
						dark: '#253EA7',
						base: '#375DFB',
						light: 'C2D6FF',
						lighter: '#375DFB16',
					},
					muratred: {
						darker: '#710E21',
						dark: '#AF1D38',
						base: '#DF1C41',
						light: '#F8C9D2',
						lighter: '#DF1C4116',
					},
					//   weird figma shit
					strong: {
						900: '#18181B',
					},
					surface: { 700: '#1E1E21' },
					soft: { 400: '#7D7D7F', 200: '#D4D4D4' },
					weak: { 600: '#262629' },
					main: { 900: '#FAFAFA' },
					sub: {
						500: '#515154',
						300: '#A8A8A9',
					},
					disabled: {
						600: '#262629',
						100: '#E9E9EA',
					},
					//   end of weird figma shit
					border: 'hsl(var(--border))',
					input: 'hsl(var(--input))',
					ring: 'hsl(var(--ring))',
					background: 'hsl(var(--background))',
					foreground: 'hsl(var(--foreground))',
					tertiary: {
						DEFAULT: 'hsl(var(--tertiary))',
						border: 'hsl(var(--tertiary-border))',
					},
					primary: {
						DEFAULT: 'hsl(var(--primary))',
						foreground: 'hsl(var(--primary-foreground))',
					},
					secondary: {
						DEFAULT: 'hsl(var(--secondary))',
						foreground: 'hsl(var(--secondary-foreground))',
					},
					destructive: {
						DEFAULT: 'hsl(var(--destructive))',
						foreground: 'hsl(var(--destructive-foreground))',
					},
					muted: {
						DEFAULT: 'hsl(var(--muted))',
						foreground: 'hsl(var(--muted-foreground))',
					},
					accent: {
						DEFAULT: 'hsl(var(--accent))',
						foreground: 'hsl(var(--accent-foreground))',
					},
					popover: {
						DEFAULT: 'hsl(var(--popover))',
						foreground: 'hsl(var(--popover-foreground))',
					},
					card: {
						DEFAULT: 'hsl(var(--card))',
						foreground: 'hsl(var(--card-foreground))',
					},
					dropdown: {
						DEFAULT: 'hsl(var(--dropdown))',
					},
					brand: {
						foreground: 'hsl(var(--brand-foreground))',
						orange: 'hsl(var(--brand-orange))',
						salmon: 'hsl(var(--brand-salmon))',
						green: 'hsl(var(--brand-green))',
						blue: 'hsl(var(--brand-blue))',
						red: 'hsl(var(--brand-red))',
					},
					outline: {
						background: 'hsl(var(--outline-button-background))',
						border: 'hsl(var(--outline-button-border))',
					},
					'v2-background': 'hsl(var(--v2-background))',
				},

				borderRadius: {
					lg: `var(--radius)`,
					md: `calc(var(--radius) - 2px)`,
					sm: 'calc(var(--radius) - 4px)',
				},
				fontFamily: {
					sans: [...defaultTheme.fontFamily.sans],
				},
				boxShadow: {
					'v2-input':
						'0px 0px 0px 0.5px rgba(255, 255, 255, 0.08), 0px 0px 2px 2px rgba(0, 0, 0, 0.16) inset, 0px 1px 2px 0px rgba(16, 24, 40, 0.05)',
					'v2-input-focus':
						'0px 0px 0px 4px rgba(255, 255, 255, 0.16), 0px 0px 0px 2px rgba(0, 0, 0, 1), 0px 0px 2px 2px rgba(0, 0, 0, 0.16) inset',
					'v2-input-error':
						'0px 0px 0px 2px rgba(24, 24, 27, 1), 0px 0px 0px 4px rgba(223, 28, 65, 0.24)',
					'v2-input-error-focus':
						'0px 0px 0px 2px rgba(24, 24, 27, 1), 0px 0px 0px 4px rgba(223, 28, 65, 0.48)',
					'v2-card':
						'0px 0px 4px -2px rgba(0, 0, 0, 0.1), 0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 0px 0px 0.5px rgba(255, 255, 255, 0.16), 0px 12px 24px -4px rgba(0, 0, 0, 0.12), 0px 8px 16px -4px rgba(0, 0, 0, 0.12), 0px 4px 8px -2px rgba(0, 0, 0, 0.12);',
					'v2-button':
						'0px 1px 2px 0px rgba(82, 88, 102, 0.06), 0px 0px 0px 0.5px rgba(0, 0, 0, 1)',
					'v2-button-primary-focus':
						'0px 0px 0px 2px #18181B, 0px 0px 0px 4px rgba(55, 93, 251, 0.64)',
					'v2-button-secondary-focus':
						'0px 0px 0px 2px rgba(24, 24, 27, 1), 0px 0px 0px 4px rgba(255, 255, 255, 0.16)',
					'v2-button-important':
						`0px 1px 2px 0px rgba(82, 88, 102, 0.06), 0px 0px 0px 0.5px #000`,
					'v2-input-inline':
						'0px 0px 0px 0.5px rgba(255, 255, 255, 0.08), 0px 0px 2px 2px rgba(0, 0, 0, 0.16) inset, 0px 1px 2px 0px rgba(16, 24, 40, 0.05);',
					'v2-modal-primary':
						'0px 4px 8px -2px rgba(0, 0, 0, 0.12), 0px 8px 16px -4px rgba(0, 0, 0, 0.12), 0px 12px 24px -4px rgba(0, 0, 0, 0.12), 0px 24px 48px -4px rgba(0, 0, 0, 0.12), 0px 48px 96px -4px rgba(0, 0, 0, 0.12), 0px 0px 0px 1px rgba(255, 255, 255, 0.16), 0px 4px 6px -1px rgba(0, 0, 0, 0.10), 0px 2px 4px -2px rgba(0, 0, 0, 0.10);',
					'v2-dropdown-focus':
						'0px 0px 0px 4px rgba(255, 255, 255, 0.16), 0px 0px 0px 2px rgba(0, 0, 0, 1), 0px 0px 2px 2px rgba(0, 0, 0, 0.16) inset',
					'button-primary':
						`0px 1px 2px 0px rgba(55, 93, 251, 0.08), 0px 0px 0px 1px #19191D`,
					'button-focus-blue':
						`0px 0px 0px 2px #18181B, 0px 0px 0px 4px rgba(55, 93, 251, 0.64)`,
					'button-important':
						`0px 1px 2px 0px rgba(82, 88, 102, 0.06), 0px 0px 0px 1px #18181C`,
					'button-focus-important':
						`0px 0px 0px 2px #18181B, 0px 0px 0px 4px rgba(255, 255, 255, 0.16)`,
					'button-focus-error':
						`0px 0px 0px 2px #18181B, 0px 0px 0px 4px rgba(223, 28, 65, 0.24)`,
					'button-shadow-focus-dropdown':
						`0px 0px 0px 4px rgba(255, 255, 255, 0.16), 0px 0px 0px 2px #27272B, 0px 0px 2px 2px rgba(0, 0, 0, 0.16) inset`,
					'stroke-opacity-white':
						`0px 2px 4px -2px rgba(0, 0, 0, 0.10), 0px 4px 6px -1px rgba(0, 0, 0, 0.10), 0px 0px 0px 0.5px rgba(255, 255, 255, 0.10)`,
					'comment-shadow-primary':
						`0px 1px 3px 0px rgba(0, 0, 0, 0.50), 0px 0px 0.5px 0px rgba(255, 255, 255, 0.30) inset, 0px 3px 8px 0px rgba(0, 0, 0, 0.35), 0px 0.5px 0px 0px rgba(255, 255, 255, 0.08) inset`,
					'toolbar-container-shadow':
						`0px 2px 4px -2px #0000001A, 0px 4px 6px -1px #0000001A, 0px 0px 0px 0.5px #FFFFFF33`,
					'modal-primary':
						`0px 2px 4px -2px rgba(0, 0, 0, 0.10), 0px 4px 6px -1px rgba(0, 0, 0, 0.10), 0px 0px 0px 0.5px rgba(255, 255, 255, 0.16), 0px 48px 96px -4px rgba(0, 0, 0, 0.12), 0px 24px 48px -4px rgba(0, 0, 0, 0.12), 0px 12px 24px -4px rgba(0, 0, 0, 0.12), 0px 8px 16px -4px rgba(0, 0, 0, 0.12), 0px 4px 8px -2px rgba(0, 0, 0, 0.12)`,
					'stroke-input-inline':
						`0px 1px 2px 0px rgba(16, 24, 40, 0.05), 0px 0px 2px 2px rgba(0, 0, 0, 0.16) inset, 0px 0px 0px 0.5px rgba(255, 255, 255, 0.08)`,
					'radio-checkbox-shadow-default':
						`0px 2px 2px 0px rgba(27, 28, 29, 0.12)`,
					'radio-checkbox-shadow-disabled':
						`0px 2px 2px 0px rgba(15, 15, 16, 0.08) inset`,
					'radio-checkbox-shadow-active-bg':
						`0px 2px 2px 0px rgba(22, 38, 100, 0.32) inset`,
					'radio-checkbox-shadow-inner-active':
						`0px 2px 2px 0px rgba(27, 28, 29, 0.12), 0px -2px 3px 0px #CFD1D3 inset`,
					'radio-checkbox-shadow-inner-disabled':
						`0px 2px 2px 0px rgba(27, 28, 29, 0.12), 0px -2px 3px 0px #262629 inset`,
				},
				keyframes: {
					'accordion-down': {
						from: { height: '0' },
						to: { height: 'var(--radix-accordion-content-height)' },
					},
					'accordion-up': {
						from: { height: 'var(--radix-accordion-content-height)' },
						to: { height: '0' },
					},
					opacity: {
						from: { opacity: '0' },
						to: { opacity: '1' },
					},
					'caret-blink': {
						'0%,70%,100%': { opacity: '1' },
						'20%,50%': { opacity: '0' },
					},
				},
				animation: {
					'accordion-down': 'accordion-down 0.2s ease-out',
					'accordion-up': 'accordion-up 0.2s ease-out',
					opacity: 'opacity 0.6s ease-in',
					'caret-blink': 'caret-blink 1.25s ease-out infinite',
				},
			},
		},
		plugins: [
			// @ts-expect-error: No typings
			require('tailwindcss-animate'),
			require('tailwind-scrollbar'),
		],
	};
}

module.exports = getTailwindConfig();
