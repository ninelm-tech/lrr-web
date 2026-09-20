import * as Sentry from '@sentry/nextjs';
import { resolveSentryEnvironment } from './app/lib/sentry-environment';

const isProd = process.env.NODE_ENV === 'production';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  environment: resolveSentryEnvironment(),

  integrations: [
    // send console.log, console.warn, and console.error calls as logs to Sentry
    Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
  ],

  tracesSampleRate: isProd ? 0.1 : 1.0,

  enableLogs: true,
});
