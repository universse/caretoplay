import { assign } from 'xstate'

import { QUIZZES, QUIZ_VERSION } from 'constants/quizzes'
import { Quiz, QuizSet, QuizVersion } from 'interfaces/shared'

export const FINISHED_QUIZSETS_STORAGE_KEY = 'ctp_finished'
export const PERSISTED_QUIZSET_STORAGE_KEY = 'ctp_persisted'

export const EMPTY_QUIZ_SET: QuizSet = {
  quizSetKey: '',
  status: 'new',
  name: '',
  quizzes: [],
  personalInfo: {},
}

export const nextQuiz = assign({
  currentQuizIndex: (ctx, e) => ctx.currentQuizIndex + 1,
})

export const previousQuiz = assign({
  currentQuizIndex: (ctx) => ctx.currentQuizIndex - 1,
})

export function hasNextQuiz({ currentQuizIndex }) {
  return currentQuizIndex < QUIZZES[QUIZ_VERSION].length - 1
}

export function hasPreviousQuiz({ currentQuizIndex }) {
  return currentQuizIndex > 0
}

export function shouldShowStage({ currentQuizIndex }) {
  return (
    hasNextQuiz({ currentQuizIndex }) &&
    QUIZZES[QUIZ_VERSION][currentQuizIndex]?.stage !==
      QUIZZES[QUIZ_VERSION][currentQuizIndex + 1].stage
  )
}
