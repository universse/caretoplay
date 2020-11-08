import * as firebase from 'firebase-admin'
import { NextApiRequest, NextApiResponse } from 'next'

!firebase.apps.length &&
  firebase.initializeApp({
    credential: firebase.credential.cert(
      JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    ),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  })

export default async function fetchQuizSet(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  try {
    const snapshot = await firebase
      .database()
      .ref(`quizSets/${req.query.quizSetKey}`)
      .once('value')

    res.status(200).json(snapshot.val() || {})
  } catch {
    res.status(404).json({ success: false })
  }
}
