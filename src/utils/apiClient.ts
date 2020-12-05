import { customAlphabet } from 'nanoid'

import { restRequest } from '../../nodeUtils/restRequest'

const nanoid = customAlphabet('1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ', 12)

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

function subscribe(quizSetKey: string, email: string) {
  return restRequest('/api/subscribe', {
    body: { quizSetKey, email },
  })
}

function completeQuizSet(quizSetKey: string, relationship: string) {
  return restRequest('/api/completeQuizSet', {
    body: { quizSetKey, relationship },
  })
}

function snap(type: 'share' | 'visit' | 'complete', quizSetKey?: string) {
  return restRequest('/api/snap', {
    body: { quizSetKey, type },
  })
}

export const apiClient = {
  fetchQuizSet,
  createQuizSet,
  saveQuizSetData,
  subscribe,
  completeQuizSet,
  snap,
}
