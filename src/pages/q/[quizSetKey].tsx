import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { createMachine, assign, spawn, forwardTo } from 'xstate'
import { useMachine } from '@xstate/react'

import QuizInput, { quizMachine, QuizActor } from 'components/QuizInput'
import { firebaseApp } from 'utils/firebaseApp'
import { allStages, quizzesByStage, Stage } from 'constants/quizzes'

type QuizSet = {
  done: boolean
  editedQuizzesByStage: Record<Stage, { quizzes: any }>
}

type QuizMachineContext = {
  name: string
  quizSetKey: string
  quizSet: QuizSet
  currentStageIndex: number
  currentQuizIndex: number
  quizService: QuizActor
  score: number
}

type QuizMachineEvent =
  | { type: 'setQuizSetKey'; quizSetKey: string }
  | { type: 'retry' }
  | { type: 'start' }
  | { type: 'next' }
  | { type: 'back' }
  | { type: 'edit'; optionIndex: number }
  | { type: 'input'; value: string }
  | { type: 'cancelEdit' }
  | {
      type: 'answer'
      answer: {
        choice: number
        response: string
      }
    }
  | {
      type: 'guess'
      choice: number
    }
  | { type: 'updateQuiz'; data: QuizSet }

type QuizMachineState = {
  value: 'waiting' | { ready: 'loading' } | { ready: 'newQuiz' }
  context: QuizMachineContext
}

const assignQuizSetKey = assign({ quizSetKey: (_, e) => e.quizSetKey })

const assignQuiz = assign({ quizSet: (_, e) => e.data })

const nextStage = assign({
  currentStageIndex: (ctx) => ++ctx.currentStageIndex,
  currentQuizIndex: -1,
})

const nextQuiz = assign({
  currentQuizIndex: (ctx) => ++ctx.currentQuizIndex,
})

const previousStage = assign({
  currentStageIndex: (ctx) => --ctx.currentStageIndex,
  currentQuizIndex: -1,
})

const lastQuiz = assign({
  // currentStageIndex: (ctx) => --ctx.currentStageIndex,
  currentQuizIndex: ({ currentStageIndex }) =>
    quizzesByStage[allStages[currentStageIndex]].quizzes.length - 1,
})

const previousQuiz = assign({
  currentQuizIndex: (ctx) => --ctx.currentQuizIndex,
})

const spawnQuizActor = assign({
  quizService: ({ quizSet, currentStageIndex, currentQuizIndex }) => {
    const currentStage = allStages[currentStageIndex]
    const quiz = quizzesByStage[currentStage].quizzes[currentQuizIndex]
    const originalOptions =
      quizzesByStage[currentStage].quizzes[currentQuizIndex].options

    return spawn(
      quizMachine.withContext({
        optionIndexToEdit: -1,
        draftOptionValue: '',
        quiz: {
          ...quiz,
          options: originalOptions.map(
            (originalOption, i) =>
              quizSet?.editedQuizzesByStage[currentStage]?.quizzes[
                currentQuizIndex
              ]?.options[i] || originalOption
          ),
        },
      })
    )
  },
})

const increaseScore = assign({
  score: (ctx) => ++ctx.score,
})

function subscribeToQuizSet() {
  return function (callback: any, onReceive: any) {
    let unsubscribe: (() => void) | undefined

    onReceive(({ quizSetKey }) => {
      unsubscribe = firebaseApp?.subscribeToQuizSet(
        quizSetKey,
        (quizSet: QuizSet) => {
          callback({ type: 'updateQuiz', data: quizSet })
        }
      )
    })

    return () => {
      unsubscribe && unsubscribe()
    }
  }
}

function saveQuiz(
  { quizSetKey, currentStageIndex, currentQuizIndex }: QuizMachineContext,
  { type, options, choice }: QuizMachineEvent
) {
  if (type !== 'answer') return

  return firebaseApp?.saveQuiz(
    quizSetKey,
    allStages[currentStageIndex],
    currentQuizIndex,
    options,
    choice
  )
}

function finishQuizSet({ quizSetKey }: QuizMachineContext) {
  return firebaseApp?.finishQuizSet(quizSetKey)
}

function isGuessCorrect(
  { quizSet, currentStageIndex, currentQuizIndex }: QuizMachineContext,
  e: QuizMachineEvent
) {
  if (e.type !== 'guess') return false

  return (
    e.choice ===
    quizSet.editedQuizzesByStage[allStages[currentStageIndex]].quizzes[
      currentQuizIndex
    ].choice
  )
}

function hasNextQuiz({
  currentStageIndex,
  currentQuizIndex,
}: QuizMachineContext) {
  return (
    currentQuizIndex <
    quizzesByStage[allStages[currentStageIndex]].quizzes.length - 1
  )
}

function hasNextStage({ currentStageIndex }: QuizMachineContext) {
  return currentStageIndex < allStages.length - 1
}

function hasPreviousQuiz({ currentQuizIndex }: QuizMachineContext) {
  return currentQuizIndex > 0
}

function hasPreviousStage({ currentStageIndex }: QuizMachineContext) {
  return currentStageIndex > 0
}

const quizSetMachine = createMachine<
  QuizMachineContext,
  QuizMachineEvent,
  QuizMachineState
>({
  id: 'quizSet',
  initial: 'waiting',
  context: {
    name: '',
    quizSetKey: '',
    quizSet: null,
    currentStageIndex: -1,
    currentQuizIndex: -1,
    quizService: null,
    score: 0,
  },
  on: {
    setQuizSetKey: {
      actions: [forwardTo('subscribeToQuizSet'), assignQuizSetKey],
    },
    updateQuiz: { actions: [assignQuiz] },
  },
  invoke: {
    id: 'subscribeToQuizSet',
    src: subscribeToQuizSet,
  },
  states: {
    waiting: {
      on: {
        updateQuiz: [
          {
            cond: (_, e) => e.data?.done,
            actions: [assignQuiz],
            target: 'existingQuiz',
          },
          { actions: [assignQuiz], target: 'newQuiz' },
        ],
      },
    },
    newQuiz: {
      initial: 'loaded',
      states: {
        loaded: {
          on: {
            start: {
              actions: [nextStage],
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
            back: [
              {
                cond: hasPreviousStage,
                actions: [previousStage, lastQuiz],
                target: 'showingQuiz',
              },
              {
                actions: [previousStage],
                target: 'loaded',
              },
            ],
          },
        },
        showingQuiz: {
          entry: [spawnQuizActor],
          on: {
            answer: {
              target: 'saveQuiz',
            },
            back: [
              {
                cond: hasPreviousQuiz,
                actions: [previousQuiz],
                target: 'showingQuiz',
              },
              {
                actions: [previousQuiz],
                target: 'showingStage',
              },
            ],
          },
        },
        saveQuiz: {
          invoke: {
            id: 'saveQuiz',
            src: saveQuiz,
            onDone: [
              { cond: hasNextQuiz, actions: [nextQuiz], target: 'showingQuiz' },
              {
                cond: hasNextStage,
                actions: [nextStage],
                target: 'showingStage',
              },
              { target: 'finishing' },
            ],
            onError: {},
            // [
            //   {
            //     cond: hasNextQuiz,
            //     actions: [nextQuiz],
            //     target: 'showingQuiz',
            //   },
            //   {
            //     cond: hasNextStage,
            //     actions: [nextStage],
            //     target: 'showingStage',
            //   },
            //   { target: 'finishing' },
            // ]
          },
        },
        finishing: {
          invoke: {
            id: 'finishQuizSet',
            src: finishQuizSet,
            onDone: { target: 'finished' },
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
    },
    existingQuiz: {
      initial: 'loaded',
      states: {
        loaded: {
          on: {
            start: {
              actions: [nextStage],
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
          on: {
            guess: [
              { cond: isGuessCorrect, target: 'revealed.right' },
              { target: 'revealed.wrong' },
            ],
          },
        },
        revealed: {
          states: {
            right: {
              entry: [increaseScore],
            },
            wrong: {},
          },
          on: {
            next: [
              { cond: hasNextQuiz, actions: [nextQuiz], target: 'showingQuiz' },
              {
                cond: hasNextStage,
                actions: [nextStage],
                target: 'showingStage',
              },
              { target: 'finished' },
            ],
          },
        },
        finished: {},
      },
    },
  },
})

export default function QuizPage() {
  const {
    query: { quizSetKey },
  } = useRouter()

  const [
    {
      matches,
      context: {
        quizSet,
        currentStageIndex,
        currentQuizIndex,
        quizService,
        score,
      },
    },
    send,
  ] = useMachine(quizSetMachine)

  useEffect(() => {
    typeof quizSetKey === 'string' &&
      quizSetKey &&
      send({ type: 'setQuizSetKey', quizSetKey })
  }, [quizSetKey, send])

  const currentStage = allStages[currentStageIndex]

  return (
    <div>
      {matches('waiting') && <div>Loading...</div>}
      {matches('newQuiz') && !matches('newQuiz.loaded') && (
        <button onClick={() => send('back')} type='button'>
          Back
        </button>
      )}
      {matches('newQuiz.loaded') && (
        <div>
          <button onClick={() => send('start')} type='button'>
            Start Quiz
          </button>
        </div>
      )}
      {matches('newQuiz.showingStage') && (
        <div>
          <div>Stage {currentStage}</div>
          <button onClick={() => send('next')} type='button'>
            Next
          </button>
        </div>
      )}
      {matches('newQuiz.showingQuiz') && (
        <QuizInput quizService={quizService} />
      )}
      {matches('newQuiz.saveQuiz') ||
        (matches('newQuiz.finishing') && (
          <div>
            <div>Saving...</div>
          </div>
        ))}
      {matches('newQuiz.finished') && (
        <div>
          <div>Done. Share with your spouse.</div>
          <button
            onClick={() =>
              navigator.share
                ? navigator.share({
                    text: 'blah blah blah',
                    url: window.location.href,
                  })
                : console.log(window.location.href)
            }
            type='button'
          >
            Share
          </button>
        </div>
      )}
      {matches('existingQuiz.loaded') && (
        <div>
          <div>How much you know your spouse?</div>
          <div>
            <button onClick={() => send('start')} type='button'>
              Start Quiz
            </button>
          </div>
        </div>
      )}
      {matches('existingQuiz.showingStage') && (
        <div>
          <div>Stage {currentStage}</div>
          <button onClick={() => send('next')} type='button'>
            Next
          </button>
        </div>
      )}
      {matches('existingQuiz.showingQuiz') && (
        <div>
          <div>
            {quizzesByStage[currentStage].quizzes[currentQuizIndex].question}
          </div>
          {quizSet.editedQuizzesByStage[currentStage].quizzes[
            currentQuizIndex
          ].options.map((option, i) => {
            return (
              <div key={i}>
                <button
                  onClick={() => send({ type: 'guess', choice: i })}
                  type='button'
                >
                  {option}
                </button>
              </div>
            )
          })}
        </div>
      )}
      {matches('existingQuiz.revealed.right') && (
        <div>
          <div>Yay correct.</div>
          <button onClick={() => send('next')} type='button'>
            Next
          </button>
        </div>
      )}
      {matches('existingQuiz.revealed.wrong') && (
        <div>
          <div>
            Oops. Answer was{' '}
            {
              quizSet.editedQuizzesByStage[currentStage].quizzes[
                currentQuizIndex
              ].options[
                quizSet.editedQuizzesByStage[currentStage].quizzes[
                  currentQuizIndex
                ].choice
              ]
            }
          </div>
          <button onClick={() => send('next')} type='button'>
            Next
          </button>
        </div>
      )}
      {matches('existingQuiz.finished') && (
        <div>
          <div>
            Done. Here's your voucher. Score {score} out of{' '}
            {Object.values(quizzesByStage).reduce(
              (sum, { quizzes }) => sum + quizzes.length,
              0
            )}
          </div>
        </div>
      )}
    </div>
  )
}
