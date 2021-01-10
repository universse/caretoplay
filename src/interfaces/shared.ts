// export enum Stage {
//   CASUAL = 'casual',
//   INTIMATE = 'intimate',
//   CRITICAL = 'critical',
// }

export type Stage = 'casual' | 'intimate' | 'critical'

export type Quiz = {
  stage: Stage
  canEdit: boolean
  question: string
  options: string[]
  animationAlt: string
  animationSrc: string
  hint?: string
}

export type QuizWithChoice = Quiz & { choice: number }

export enum QuizVersion {
  v1 = 'v1',
}

export type QuizSet = {
  quizSetKey: string
  status: 'new' | 'finished'
  name: string
  quizzes: QuizWithChoice[]
  personalInfo: {
    email?: string
    maritalStatus?: string
    age?: string
    haveChildren?: boolean
  }
  quizVersion?: QuizVersion
}
