import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://8cdcf62bfa788d561b31a9cad35c3ee7@o4511228495921152.ingest.us.sentry.io/4511228501688320",

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
