export interface ClientErrorContext {
  source?: string
  path?: string
  [key: string]: any
}

export async function logClientError(error: unknown, context: ClientErrorContext = {}) {
  if (typeof window === 'undefined') return

  try {
    const err = error instanceof Error ? error : new Error(String(error))

    const payload = {
      name: err.name,
      message: err.message,
      // We send stack only for server-side observability; it will be stored in logs, not shown to users.
      stack: err.stack,
      context,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    }

    await fetch('/api/log-client-error', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
  } catch (logError) {
    console.error('Failed to log client error', logError)
  }
}
