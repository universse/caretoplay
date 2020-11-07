export enum Stage {
  CASUAL = 'casual',
  INTIMATE = 'intimate',
  CRITICAL = 'critical',
}

export type Quiz = {
  stage: Stage
  canEdit: boolean
  questionToAnswer: string
  questionToGuess: string
  options: string[]
  hint?: string
  choice?: number
}

export enum QuizVersion {
  v1 = 'v1',
}

export type QuizSet = {
  name: string
  quizzes: Quiz[]
  status?: 'new' | 'finished'
  quizSetKey?: string
  quizVersion?: QuizVersion
}
