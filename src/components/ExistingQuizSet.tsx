import { useEffect } from 'react'
import { createMachine, assign, spawn } from 'xstate'
import { useMachine } from '@xstate/react'

import Congratulations from './Congratulations'
import ACPLocations from './ACPLocations'
import ErrorBoundary from './ErrorBoundary'
import { Button } from './shared'
import LandingScreen from 'screens/LandingScreen'
import StageScreen from 'screens/StageScreen'
import QuizGuessScreen, {
  quizGuessMachine,
  QuizGuessService,
} from 'screens/QuizGuessScreen'
import { QUIZZES, QUIZ_VERSION } from 'constants/quizzes'
import { apiClient } from 'utils/apiClient'
import {
  EMPTY_QUIZ_SET,
  nextQuiz,
  previousQuiz,
  hasNextQuiz,
  hasPreviousQuiz,
  shouldShowStage,
} from 'utils/quizUtils'
import { QuizSet } from 'interfaces/shared'

type ExistingQuizSetContext = {
  quizSet: QuizSet
  currentQuizIndex: number
  quizGuessServices: QuizGuessService[]
}

type ExistingQuizSetEvent =
  | {
      type: 'next'
    }
  | { type: 'back' }
  | { type: 'guess'; choice: number }

type ExistingQuizSetState = {
  value: 'introduction' | 'showingStage' | 'showingQuiz' | 'outroduction'
  context: ExistingQuizSetContext
}

const spawnQuizGuessService = assign({
  quizGuessServices: ({ quizSet, currentQuizIndex, quizGuessServices }) => {
    if (quizGuessServices[currentQuizIndex]) return quizGuessServices

    const { choice, options } = quizSet.quizzes[currentQuizIndex]

    return [
      ...quizGuessServices,
      spawn(
        quizGuessMachine.withContext({
          ...quizGuessMachine.context,
          quiz: {
            ...QUIZZES[QUIZ_VERSION][currentQuizIndex],
            choice,
            options,
          },
        })
      ),
    ]
  },
})

function trackQuizSetComplete(ctx) {
  apiClient.snap('complete', ctx.quizSet.quizSetKey)
}

export const existingQuizSetMachine = createMachine<
  ExistingQuizSetContext,
  ExistingQuizSetEvent,
  ExistingQuizSetState
>({
  id: 'existingQuizSet',
  initial: 'introduction',
  context: {
    quizSet: { ...EMPTY_QUIZ_SET },
    currentQuizIndex: -1,
    quizGuessServices: [],
  },
  states: {
    introduction: {
      on: {
        next: {
          target: 'showingStage',
        },
      },
    },
    showingStage: {
      on: {
        next: {
          actions: [nextQuiz],
          target: 'showingQuiz',
        },
      },
    },
    showingQuiz: {
      entry: [spawnQuizGuessService],
      on: {
        guess: [
          {
            cond: shouldShowStage,
            target: 'showingStage',
          },
          {
            cond: hasNextQuiz,
            actions: [nextQuiz],
            target: 'showingQuiz',
          },
          {
            actions: [trackQuizSetComplete],
            target: 'outroduction',
          },
        ],
        back: [
          {
            cond: hasPreviousQuiz,
            actions: [previousQuiz],
          },
          { actions: [previousQuiz], target: 'introduction' },
        ],
      },
    },
    outroduction: {},
  },
})

export default function ExistingQuizSet({
  initialQuizSet,
}: {
  initialQuizSet: any
}): JSX.Element {
  const [
    {
      matches,
      context: {
        quizSet: { name },
        currentQuizIndex,
        quizGuessServices,
      },
      value,
    },
    send,
  ] = useMachine(
    existingQuizSetMachine.withContext({
      ...existingQuizSetMachine.context,
      quizSet: initialQuizSet,
    })
  )

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [value])

  const versionedQuizzes = QUIZZES[QUIZ_VERSION]

  const nextStep = () => send('next')

  return (
    <ErrorBoundary>
      {matches('introduction') && (
        <LandingScreen name={name} nextStep={nextStep} />
      )}
      {matches('showingStage') && (
        <StageScreen
          handleComplete={nextStep}
          stage={versionedQuizzes[currentQuizIndex + 1].stage}
        />
      )}
      {matches('showingQuiz') && (
        <QuizGuessScreen
          currentQuizIndex={currentQuizIndex}
          handleBackButton={() => send('back')}
          name={name}
          quizGuessService={quizGuessServices[currentQuizIndex]}
          versionedQuizzes={versionedQuizzes}
        />
      )}
      {matches('outroduction') && (
        <div className='background-brand100'>
          <Congratulations />
          <div className='px-16 mS:px-32 py-24'>
            <ACPLocations />
          </div>
          <div className='flex justify-center px-16 mS:px-32 pb-48'>
            <Button className='background-brand500' element='a' href='/q/new'>
              Create your own quiz!
            </Button>
          </div>
        </div>
      )}
    </ErrorBoundary>
  )
}
