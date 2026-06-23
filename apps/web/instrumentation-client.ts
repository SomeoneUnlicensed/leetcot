import * as Sentry from '@sentry/nextjs';

Sentry.init({
  debug: false,
  dsn:
    process.env.NEXT_PUBLIC_SENTRY_DSN ||
    'https://1a8c02b6dccf19dcf66e19e8abe9a931@o4511575171530752.ingest.de.sentry.io/4511575183261776',
  enabled: process.env.NODE_ENV === 'production',
  environment:
    window.origin.includes('staging') || window.origin.includes('vercel.app')
      ? 'Staging'
      : 'Production',
  tracePropagationTargets: ['localhost:3000', /^\//],
  tracesSampleRate: 1,
});
