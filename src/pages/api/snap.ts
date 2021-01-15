import * as firebase from 'firebase-admin'
import { NextApiRequest, NextApiResponse } from 'next'

!firebase.apps.length &&
  firebase.initializeApp({
    credential: firebase.credential.cert(
      JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    ),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  })

export default async function complete(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.body.type === 'stream') {
    const { events, session } = req.body

    let pageCount = 0
    const eventCount = events.length
    const startedAt = events[0].timestamp
    const duration = events[eventCount - 1].timestamp - startedAt

    for (const event of events) {
      if (event.type === 'view page') {
        pageCount = pageCount + 1
      }

      event.timestamp = event.timestamp / 1000
    }

    session.createdAt = new Date(session.createdAt).toUTCString()
    session.startedAt = new Date(startedAt).toUTCString()
    session.duration = duration / 1000
    session.pageCount = pageCount
    session.latency = session.latency / 1000
    session.pageLoad = session.pageLoad / 1000
    session.eventCount = eventCount
    session._timestamp = firebase.database.ServerValue.TIMESTAMP
    session.events = events

    try {
      await firebase.database().ref('stats/sessions').push(session)

      res.status(200).json({ success: true })
    } catch {
      res.status(500).json({ success: false })
    }
  } else if (req.body.type === 'error') {
    const { error, componentStack } = req.body

    try {
      await firebase
        .database()
        .ref('stats/errors')
        .push({ error, componentStack })

      res.status(200).json({ success: true })
    } catch {
      res.status(500).json({ success: false })
    }
  } else {
    const { quizSetKey, type } = req.body

    const path = quizSetKey
      ? `quizSets/${quizSetKey}/${type}`
      : `overview/${type}`

    return new Promise((resolve) => {
      firebase
        .database()
        .ref(`stats/${path}Count`)
        .transaction(
          (count) => count + 1,
          (error) => {
            if (error) {
              res.status(500).json({ success: false })
            } else {
              res.status(200).json({ success: true })
            }
            resolve()
          }
        )
    })
  }
}
