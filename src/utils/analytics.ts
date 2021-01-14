import { restRequest } from '../../nodeUtils/restRequest'

type EventTypes = 'error' | 'view page'

const events = []

if (typeof window === 'object') {
  const session = {
    createdAt: Date.now(),
    ref: document.referrer,
    userAgent: navigator.userAgent,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  }

  events.push({
    type: 'visit',
    timestamp: Date.now(),
    properties: { url: window.location.href },
  })

  window.addEventListener('pagehide', endSession, { once: true })
  window.addEventListener('beforeunload', endSession, { once: true })
  window.addEventListener('unload', endSession, { once: true })

  let sent = false

  function endSession() {
    function isBot(userAgent) {
      return /bot|crawler|spider|crawling/i.test(userAgent)
    }

    if (isBot(session.userAgent) || sent) return
    sent = true

    const {
      fetchStart,
      loadEventEnd,
      responseEnd,
    } = window.performance.getEntriesByType('navigation')[0]

    session.latency = responseEnd - fetchStart
    session.pageLoad = loadEventEnd - fetchStart

    const body = { type: 'stream', session, events }
    const endpoint = '/api/snap'

    if (window.navigator.sendBeacon) {
      window.navigator.sendBeacon(
        endpoint,
        new Blob([JSON.stringify(body)], { type: 'application/json' })
      )
    } else {
      restRequest(endpoint, { body, keepalive: true })
    }
  }
}

export function log(type: EventTypes, properties) {
  process.env.NODE_ENV === 'development' && console.log({ type, properties })

  events.push({
    timestamp: Date.now(),
    type,
    properties,
  })
}

export function logError({ error, componentStack }) {
  log('error', { error, componentStack })
}
