import * as firebase from 'firebase-admin'
import { NextApiRequest, NextApiResponse } from 'next'

!firebase.apps.length &&
  firebase.initializeApp({
    credential: firebase.credential.cert(
      JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    ),
    databaseURL: 'https://caretoplay-dev.firebaseio.com',
  })

export default async function saveQuizSetData(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const { quizSetKey, quizSetData } = req.body

  try {
    await firebase.database().ref(`quizSets/${quizSetKey}`).set(quizSetData)
    res.status(200).json({ success: true })
  } catch {
    res.status(404).json({ success: false })
  }
}
