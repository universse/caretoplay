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
