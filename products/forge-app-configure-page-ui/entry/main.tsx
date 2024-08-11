import '#styles/main.css';
import { view } from '@forge/bridge';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app.tsx';

void view.theme.enable();

const rootElement = document.querySelector('#root') as Element;
if (!rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(
		<React.StrictMode>
			<App />
		</React.StrictMode>,
	);
}
