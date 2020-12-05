import { createMachine, assign, spawn, Interpreter } from 'xstate'
import { useService } from '@xstate/react'
import { get, set } from 'idb-keyval'

import QuizGuess, {
  quizGuessMachine,
  QuizGuessService,
} from 'components/QuizGuess'
import { CONTACTS, QUIZZES, QUIZ_VERSION } from 'constants/quizzes'
import { apiClient } from 'utils/apiClient'
import { immerAssign } from 'utils/machineUtils'
import {
  STAGE_TRANSITION_DURATION,
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
  didSubscribe: boolean
  phoneNumber: string
}

type ExistingQuizSetEvent =
  | {
      type: 'next'
    }
  | { type: 'back' }
  | { type: 'guess'; choice: number }
  | { type: 'retry' }

type ExistingQuizSetState = {
  value:
    | 'introduction'
    | 'instruction'
    | 'showingStage'
    | 'showingQuiz'
    | 'askToShare'
  context: ExistingQuizSetContext
}

export type ExistingQuizSetService = Interpreter<
  ExistingQuizSetContext,
  any,
  ExistingQuizSetEvent,
  ExistingQuizSetState
>

const spawnQuizGuessService = assign({
  quizGuessServices: ({
    savedGuesses,
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
          choice: savedGuesses[currentQuizIndex] ?? -1,
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

async function fetchSavedGuess({ quizSet: { quizSetKey } }) {
  const completedQuizSets = (await get(COMPLETED_QUIZSETS_STORAGE_KEY)) || {}
  return completedQuizSets?.[quizSetKey]
}

const assignSavedGuesses = assign({
  savedGuesses: (_, e) => e.data?.savedGuesses || [],
})
const assignEmptyGuesses = assign({ savedGuesses: [] })

const saveGuess = immerAssign((ctx, { choice }) => {
  ctx.savedGuesses[ctx.currentQuizIndex] = choice
})

function hasSavedGuesses(_, e) {
  return e.data
}

async function completeQuizSet({ quizSet, savedGuesses }) {
  async function saveCompletedQuizSet({ quizSetKey }, savedGuesses) {
    const completedQuizSets = (await get(COMPLETED_QUIZSETS_STORAGE_KEY)) || {}
    completedQuizSets[quizSetKey] = { savedGuesses }

    return set(COMPLETED_QUIZSETS_STORAGE_KEY, completedQuizSets)
  }

  return Promise.all([
    apiClient.completeQuizSet('', ''),
    saveCompletedQuizSet(quizSet, savedGuesses),
  ])
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
    savedGuesses: [],
    didSubscribe: false,
    phoneNumber: '',
  },
  states: {
    introduction: {
      on: {
        next: {
          target: 'instruction',
        },
      },
    },
    instruction: {
      on: {
        next: {
          target: 'fetchingSavedGuess',
        },
      },
    },
    fetchingSavedGuess: {
      invoke: {
        id: 'fetchSavedGuess',
        src: fetchSavedGuess,
        onDone: [
          {
            cond: hasSavedGuesses,
            actions: [assignSavedGuesses],
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
      after: {
        [STAGE_TRANSITION_DURATION]: {
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
            target: 'showingQuiz',
          },
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
    outroduction: {
      on: {
        next: {
          target: 'askToShare',
        },
      },
    },
    askToShare: {
      initial: 'asking',
      states: {
        asking: {},
        sharing: {},
        shared: {},
      },
    },
  },
})

export default function ExistingQuizSet({
  existingQuizSetService,
}: {
  existingQuizSetService: ExistingQuizSetService
}): JSX.Element {
  const [
    {
      matches,
      context: {
        savedGuesses,
        quizSet: { name },
        currentQuizIndex,
        quizGuessServices,
      },
      value,
    },
    send,
  ] = useService(existingQuizSetService)

  const versionedQuizzes = QUIZZES[QUIZ_VERSION]

  return (
    <div>
      {matches('introduction') && (
        <div>
          <div>Introduction</div>
          <div>
            <button onClick={() => send('next')} type='button'>
              Start Quiz
            </button>
          </div>
        </div>
      )}
      {matches('instruction') && (
        <div>
          <div>How much you know {name}?</div>
          <div>
            <button onClick={() => send('next')} type='button'>
              Next
            </button>
          </div>
        </div>
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
        <div>
          <div>Stage {versionedQuizzes[currentQuizIndex + 1].stage}</div>
        </div>
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
      {matches('outroduction') && <div>Outro</div>}
      {matches('askToShare') && (
        <div>
          <div>Done. Here's your voucher.</div>
        </div>
      )}
    </div>
  )
}
