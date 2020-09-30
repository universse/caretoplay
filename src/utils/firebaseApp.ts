import firebase from 'firebase/app'
import 'firebase/database'
// import 'firebase/auth'

function getFirebaseApp() {
  if (typeof window === 'undefined') return

  firebase.initializeApp({
    apiKey: 'AIzaSyA5IyuJVWP7hBhaZUHuMPbPUXJdWM_SuaA',
    authDomain: 'caretoplay-dev.firebaseapp.com',
    databaseURL: 'https://caretoplay-dev.firebaseio.com',
    projectId: 'caretoplay-dev',
    storageBucket: 'caretoplay-dev.appspot.com',
    messagingSenderId: '200941179102',
    appId: '1:200941179102:web:3c4dbdfb540a21f32af24f',
  })

  const database = firebase.database()

  function createQuizSet() {
    return database.ref().child('quizSets').push().key
  }

  function subscribeToConnectionStatus(callback) {
    const connectedRef = database.ref('.info/connected')

    connectedRef.on('value', function (snapshot) {
      callback(snapshot.val())
    })

    return connectedRef.off()
  }

  function subscribeToQuizSet(quizSetKey, callback) {
    const quizRef = database.ref(`quizSets/${quizSetKey}`)

    quizRef.on('value', function (snapshot) {
      callback(snapshot.val())
    })

    return () => {
      quizRef.off()
    }
  }

  function saveQuiz(quizSetKey, stage, quizIndex, options, choice) {
    return database
      .ref(
        `quizSets/${quizSetKey}/editedQuizzesByStage/${stage}/quizzes/${quizIndex}`
      )
      .set({ options, choice })
  }

  function finishQuizSet(quizSetKey) {
    return database.ref(`quizSets/${quizSetKey}/done`).set(true)
  }

  return {
    subscribeToConnectionStatus,
    createQuizSet,
    subscribeToQuizSet,
    saveQuiz,
    finishQuizSet,
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
