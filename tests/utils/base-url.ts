const DEFAULT_LOCAL_URL = 'http://localhost:3000'

function normalizeUrl(url: string): string {
  const trimmed = url.trim()
  if (!trimmed) {
    return DEFAULT_LOCAL_URL
  }
  const withoutTrailingSlash = trimmed.replace(/\/$/, '')
  if (!/^https?:\/\//i.test(withoutTrailingSlash)) {
    return `https://${withoutTrailingSlash}`.replace(/\/$/, '')
  }
  return withoutTrailingSlash
}

export function getE2EBaseUrl(): string {
  const candidate = process.env.E2E_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || DEFAULT_LOCAL_URL
  return normalizeUrl(candidate)
}
