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

  function createNewQuiz() {
    const quizKey = database.ref().child('quizzes').push().key
    const quizRef = database.ref(`quizzes/${quizKey}`)
    quizRef.set({ done: false })

    return quizKey
  }

  function subscribeToConnectionStatus(callback) {
    const connectedRef = database.ref('.info/connected')

    connectedRef.on('value', function (snapshot) {
      callback(snapshot.val())
    })

    return connectedRef.off()
  }

  function subscribeToQuiz(quizKey, callback) {
    const quizRef = database.ref(`quizzes/${quizKey}`)

    quizRef.on('value', function (snapshot) {
      callback(snapshot.val())
    })

    return () => quizRef.off()
  }

  function saveQuizAnswer(quizKey, stage, questionIndex, answer) {
    return database
      .ref(`quizzes/${quizKey}/resultByStage/${stage}/answers/${questionIndex}`)
      .set(answer)
  }

  function finishQuiz(quizKey) {
    return database.ref(`quizzes/${quizKey}/done`).set(true)
  }

  return {
    subscribeToConnectionStatus,
    createNewQuiz,
    subscribeToQuiz,
    saveQuizAnswer,
    finishQuiz,
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
