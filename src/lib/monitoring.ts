// src/lib/monitoring.ts
// Error tracking with Sentry, only when NEXT_PUBLIC_SENTRY_DSN is set. The SDK is loaded lazily so it
// never slows the first page. No personal data: no IPs, no request bodies, and query strings (which
// can hold phone numbers) are cut from URLs.

type SentryModule = typeof import("@sentry/browser");

const DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
let sentry: Promise<SentryModule | null> | null = null;

const stripQuery = (url: string) => url.split("?")[0];

function load(): Promise<SentryModule | null> {
  if (!DSN || typeof window === "undefined") return Promise.resolve(null);
  sentry ??= import("@sentry/browser")
    .then((Sentry) => {
      Sentry.init({
        dsn: DSN,
        environment: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV,
        dataCollection: { userInfo: false, cookies: false, httpHeaders: false, httpBodies: [], urlQueryParams: false },
        tracesSampleRate: 0,
        beforeBreadcrumb(crumb) {
          if (typeof crumb.data?.url === "string") crumb.data.url = stripQuery(crumb.data.url);
          return crumb;
        },
        beforeSend(event) {
          if (event.request?.url) event.request.url = stripQuery(event.request.url);
          delete event.request?.query_string;
          delete event.user;
          return event;
        },
      });
      return Sentry;
    })
    .catch(() => null);
  return sentry;
}

export function startMonitoring(): void {
  void load();
}

export function reportError(error: unknown): void {
  void load().then((Sentry) => Sentry?.captureException(error));
}
