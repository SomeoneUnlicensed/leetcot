interface RateLimiterConfig {
  windowSize?: number;
  maxRequests?: number;
}

interface Bucket {
  count: number;
  resetAt: number;
}

const DEFAULT_WINDOW_MS = 60 * 60 * 1000;
const DEFAULT_MAX_REQUESTS = 30;
const SWEEP_INTERVAL_MS = 60 * 1000;

// In-memory fixed-window counters, per server process.
const buckets = new Map<string, Bucket>();
let lastSweep = Date.now();

function sweepExpired(now: number) {
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    if (now >= bucket.resetAt) buckets.delete(key);
  }
}

/**
 * Counts one request against `key`. Returns true when the request is over budget.
 * Pick keys carefully: at the event everyone sits behind the venue's single NAT address,
 * so anything a legitimate participant does should be keyed per user, not per IP.
 */
export const rateLimit = (key: string, config: RateLimiterConfig = {}) => {
  const { windowSize = DEFAULT_WINDOW_MS, maxRequests = DEFAULT_MAX_REQUESTS } = config;
  const now = Date.now();
  if (now - lastSweep > SWEEP_INTERVAL_MS) sweepExpired(now);

  const bucket = buckets.get(key);
  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowSize });
    return false;
  }

  if (bucket.count >= maxRequests) return true;
  bucket.count += 1;
  return false;
};

/** nginx overwrites X-Forwarded-For with the real peer address; take the first hop defensively. */
export const getClientIp = (forwardedFor: string | null): string => {
  const firstHop = forwardedFor?.split(',')[0];
  return firstHop ? firstHop.trim() || 'unknown' : 'unknown';
};
