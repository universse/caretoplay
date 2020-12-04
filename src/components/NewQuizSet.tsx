import { createMachine, assign, spawn, Interpreter } from 'xstate'
import { useService } from '@xstate/react'
import { get, set, del } from 'idb-keyval'

import QuizInput, {
  quizInputMachine,
  QuizInputService,
} from 'components/QuizInput'
import Share, {
  shareMachine,
  // ShareService
} from 'components/Share'
import { QUIZZES, QUIZ_VERSION } from 'constants/quizzes'
import { apiClient } from 'utils/apiClient'
import { immerAssign } from 'utils/machineUtils'
import {
  STAGE_TRANSITION_DURATION,
  PERSISTED_QUIZSET_STORAGE_KEY,
  FINISHED_QUIZSETS_STORAGE_KEY,
  EMPTY_QUIZ_SET,
  nextQuiz,
  previousQuiz,
  hasNextQuiz,
  hasPreviousQuiz,
  shouldShowStage,
} from 'utils/quizUtils'
import { socialShare } from 'utils/share'
import { QuizSet } from 'interfaces/shared'

type NewQuizSetContext = {
  quizSet: QuizSet
  currentQuizIndex: number
  quizInputServices: QuizInputService[]
}

type NewQuizSetEvent =
  | { type: 'changeName'; value: string }
  | { type: 'next' }
  | { type: 'back' }
  | {
      type: 'answer'
      choice: number
      response: string
    }
  | { type: 'finish' }
  | { type: 'retry' }
  | { type: 'share' }

type NewQuizSetState = {
  value:
    | 'askForName'
    | { askForName: 'inputting' }
    | { askForName: 'error' }
    | 'showingStage'
    | 'showingQuiz'
    | 'done'
    | 'finishingQuizSet'
    | 'finishingQuizSetError'
    | 'askToShare'
  context: NewQuizSetContext
}

export type NewQuizSetService = Interpreter<
  NewQuizSetContext,
  any,
  NewQuizSetEvent,
  NewQuizSetState
>

const assignName = immerAssign((ctx, e) => {
  ctx.quizSet.name = e.value
})

const assignQuizInput = immerAssign((ctx, { options, choice }) => {
  ctx.quizSet.quizzes[ctx.currentQuizIndex] = { choice, options }
})

const spawnQuizInputService = assign({
  quizInputServices: ({ quizSet, currentQuizIndex, quizInputServices }) => {
    if (quizInputServices[currentQuizIndex]) return quizInputServices

    const quiz = QUIZZES[QUIZ_VERSION][currentQuizIndex]
    const savedQuiz = quizSet?.quizzes?.[currentQuizIndex]

    return [
      ...quizInputServices,
      spawn(
        quizInputMachine.withContext({
          ...quizInputMachine.context,
          choice: savedQuiz?.choice ?? -1,
          quiz: {
            ...quiz,
            options: quiz.options.map(
              (option, i) => savedQuiz?.options[i] || option
            ),
          },
        })
      ),
    ]
  },
})

const spawnShareService = assign({
  shareService: ({ shareService, quizSet }) =>
    shareService ||
    spawn(
      shareMachine.withConfig({
        services: {
          handleSubmit(ctx) {
            return apiClient.subscribe(quizSet.quizSetKey, ctx.data.email)
          },
        },
      })
    ),
})

function persistQuizSet({ quizSet }) {
  set(PERSISTED_QUIZSET_STORAGE_KEY, {
    ...quizSet,
    quizVersion: QUIZ_VERSION,
  })
}

function finishQuizSet({ quizSet }) {
  async function saveFinishedQuizSet({ quizSetKey, name }) {
    const finishedQuizSets = (await get(FINISHED_QUIZSETS_STORAGE_KEY)) || {}

    finishedQuizSets[quizSetKey] = { name }

    return set(FINISHED_QUIZSETS_STORAGE_KEY, finishedQuizSets)
  }

  return Promise.all([
    apiClient.saveQuizSetData({
      ...quizSet,
      quizVersion: QUIZ_VERSION,
      status: 'finished',
    }),
    saveFinishedQuizSet(quizSet),
  ])
}

function shareQuizSet(ctx) {
  socialShare({
    text: 'blah blah blah',
    url: window.location.href,
  })
    .then(() => {
      apiClient.snap('share', ctx.quizSet.quizSetKey)
    })
    .catch((error) => {
      switch (error.name) {
        case 'Unsupported':
          // open share modal
          break

        case 'InternalError':
          // log
          break

        case 'ShareTimeout':
          // log
          break

        default:
          break
      }
    })
}

function clearLocalQuizSet() {
  del(PERSISTED_QUIZSET_STORAGE_KEY)
}

function isNameInputFilled(ctx) {
  return !!ctx.quizSet.name.trim()
}

export const newQuizSetMachine = createMachine<
  NewQuizSetContext,
  NewQuizSetEvent,
  NewQuizSetState
>({
  id: 'newQuizSet',
  initial: 'askForName',
  context: {
    quizSet: { ...EMPTY_QUIZ_SET },
    currentQuizIndex: -1,
    quizInputServices: [],
    shareService: null,
  },
  states: {
    askForName: {
      initial: 'inputting',
      states: {
        inputting: {
          on: {
            next: [
              {
                cond: isNameInputFilled,
                actions: [persistQuizSet],
                target: '#newQuizSet.showingStage',
              },
              { target: 'error' },
            ],
            changeName: {
              actions: [assignName],
            },
          },
        },
        error: {
          on: {
            changeName: {
              actions: [assignName],
              target: 'inputting',
            },
          },
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
      entry: [spawnQuizInputService],
      on: {
        answer: [
          {
            cond: shouldShowStage,
            actions: [assignQuizInput, persistQuizSet],
            target: 'showingStage',
          },
          {
            cond: hasNextQuiz,
            actions: [assignQuizInput, persistQuizSet, nextQuiz],
            target: 'showingQuiz',
          },
          {
            actions: [assignQuizInput, persistQuizSet],
            target: 'done',
          },
        ],
        back: [
          {
            cond: hasPreviousQuiz,
            actions: [previousQuiz],
            target: 'showingQuiz',
          },
          // { actions: [previousQuiz], target: 'askForName' },
        ],
      },
    },
    done: {
      on: {
        finish: {
          target: 'finishingQuizSet',
        },
      },
    },
    finishingQuizSet: {
      invoke: {
        id: 'finishQuizSet',
        src: finishQuizSet,
        onDone: { actions: [clearLocalQuizSet], target: 'askToShare' },
        onError: { target: 'finishingQuizSetError' },
      },
    },
    finishingQuizSetError: {
      on: {
        retry: 'finishingQuizSet',
      },
    },
    askToShare: {
      entry: [spawnShareService],
      on: {
        back: {
          target: 'showingQuiz',
        },
        share: {
          actions: [shareQuizSet],
        },
      },
    },
  },
})

function QuizScreen({
  currentQuizIndex,
  handleBackButton,
  quizInputService,
  versionedQuizzes,
}) {
  const currentQuiz = versionedQuizzes[currentQuizIndex]

  const currentStageQuestions = versionedQuizzes.filter(
    (quiz) => quiz.stage === currentQuiz?.stage
  )
  const questionOrder = currentStageQuestions.indexOf(currentQuiz) + 1
  const questionCountForCurrentStage = currentStageQuestions.length

  return (
    <div>
      <button onClick={handleBackButton} type='button'>
        Back
      </button>
      <div>{currentQuiz.questionToAnswer}</div>
      <QuizInput quizInputService={quizInputService} />
    </div>
  )
}

export default function NewQuizSet({
  newQuizSetService,
}: {
  newQuizSetService: NewQuizSetService
}): JSX.Element {
  const [
    {
      matches,
      context: {
        quizSet: { name, quizSetKey },
        currentQuizIndex,
        quizInputServices,
        shareService,
      },
      value,
    },
    send,
  ] = useService(newQuizSetService)

  const versionedQuizzes = QUIZZES[QUIZ_VERSION]

  return (
    <div>
      {matches('askForName') && (
        <div>
          <p>What's your name?</p>
          <input
            onChange={(e) =>
              send({ type: 'changeName', value: e.target.value })
            }
            type='text'
            value={name}
          />
          <button onClick={() => send('next')} type='button'>
            Next
          </button>
        </div>
      )}
      {matches('showingStage') && (
        <div>
          <div>Stage {versionedQuizzes[currentQuizIndex + 1].stage}</div>
        </div>
      )}
      {matches('showingQuiz') && (
        <QuizScreen
          currentQuizIndex={currentQuizIndex}
          handleBackButton={() => send('back')}
          quizInputService={quizInputServices[currentQuizIndex]}
          versionedQuizzes={versionedQuizzes}
        />
      )}
      {matches('done') && (
        <div>
          <button onClick={() => send('finish')} type='button'>
            Done
          </button>
        </div>
      )}
      {matches('finishingQuizSet') && (
        <div>
          <div>Saving...</div>
        </div>
      )}
      {matches('askToShare') && (
        <div>
          <div>Done. Share with your spouse.</div>
          <Share shareService={shareService} />
          <button onClick={() => send('share')} type='button'>
            Share
          </button>
        </div>
      )}
    </div>
  )
}
