import { customAlphabet } from 'nanoid'

import { restRequest } from '../../nodeUtils/restRequest'

const nanoid = customAlphabet('1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ', 12)

function getFirebaseApp() {
  function fetchQuizSet(quizSetKey: string) {
    return restRequest(`/api/fetchQuizSet/${quizSetKey}`)
  }

  function createQuizSet() {
    const quizSetKey = nanoid()
    return saveQuizSetData({ quizSetKey, status: 'new' }).then(() => ({
      quizSetKey,
    }))
  }

  function saveQuizSetData(quizSetData) {
    return restRequest('/api/saveQuizSetData', {
      body: { quizSetData },
    })
  }

  function snap(type: 'share' | 'visit' | 'complete', quizSetKey?: string) {
    return restRequest('/api/snap', {
      body: { quizSetKey, type },
    })
  }

  return {
    fetchQuizSet,
    createQuizSet,
    saveQuizSetData,
    snap,
  }
}

export const firebaseApp = getFirebaseApp()
