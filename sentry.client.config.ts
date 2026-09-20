import * as Sentry from '@sentry/nextjs';
import { resolveSentryEnvironment } from './app/lib/sentry-environment';

const isProd = process.env.NODE_ENV === 'production';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  environment: resolveSentryEnvironment(),

  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
    // send console.log, console.warn, and console.error calls as logs to Sentry
    Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
  ],

  // 10% of sessions in prod; 100% in dev/staging for full visibility
  tracesSampleRate: isProd ? 0.1 : 1.0,

  // Session replay: 10% normal, 100% on error
  replaysSessionSampleRate: isProd ? 0.1 : 1.0,
  replaysOnErrorSampleRate: 1.0,

  enableLogs: true,
});
