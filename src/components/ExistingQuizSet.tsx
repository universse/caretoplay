import { createMachine, assign, spawn } from 'xstate'
import { useService } from '@xstate/react'

import QuizGuess, {
  quizGuessMachine,
  QuizGuessService,
} from 'components/QuizGuess'
import { quizzes, QUIZ_VERSION } from 'constants/quizzes'
import {
  STAGE_TRANSITION_DURATION,
  nextQuiz,
  previousQuiz,
  hasNextQuiz,
  hasPreviousQuiz,
  shouldShowStage,
} from 'utils/quizUtils'

const assignDidSubscribe = assign({ didSubscribe: true })

const assignPhoneNumber = assign({ phoneNumber: (_, e) => e.value })

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
            ...quizzes[QUIZ_VERSION][currentQuizIndex],
            choice,
            options,
          },
        })
      ),
    ]
  },
})

function didSubscribe(ctx) {
  return ctx.didSubscribe
}

function isPhoneNumberValid(ctx) {
  return ctx.phoneNumber
}

export const existingQuizSetMachine = createMachine({
  id: 'existingQuizSet',
  initial: 'introduction',
  context: {
    quizSetKey: '',
    quizSet: {
      name: '',
      quizzes: [],
    },
    currentQuizIndex: -1,
    quizGuessServices: [],
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
        next: [
          {
            cond: shouldShowStage,
            target: 'showingStage',
          },
          { cond: hasNextQuiz, actions: [nextQuiz], target: 'showingQuiz' },
          { target: 'askToSubscribe' },
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
    askToSubscribe: {
      initial: 'disagreed',
      on: {
        agree: {
          target: '.agreed',
        },
        disagree: {
          target: '.disagreed',
        },
      },
      states: {
        agreed: {
          on: {
            selectOutlet: {
              target: 'selectedOutlet',
            },
          },
        },
        selectedOutlet: {
          on: {
            next: {
              actions: [assignDidSubscribe],
              target: '#existingQuizSet.askForPhoneNumber',
            },
          },
        },
        disagreed: {
          on: {
            next: {
              target: '#existingQuizSet.askForPhoneNumber',
            },
          },
        },
      },
    },
    askForPhoneNumber: {
      initial: 'inputting',
      states: {
        inputting: {
          on: {
            submit: [
              {
                cond: isPhoneNumberValid,
                target: 'submitted',
              },
              { target: 'error' },
            ],
            changePhoneNumber: {
              actions: [assignPhoneNumber],
            },
          },
        },
        error: {
          on: {
            changePhoneNumber: {
              actions: [assignPhoneNumber],
              target: 'inputting',
            },
          },
        },
        submitted: {
          always: [
            { cond: didSubscribe, target: 'savingAndRedeeming' },
            { target: 'redeeming' },
          ],
        },
        savingAndRedeeming: {
          invoke: {
            id: 'saveAndRedeem',
            src: 'saveAndRedeem',
            onDone: [{ target: '#existingQuizSet.askToShare' }],
            onError: {},
          },
        },
        redeeming: {
          invoke: {
            id: 'redeem',
            src: 'redeem',
            onDone: [{ target: '#existingQuizSet.askToShare' }],
            onError: {},
          },
        },
      },
    },
    askToShare: {},
    shareOnFacebook: {},
  },
})

export default function ExistingQuizSet({
  existingQuizSetService,
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
  ] = useService(existingQuizSetService)

  const versionedQuizzes = quizzes[QUIZ_VERSION]

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
      {matches('askToSubscribe') && (
        <div>
          <div>Done. Here's your voucher.</div>
        </div>
      )}
    </div>
  )
}
