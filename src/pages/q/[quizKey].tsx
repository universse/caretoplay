import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { createMachine, assign, spawn, forwardTo } from 'xstate'
import { useMachine } from '@xstate/react'

import Options, { optionsMachine, OptionsActor } from 'components/Options'
import { firebaseApp } from 'utils/firebaseApp'
import { allStages, questionsByStage, Stage } from 'constants/quizzes'

type Quiz = {
  done: boolean
  resultByStage: Record<
    Stage,
    { answers: { choice: number; response: string }[] }
  >
}

type QuizMachineContext = {
  name: string
  quizKey: string
  quiz: Quiz | null
  currentStageIndex: number
  currentQuestionIndex: number
  optionsService: OptionsActor | null
}

type QuizMachineEvent =
  | { type: 'setQuizKey'; quizKey: string }
  | { type: 'retry' }
  | { type: 'start' }
  | { type: 'next' }
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
      response: string
    }
  | { type: 'updateQuiz'; data: Quiz }

type QuizMachineState = {
  value: 'waiting' | { ready: 'loading' } | { ready: 'newQuiz' }
  context: QuizMachineContext
}

const assignQuizKey = assign({ quizKey: (_, e) => e.quizKey })

const assignQuiz = assign({ quiz: (_, e) => e.data })

const nextStage = assign({
  currentStageIndex: (ctx) => ++ctx.currentStageIndex,
  currentQuestionIndex: -1,
})

const nextQuiz = assign({
  currentQuestionIndex: (ctx) => ++ctx.currentQuestionIndex,
})

const spawnOptionsActor = assign({
  optionsService: () => spawn(optionsMachine),
})

const increaseScore = assign({
  score: (ctx) => ++ctx.score,
})

function subscribeToQuiz() {
  return function (callback: any, onReceive: any) {
    let unsubscribe: (() => void) | undefined

    onReceive(({ quizKey }) => {
      unsubscribe = firebaseApp?.subscribeToQuiz(quizKey, (quiz: Quiz) => {
        callback({ type: 'updateQuiz', data: quiz })
      })
    })

    return () => {
      unsubscribe && unsubscribe()
    }
  }
}

function saveQuizAnswer(
  { quizKey, currentStageIndex, currentQuestionIndex }: QuizMachineContext,
  e: QuizMachineEvent
) {
  if (e.type !== 'answer') return

  return firebaseApp?.saveQuizAnswer(
    quizKey,
    allStages[currentStageIndex],
    currentQuestionIndex,
    e.answer
  )
}

function finishQuiz({ quizKey }: QuizMachineContext) {
  return firebaseApp?.finishQuiz(quizKey)
}

function isGuessCorrect(
  { quiz, currentStageIndex, currentQuestionIndex }: QuizMachineContext,
  e: QuizMachineEvent
) {
  if (e.type !== 'guess') return false

  return (
    e.guess.choice ===
    quiz?.resultByStage[allStages[currentStageIndex]].answers[
      currentQuestionIndex
    ].choice
  )
}

function hasNextQuiz({
  currentStageIndex,
  currentQuestionIndex,
}: QuizMachineContext) {
  return (
    currentQuestionIndex <
    questionsByStage[allStages[currentStageIndex]].questions.length - 1
  )
}

function hasNextStage({ currentStageIndex }: QuizMachineContext) {
  return currentStageIndex < allStages.length - 1
}

const quizMachine = createMachine<
  QuizMachineContext,
  QuizMachineEvent,
  QuizMachineState
>({
  id: 'quiz',
  initial: 'waiting',
  context: {
    name: '',
    quizKey: '',
    quiz: null,
    currentStageIndex: -1,
    currentQuestionIndex: -1,
    optionsService: null,
    score: 0,
  },
  on: {
    setQuizKey: {
      actions: [forwardTo('subscribeToQuiz'), assignQuizKey],
    },
    updateQuiz: { actions: [assignQuiz] },
  },
  invoke: {
    id: 'subscribeToQuiz',
    src: subscribeToQuiz,
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
              target: 'nextStage',
            },
          },
        },
        nextStage: {
          entry: [nextStage],
          on: {
            next: {
              target: 'nextQuiz',
            },
          },
        },
        nextQuiz: {
          entry: [nextQuiz, spawnOptionsActor],
          on: {
            answer: {
              target: 'saveQuizAnswer',
            },
          },
        },
        saveQuizAnswer: {
          invoke: {
            id: 'saveQuizAnswer',
            src: saveQuizAnswer,
            onDone: [
              { cond: hasNextQuiz, target: 'nextQuiz' },
              { cond: hasNextStage, target: 'nextStage' },
              { target: 'finishing' },
            ],
            onError: [
              { cond: hasNextQuiz, target: 'nextQuiz' },
              { cond: hasNextStage, target: 'nextStage' },
              { target: 'finishing' },
            ],
          },
        },
        finishing: {
          invoke: {
            id: 'finishQuiz',
            src: finishQuiz,
            onDone: { target: 'finished' },
            onError: {},
          },
        },
        finished: {},
      },
    },
    existingQuiz: {
      initial: 'loaded',
      states: {
        loaded: {
          on: {
            start: { target: 'nextStage' },
          },
        },
        nextStage: {
          entry: [nextStage],
          on: {
            next: {
              target: 'nextQuiz',
            },
          },
        },
        nextQuiz: {
          entry: [nextQuiz],
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
              { cond: hasNextQuiz, target: 'nextQuiz' },
              { cond: hasNextStage, target: 'nextStage' },
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
    query: { quizKey },
  } = useRouter()

  const [
    {
      matches,
      context: {
        quiz,
        currentStageIndex,
        currentQuestionIndex,
        optionsService,
        score,
      },
    },
    send,
  ] = useMachine(quizMachine)

  useEffect(() => {
    typeof quizKey === 'string' &&
      quizKey &&
      send({ type: 'setQuizKey', quizKey })
  }, [quizKey, send])

  const currentStage = allStages[currentStageIndex]

  return (
    <div>
      {matches('waiting') ||
        (matches({ ready: 'loading' }) && <div>Loading...</div>)}
      {matches('newQuiz.loaded') && (
        <div>
          <button type='button' onClick={() => send('start')}>
            Start Quiz
          </button>
        </div>
      )}
      {matches('newQuiz.nextStage') && (
        <div>
          <div>Stage {currentStage}</div>
          <button type='button' onClick={() => send('next')}>
            Next
          </button>
        </div>
      )}
      {matches('newQuiz.nextQuiz') && (
        <div>
          <div>
            {
              questionsByStage[currentStage].questions[currentQuestionIndex]
                .question
            }
          </div>
          {optionsService && (
            <Options
              optionsService={optionsService}
              question={
                questionsByStage[currentStage].questions[currentQuestionIndex]
              }
            />
          )}
        </div>
      )}
      {matches('newQuiz.saveQuizAnswer') ||
        (matches('newQuiz.finishing') && (
          <div>
            <div>Saving...</div>
          </div>
        ))}
      {matches('newQuiz.finished') && (
        <div>
          <div>Done. Share with your spouse.</div>
          <button
            type='button'
            onClick={() =>
              navigator.share
                ? navigator.share({
                    text: 'blah blah blah',
                    url: window.location.href,
                  })
                : console.log(window.location.href)
            }
          >
            Share
          </button>
        </div>
      )}
      {matches('existingQuiz.loaded') && (
        <div>
          <div>How much you know your spouse?</div>
          <div>
            <button type='button' onClick={() => send('start')}>
              Start Quiz
            </button>
          </div>
        </div>
      )}
      {matches('existingQuiz.nextStage') && (
        <div>
          <div>Stage {currentStage}</div>
          <button type='button' onClick={() => send('next')}>
            Next
          </button>
        </div>
      )}
      {matches('existingQuiz.nextQuiz') && (
        <div>
          <div>
            {
              questionsByStage[currentStage].questions[currentQuestionIndex]
                .question
            }
          </div>
          {questionsByStage[currentStage].questions[
            currentQuestionIndex
          ].options.map((option, i) => {
            const { choice, response } = quiz.resultByStage[
              currentStage
            ].answers[currentQuestionIndex]

            return (
              <div key={i}>
                <button
                  type='button'
                  onClick={() =>
                    send({
                      type: 'guess',
                      guess: { choice: i, response: option },
                    })
                  }
                >
                  {choice === i ? response : option}
                </button>
              </div>
            )
          })}
        </div>
      )}
      {matches('existingQuiz.revealed.right') && (
        <div>
          <div>Yay correct.</div>
          <button type='button' onClick={() => send('next')}>
            Next
          </button>
        </div>
      )}
      {matches('existingQuiz.revealed.wrong') && (
        <div>
          <div>
            Oops. Answer was{' '}
            {
              quiz.resultByStage[currentStage].answers[currentQuestionIndex]
                .response
            }
          </div>
          <button type='button' onClick={() => send('next')}>
            Next
          </button>
        </div>
      )}
      {matches('existingQuiz.finished') && (
        <div>
          <div>
            Done. Here's your voucher. Score {score} out of{' '}
            {Object.values(questionsByStage).reduce(
              (sum, { questions }) => sum + questions.length,
              0
            )}
          </div>
        </div>
      )}
    </div>
  )
}
