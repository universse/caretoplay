const session = {
  createdAt: Date.now(),
  ref: document.referrer,
  userAgent: navigator.userAgent,
  language: navigator.language,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
}

const events = []

function log(type, properties) {
  process.env.NODE_ENV === 'development' && console.log({ type, properties })

  events.push({
    timestamp: Date.now(),
    type,
    properties,
  })
}

// end session
let sent = false
// const endpoint = `${Endpoints.FIRE}/int`
const key = 'int'

function send(data) {
  const request = new XMLHttpRequest()
  request.open('POST', endpoint)
  request.setRequestHeader('Content-Type', 'application/json')
  request.send(data)
}

function isBot(userAgent) {
  return /bot|crawler|spider|crawling/i.test(userAgent)
}

function endSession() {
  if (isBot(session.userAgent) || sent) return
  sent = true

  const {
    fetchStart,
    loadEventEnd,
    responseEnd,
  } = window.performance.getEntriesByType('navigation')[0]
  session.latency = responseEnd - fetchStart
  session.pageLoad = loadEventEnd - fetchStart

  const data = JSON.stringify({ session, events })

  try {
    const beacon = window.navigator.sendBeacon(
      endpoint,
      new Blob([data], { type: 'application/json' })
    )
    if (!beacon) throw new Error()
  } catch {
    const iOS =
      !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform)
    const google = window.navigator.vendor.includes('Google')

    if (iOS || google) {
      return setItem(key, data)
    }

    send(data)

    const latency = session.latency || 0
    const t = Date.now() + Math.max(300, latency + 200)
    while (Date.now() < t) {}
  }
}

const once = { once: true }
window.addEventListener('pagehide', endSession, once)
window.addEventListener('beforeunload', endSession, once)
window.addEventListener('unload', endSession, once)

const EventTypes = {
  CLICK_CHAT: 'click chat',
  CLICK_CTA: 'click CTA',
  CLICK_LEARNING_RESOURCE: 'click learning resource',
  CLICK_SEARCH_RESULT: 'click search result',
  CLICK_SIGN_UP: 'click sign up',
  CLICK_TAG: 'click tag',
  CLICK_TAG_FILTER: 'click tag filter',
  ERROR: 'error',
  INPUT_SEARCH: 'input search',
  SIGN_UP_INTENT: 'show signup intent',
  SORT_DIFFICULTY: 'sort by difficulty',
}

// export function logUser(uid) {
//   session.uid = uid
// }

export function logClickAction({ id, action }) {
  log(action, { id })
}

export function logClickChat(location) {
  log(EventTypes.CLICK_CHAT, { location })
}

export function logClickCTA() {
  log(EventTypes.CLICK_CTA)
}

export function logError({ error, componentStack }) {
  log(EventTypes.ERROR, { error, componentStack })
}
