import { customAlphabet } from 'nanoid'

import { restRequest } from '../../nodeUtils/restRequest'

const nanoid = customAlphabet('1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ', 12)

function createQuizSet() {
  const quizSetKey = nanoid()
  let ref

  try {
    ref = window.localStorage.getItem('ccttppref')
  } catch {}
  console.log(ref)
  return saveQuizSetData({ quizSetKey, status: 'new', ref }).then(() => ({
    quizSetKey,
  }))
}

function saveQuizSetData(quizSetData) {
  return restRequest('/api/saveQuizSetData', {
    body: { quizSetData },
  })
}

function subscribe(quizSetKey: string, name: string, personalInfo: any) {
  return restRequest('/api/subscribe', {
    body: { quizSetKey, name, personalInfo },
  })
}

function snap(
  type: 'share' | 'visit' | 'complete' | 'review',
  quizSetKey?: string
) {
  return restRequest('/api/snap', {
    body: { quizSetKey, type },
  })
}

export const apiClient = {
  createQuizSet,
  saveQuizSetData,
  subscribe,
  snap,
}
