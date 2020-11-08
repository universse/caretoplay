import { customAlphabet } from 'nanoid'

import restRequest from 'utils/restRequest'

const nanoid = customAlphabet('1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ', 12)

function getFirebaseApp() {
  function fetchQuizSet(quizSetKey: string) {
    return restRequest(`/api/fetchQuizSet/${quizSetKey}`)
  }

  function saveQuizSetData(quizSetKey: string, quizSetData) {
    return restRequest('/api/saveQuizSetData', {
      body: { quizSetKey, quizSetData },
    })
  }

  function createQuizSet() {
    const quizSetKey = nanoid()
    return saveQuizSetData(quizSetKey, { status: 'new' }).then(() => ({
      quizSetKey,
    }))
  }

  return {
    createQuizSet,
    fetchQuizSet,
    saveQuizSetData,
  }
}

export const firebaseApp = getFirebaseApp()
