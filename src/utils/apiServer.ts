import * as firebase from 'firebase-admin'

!firebase.apps.length &&
  firebase.initializeApp({
    credential: firebase.credential.cert(
      JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    ),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  })

async function fetchQuizSet(quizSetKey) {
  const snapshot = await firebase
    .database()
    .ref(`quizSets/${quizSetKey}`)
    .once('value')

  return snapshot.val()
}

export const apiServer = {
  fetchQuizSet,
}
