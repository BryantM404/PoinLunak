// Rate limiting utility using in-memory store

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  limit: number;
  windowMs: number;
}

export async function rateLimit(
  identifier: string,
  config: RateLimitConfig = { limit: 5, windowMs: 60000 }
): Promise<{ success: boolean; remaining: number; resetTime: number }> {
  const now = Date.now();
  const key = identifier;

  if (!store[key] || store[key].resetTime < now) {
    store[key] = {
      count: 1,
      resetTime: now + config.windowMs,
    };
    return {
      success: true,
      remaining: config.limit - 1,
      resetTime: store[key].resetTime,
    };
  }

  if (store[key].count >= config.limit) {
    return {
      success: false,
      remaining: 0,
      resetTime: store[key].resetTime,
    };
  }

  store[key].count++;
  return {
    success: true,
    remaining: config.limit - store[key].count,
    resetTime: store[key].resetTime,
  };
}
