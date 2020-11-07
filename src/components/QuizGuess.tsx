import { createMachine, assign, sendParent, Interpreter } from 'xstate'
import { useService } from '@xstate/react'

import { Quiz } from 'interfaces/shared'

type QuizGuessMachineContext = {
  choice: number
  quiz: Quiz
}

type QuizGuessMachineEvent =
  | { type: 'select'; choice: number }
  | { type: 'next' }
  | { type: 'guess' }

type QuizGuessMachineState = {
  value: 'idle' | 'revealed' | { revealed: 'right' | 'wrong' }
  context: QuizGuessMachineContext
}

export type QuizGuessService = Interpreter<
  QuizGuessMachineContext,
  any,
  QuizGuessMachineEvent,
  QuizGuessMachineState
>

const assignOption = assign({
  choice: (_, e) => e.choice,
})

const nextQuiz = sendParent({ type: 'next' })

function isGuessCorrect({ choice, quiz }, e) {
  return choice === quiz.choice
}

export const quizGuessMachine = createMachine<
  QuizGuessMachineContext,
  QuizGuessMachineEvent,
  QuizGuessMachineState
>({
  id: 'quiz',
  initial: 'idle',
  context: { choice: -1 },
  states: {
    idle: {
      on: {
        select: { actions: [assignOption] },
        guess: [
          { cond: isGuessCorrect, target: 'revealed.right' },
          { target: 'revealed.wrong' },
        ],
      },
    },
    revealed: {
      states: {
        right: {},
        wrong: {},
      },
      on: {
        next: {
          actions: [nextQuiz],
        },
      },
    },
  },
})

export default function QuizGuess({
  quizGuessService,
}: {
  quizGuessService: QuizGuessService
}): JSX.Element {
  const [
    {
      matches,
      context: { choice, quiz },
      value,
    },
    send,
  ] = useService(quizGuessService)

  const isRevealed = matches('revealed')
  const isWrong = matches({ revealed: 'wrong' })

  return (
    <div>
      {quiz.options.map((option, i) => {
        const isSelectedChoice = choice === i

        const shouldShowCorrectGuess =
          matches({ revealed: 'right' }) && isSelectedChoice
        const shouldShowWrongGuess = isWrong && isSelectedChoice

        const shouldShowCorrectChoice = isWrong && quiz.choice === i

        return (
          <div key={i}>
            <button
              className={isSelectedChoice ? 'Selected' : ''}
              disabled={isRevealed}
              onClick={() => send({ type: 'select', choice: i })}
              type='button'
            >
              {option}
            </button>
            {shouldShowCorrectGuess && <span>Right</span>}
            {shouldShowWrongGuess && <span>Wrong</span>}
            {shouldShowCorrectChoice && <span>- Answer</span>}
          </div>
        )
      })}
      {isRevealed ? (
        <button onClick={() => send('next')} type='button'>
          Next
        </button>
      ) : (
        <button
          disabled={choice === -1}
          onClick={() => send('guess')}
          type='button'
        >
          Confirm
        </button>
      )}
    </div>
  )
}
