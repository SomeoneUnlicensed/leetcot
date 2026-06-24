import * as Sentry from '@sentry/nextjs';

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  debug: false,
  dsn,
  enabled: Boolean(dsn) && process.env.NODE_ENV === 'production',
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0,
  tracePropagationTargets: ['localhost:3000', 'leetcot.ru', /^\//],
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
});
