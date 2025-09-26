const sanitizeSeed = (seed: string): string => seed.replace(/[^a-zA-Z0-9_-]/g, "_");

const stableDigest = (params: Readonly<Record<string, string>>): string => {
  return Object.keys(params)
    .sort()
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key] ?? "")}`)
    .join("&");
};

const hashString = (input: string): string => {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const chr = input.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
};

export class IdempotencyKeyManager {
  compute(prefix: string, seed: string, params: Readonly<Record<string, string>>): string {
    const digest = hashString(stableDigest(params));
    return `${prefix}_${sanitizeSeed(seed)}_${digest}`;
  }

  static fixed(prefix: string, identifier: string): string {
    return `${prefix}_${sanitizeSeed(identifier)}`;
  }
}

export const idempotencyKeyManager = new IdempotencyKeyManager();



