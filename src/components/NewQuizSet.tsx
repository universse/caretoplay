import { createMachine, assign, spawn } from 'xstate'
import { useService } from '@xstate/react'
import { set, del } from 'idb-keyval'

import QuizInput, {
  quizInputMachine,
  QuizInputService,
} from 'components/QuizInput'
import { quizzes, QUIZ_VERSION } from 'constants/quizzes'
import { firebaseApp } from 'utils/firebaseApp'
import {
  STAGE_TRANSITION_DURATION,
  STORAGE_KEY,
  EMPTY_QUIZ_SET,
  immerAssign,
  nextQuiz,
  previousQuiz,
  hasNextQuiz,
  hasPreviousQuiz,
  shouldShowStage,
} from 'utils/quizUtils'
import { socialShare } from 'utils/share'

const assignName = immerAssign((ctx, e) => {
  ctx.quizSet.name = e.value
})

const assignQuizInput = immerAssign((ctx, { options, choice }) => {
  ctx.quizSet.quizzes[ctx.currentQuizIndex] = { choice, options }
})

const spawnQuizInputService = assign({
  quizInputServices: ({ quizSet, currentQuizIndex, quizInputServices }) => {
    if (quizInputServices[currentQuizIndex]) return quizInputServices

    const quiz = quizzes[QUIZ_VERSION][currentQuizIndex]
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

function persistQuizSet({ currentQuizIndex, quizSetKey, quizSet }) {
  function persist(quizSet) {
    set(STORAGE_KEY, quizSet)
  }

  persist({
    ...quizSet,
    // currentQuizIndex,
    quizSetKey,
    quizVersion: QUIZ_VERSION,
  })
}

function finishQuizSet({ quizSetKey, quizSet }) {
  return firebaseApp?.saveQuizSetData(quizSetKey, {
    ...quizSet,
    quizVersion: QUIZ_VERSION,
    status: 'finished',
  })
}

function clearLocalQuizSet() {
  del(STORAGE_KEY)
}

export const newQuizSetMachine = createMachine({
  id: 'newQuizSet',
  initial: 'askForName',
  context: {
    quizSetKey: '',
    quizSet: { ...EMPTY_QUIZ_SET },
    currentQuizIndex: -1,
    quizInputServices: [],
  },
  states: {
    askForName: {
      initial: 'inputting',
      states: {
        inputting: {
          on: {
            next: [
              {
                cond: (ctx) => !!ctx.quizSet.name.trim(),
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
        onDone: { actions: [clearLocalQuizSet], target: 'finished' },
        onError: {},
      },
    },
    finished: {
      on: {
        back: {
          // TODO: actions unfinish
          target: 'showingQuiz',
        },
      },
    },
  },
})

export default function NewQuizSet({ newQuizSetService }): JSX.Element {
  const [
    {
      matches,
      context: {
        quizSet: { name },
        currentQuizIndex,
        quizInputServices,
      },
      value,
    },
    send,
  ] = useService(newQuizSetService)
  const versionedQuizzes = quizzes[QUIZ_VERSION]

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
        <div>
          <button onClick={() => send('back')} type='button'>
            Back
          </button>
          <div>{versionedQuizzes[currentQuizIndex].questionToAnswer}</div>
          <QuizInput quizInputService={quizInputServices[currentQuizIndex]} />
        </div>
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
      {matches('finished') && (
        <div>
          <div>Done. Share with your spouse.</div>
          <button
            onClick={() =>
              socialShare({
                text: 'blah blah blah',
                url: window.location.href,
              }).catch((error) => {
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
            type='button'
          >
            Share
          </button>
        </div>
      )}
    </div>
  )
}
