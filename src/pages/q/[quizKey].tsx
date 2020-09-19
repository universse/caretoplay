import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { createMachine, assign, spawn } from 'xstate'
import { useMachine } from '@xstate/react'

import Options, { optionsMachine, OptionsActor } from 'components/Options'
import { firebaseApp } from 'utils/firebaseApp'
import { allStages, questionsByStage, Stage } from 'constants/quizzes'

type Quiz = {
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

function subscribeToQuiz(ctx: QuizMachineContext) {
  return function (callback: any) {
    return firebaseApp?.subscribeToQuiz(ctx.quizKey, (quiz: Quiz) => {
      callback({ type: 'updateQuiz', data: quiz })
    })
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
    e.response.toLowerCase() ===
    quiz?.resultByStage[allStages[currentStageIndex]].answers[
      currentQuestionIndex
    ].response.toLowerCase()
  )
}

function isGuessSurprise(
  { quiz, currentStageIndex, currentQuestionIndex }: QuizMachineContext,
  e: QuizMachineEvent
) {
  if (e.type !== 'guess') return false

  const currentStage = allStages[currentStageIndex]

  const options =
    questionsByStage[currentStage].questions[currentQuestionIndex].options

  const response = quiz?.resultByStage[currentStage].answers[
    currentQuestionIndex
  ].response.toLowerCase()

  if (!response) return false

  return !options.map((string) => string.toLowerCase()).includes(response)
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
  },
  states: {
    waiting: {
      on: {
        setQuizKey: {
          actions: [assignQuizKey],
          target: 'ready',
        },
      },
    },
    ready: {
      initial: 'loading',
      invoke: {
        id: 'subscribeToQuiz',
        src: subscribeToQuiz,
      },
      on: {
        updateQuiz: { actions: [assignQuiz] },
      },
      states: {
        loading: {
          on: {
            updateQuiz: [
              {
                cond: (_, e) => e.data.done,
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
                  { cond: isGuessSurprise, target: 'revealed.surprise' },
                  { target: 'revealed.wrong' },
                ],
              },
            },
            revealed: {
              states: {
                right: {},
                wrong: {},
                surprise: {},
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
      {matches('ready.newQuiz.loaded') && (
        <div>
          <button onClick={() => send('start')}>Start Quiz</button>
        </div>
      )}
      {matches('ready.newQuiz.nextStage') && (
        <div>
          <div>Stage {currentStage}</div>
          <button onClick={() => send('next')}>Next</button>
        </div>
      )}
      {matches('ready.newQuiz.nextQuiz') && (
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
      {matches('ready.newQuiz.saveQuizAnswer') ||
        (matches('ready.newQuiz.finishing') && (
          <div>
            <div>Saving...</div>
          </div>
        ))}
      {matches('ready.newQuiz.finished') && (
        <div>
          <div>Done. Now refresh the page.</div>
        </div>
      )}
      {matches('ready.existingQuiz.loaded') && (
        <div>
          <div>How much you know your spouse?</div>
          <div>
            <button onClick={() => send('start')}>Start Quiz</button>
          </div>
        </div>
      )}
      {matches('ready.existingQuiz.nextStage') && (
        <div>
          <div>Stage {currentStage}</div>
          <button onClick={() => send('next')}>Next</button>
        </div>
      )}
      {matches('ready.existingQuiz.nextQuiz') && (
        <div>
          <div>
            {
              questionsByStage[currentStage].questions[currentQuestionIndex]
                .question
            }
          </div>
          {questionsByStage[currentStage].questions[
            currentQuestionIndex
          ].options.map((option, i) => (
            <div key={i}>
              <button onClick={() => send({ type: 'guess', response: option })}>
                {option}
              </button>
            </div>
          ))}
        </div>
      )}
      {matches('ready.existingQuiz.revealed.right') && (
        <div>
          <div>Yay correct.</div>
          <button onClick={() => send('next')}>Next</button>
        </div>
      )}
      {matches('ready.existingQuiz.revealed.wrong') && (
        <div>
          <div>
            Oops. Answer was{' '}
            {
              quiz.resultByStage[currentStage].answers[currentQuestionIndex]
                .response
            }
          </div>
          <button onClick={() => send('next')}>Next</button>
        </div>
      )}
      {matches('ready.existingQuiz.revealed.surprise') && (
        <div>
          <div>
            Surprise!!! Answer was{' '}
            {
              quiz.resultByStage[currentStage].answers[currentQuestionIndex]
                .response
            }
          </div>
          <button onClick={() => send('next')}>Next</button>
        </div>
      )}
      {matches('ready.existingQuiz.finished') && (
        <div>
          <div>Done. Here's your voucher.</div>
        </div>
      )}
    </div>
  )
}
