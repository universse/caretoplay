import { useEffect } from 'react'
import { createMachine, assign, spawn } from 'xstate'
import Link from 'next/link'
import { useMachine } from '@xstate/react'
import { get, set } from 'idb-keyval'

import LandingScreen from 'screens/LandingScreen'
import StageScreen from 'screens/StageScreen'
import QuizGuess, {
  quizGuessMachine,
  QuizGuessService,
} from 'components/QuizGuess'
import { QUIZZES, QUIZ_VERSION } from 'constants/quizzes'
import { apiClient } from 'utils/apiClient'
import { immerAssign } from 'utils/machineUtils'
import {
  COMPLETED_QUIZSETS_STORAGE_KEY,
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
  persistedGuesses: number[]
}

type ExistingQuizSetEvent =
  | {
      type: 'next'
    }
  | { type: 'back' }
  | { type: 'review' }
  | { type: 'startAfresh' }
  | { type: 'guess'; choice: number }
  | { type: 'retry' }

type ExistingQuizSetState = {
  value:
    | 'introduction'
    | 'confirmReview'
    | 'showingStage'
    | 'showingQuiz'
    | 'outroduction'
  context: ExistingQuizSetContext
}

const spawnQuizGuessService = assign({
  quizGuessServices: ({
    persistedGuesses,
    quizSet,
    currentQuizIndex,
    quizGuessServices,
  }) => {
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
          choice: persistedGuesses[currentQuizIndex] ?? -1,
        })
      ),
    ]
  },
})

function trackQuizSetComplete(ctx) {
  apiClient.snap('complete', ctx.quizSet.quizSetKey)
}

function trackQuizSetReview(ctx) {
  apiClient.snap('review', ctx.quizSet.quizSetKey)
}

async function fetchPersistedGuess({ quizSet: { quizSetKey } }) {
  const completedQuizSets = (await get(COMPLETED_QUIZSETS_STORAGE_KEY)) || {}
  return completedQuizSets?.[quizSetKey]
}

const assignPersistedGuesses = assign({
  persistedGuesses: (_, e) => e.data?.persistedGuesses || [],
})
const assignEmptyGuesses = assign({ persistedGuesses: [] })

const saveGuess = immerAssign((ctx, { choice }) => {
  ctx.persistedGuesses[ctx.currentQuizIndex] = choice
})

function hasPersistedGuesses(_, e) {
  return e.data
}

async function completeQuizSet({ quizSet: { quizSetKey }, persistedGuesses }) {
  const completedQuizSets = (await get(COMPLETED_QUIZSETS_STORAGE_KEY)) || {}

  completedQuizSets[quizSetKey] = { persistedGuesses }

  return set(COMPLETED_QUIZSETS_STORAGE_KEY, completedQuizSets)
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
    persistedGuesses: [],
  },
  states: {
    introduction: {
      on: {
        next: {
          target: 'fetchingPersistedGuess',
        },
      },
    },
    fetchingPersistedGuess: {
      invoke: {
        id: 'fetchPersistedGuess',
        src: fetchPersistedGuess,
        onDone: [
          {
            cond: hasPersistedGuesses,
            actions: [assignPersistedGuesses],
            target: 'confirmReview',
          },
          { target: 'showingStage' },
        ],
        onError: { target: 'showingStage' },
      },
    },
    confirmReview: {
      on: {
        review: {
          actions: [trackQuizSetReview],
          target: 'showingStage',
        },
        startAfresh: {
          actions: [assignEmptyGuesses],
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
            actions: [saveGuess],
            target: 'showingStage',
          },
          {
            cond: hasNextQuiz,
            actions: [saveGuess, nextQuiz],
            target: 'showingQuiz',
          },
          {
            actions: [saveGuess, trackQuizSetComplete],
            target: 'completingQuizSet',
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
    completingQuizSet: {
      invoke: {
        id: 'completeQuizSet',
        src: completeQuizSet,
        onDone: { target: 'outroduction' },
        onError: { target: 'completingQuizSetError' },
      },
    },
    completingQuizSetError: {
      on: {
        retry: 'completingQuizSet',
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
        persistedGuesses,
        quizSet: {
          name,
          personalInfo: { email },
        },
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
    <>
      {matches('introduction') && (
        <LandingScreen name={name} nextStep={nextStep} />
      )}
      {matches('confirmReview') && (
        <div>
          <button onClick={() => send('review')} type='button'>
            Review
          </button>
          <button onClick={() => send('startAfresh')} type='button'>
            Start afresh
          </button>
        </div>
      )}
      {matches('showingStage') && (
        <StageScreen
          handleComplete={nextStep}
          stage={versionedQuizzes[currentQuizIndex + 1].stage}
        />
      )}
      {matches('showingQuiz') && (
        <div>
          <button onClick={() => send('back')} type='button'>
            Back
          </button>
          <div>
            {versionedQuizzes[currentQuizIndex].questionToGuess.replace(
              /{{name}}/g,
              name
            )}
          </div>
          <QuizGuess quizGuessService={quizGuessServices[currentQuizIndex]} />
        </div>
      )}
      {matches('outroduction') && (
        <div>
          {email ? `${name} entered giveaway` : ''}
          <div>
            <a href='/q/new'>Create quiz</a>
          </div>
        </div>
      )}
    </>
  )
}
