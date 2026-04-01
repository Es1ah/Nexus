/**
 * Minimalist In-Memory Rate Limiter to prevent API abuse.
 * In a real production environment, this should wrap Redis/Upstash.
 */
const rateLimits = new Map<string, { count: number; lastRequest: number }>();

const MAX_REQUESTS_PER_WINDOW = 5; // Allow 5 deep audits
const WINDOW_MS = 60 * 60 * 1000; // Per 1 hour window

export function checkRateLimit(identifier: string): { allowed: boolean; remaining: number; resetMs: number } {
    const now = Date.now();
    const userLimit = rateLimits.get(identifier);

    if (!userLimit) {
        rateLimits.set(identifier, { count: 1, lastRequest: now });
        return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1, resetMs: now + WINDOW_MS };
    }

    // Reset window if expired
    if (now - userLimit.lastRequest > WINDOW_MS) {
        userLimit.count = 1;
        userLimit.lastRequest = now;
        return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1, resetMs: now + WINDOW_MS };
    }

    if (userLimit.count >= MAX_REQUESTS_PER_WINDOW) {
        return { allowed: false, remaining: 0, resetMs: userLimit.lastRequest + WINDOW_MS };
    }

    userLimit.count += 1;
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - userLimit.count, resetMs: userLimit.lastRequest + WINDOW_MS };
}
