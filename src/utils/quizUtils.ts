import { assign } from 'xstate'
import { produce } from 'immer'

import { quizzes, QUIZ_VERSION } from 'constants/quizzes'
import { QuizSet, QuizVersion } from 'interfaces/shared'

export const CREATED_URL_PARAM = 'isNew'
export const PERSISTED_URL_PARAM = 'isPersisted'
export const STAGE_TRANSITION_DURATION = 1000
export const STORAGE_KEY = 'ctp'
export const EMPTY_QUIZ_SET: QuizSet = {
  name: '',
  quizzes: [],
}

export function immerAssign(recipe) {
  return assign(produce(recipe))
}

export const nextQuiz = assign({
  currentQuizIndex: (ctx) => ctx.currentQuizIndex + 1,
})

export const previousQuiz = assign({
  currentQuizIndex: (ctx) => ctx.currentQuizIndex - 1,
})

export function hasNextQuiz({ currentQuizIndex }) {
  return currentQuizIndex < quizzes[QUIZ_VERSION].length - 1
}

export function hasPreviousQuiz({ currentQuizIndex }) {
  return currentQuizIndex > 0
}

export function shouldShowStage({ currentQuizIndex }) {
  return (
    hasNextQuiz({ currentQuizIndex }) &&
    quizzes[QUIZ_VERSION][currentQuizIndex]?.stage !==
      quizzes[QUIZ_VERSION][currentQuizIndex + 1].stage
  )
}
