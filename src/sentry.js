// sentry.js

import * as Sentry from '@sentry/react';
import { Replay } from '@sentry/replay';

Sentry.init({
	dsn: "https://e54ecf7d07c5db869630d681ec83d095@o312515.ingest.us.sentry.io/4508330540859392",
	environment: import.meta.env.VITE_SENTRY_ENVIRONMENT,
	ignoreErrors: [
		"ResizeObserver loop limit exceeded",
		"Non-Error promise rejection captured",
	],
	enabled: import.meta.env.PROD ?? true,
	replaysOnErrorSampleRate: 1,
	integrations: [
		new Replay({
			maskAllText: true,
		}),
	],
});

export default Sentry;
