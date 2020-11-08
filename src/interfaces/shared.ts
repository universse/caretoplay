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
}

export type QuizWithChoice = Quiz & { choice: number }

export enum QuizVersion {
  v1 = 'v1',
}

export type QuizSet = {
  quizSetKey: string
  name: string
  quizzes: QuizWithChoice[]
  status?: 'new' | 'finished'
  quizVersion?: QuizVersion
}
