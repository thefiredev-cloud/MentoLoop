type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const isProd = typeof process !== 'undefined' && process.env.NODE_ENV === 'production'

function log(level: LogLevel, ...args: unknown[]) {
  // In production, suppress debug and info to keep logs clean
  if (isProd && (level === 'debug' || level === 'info')) return
  // Map level to a concrete console method
  const methodMap = {
    debug: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
  } as const
  methodMap[level](...args)
}

export const logger = {
  debug: (...args: unknown[]) => log('debug', ...args),
  info: (...args: unknown[]) => log('info', ...args),
  warn: (...args: unknown[]) => log('warn', ...args),
  error: (...args: unknown[]) => log('error', ...args),
}

export default logger
