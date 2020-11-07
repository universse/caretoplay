import firebase from 'firebase/app'
import 'firebase/database'
import { customAlphabet } from 'nanoid'

const nanoid = customAlphabet('1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ', 12)
// import 'firebase/auth'

function getFirebaseApp() {
  if (typeof window === 'undefined') return

  firebase.initializeApp(JSON.parse(process.env.NEXT_PUBLIC_FIREBASE_PROJECT))

  const database = firebase.database()

  function subscribeToConnectionStatus(callback) {
    const connectedRef = database.ref('.info/connected')

    connectedRef.on('value', function (snapshot) {
      callback(snapshot.val())
    })

    return connectedRef.off()
  }

  function fetchQuizSet(quizSetKey) {
    return database
      .ref(`quizSets/${quizSetKey}`)
      .once('value')
      .then((snapshot) => snapshot.val())
  }

  function saveQuizSetData(quizSetKey, quizSetData) {
    return database.ref(`quizSets/${quizSetKey}`).set(quizSetData)
  }

  function createQuizSet() {
    const quizSetKey = nanoid()
    return saveQuizSetData(quizSetKey, { status: 'new' }).then(() => quizSetKey)
  }

  return {
    subscribeToConnectionStatus,
    createQuizSet,
    fetchQuizSet,
    saveQuizSetData,
  }
}

export const firebaseApp = getFirebaseApp()

// const auth = firebase.auth()

// export function getUser() {
//   return new Promise((resolve, reject) => {
//     const unsubscribe = auth.onAuthStateChanged((user) => {
//       unsubscribe()
//       resolve(user && user.uid)
//     }, reject)
//   })
// }

// export async function sendSignInLinkToEmail(email, redirect = '/') {
//   return auth.sendSignInLinkToEmail(email, {
//     url: `${global.location.origin}/welcome?redirect_to=${encodeURIComponent(
//       redirect
//     )}`,
//     handleCodeInApp: true,
//   })
// }

// export async function isSignInWithEmailLink(href) {
//   if (auth.isSignInWithEmailLink(href)) {
//     return true
//   }
//   throw new Error()
// }

// export async function signInWithEmailLink(email, href) {
//   try {
//     const result = await auth.signInWithEmailLink(email, href)
//     return { email, isNewUser: result.additionalUserInfo.isNewUser }
//   } catch {
//     throw new Error()
//   }
// }

// export function signOut() {
//   return auth.signOut()
// }
