import { createMachine, assign, sendParent, Interpreter } from 'xstate'
import { useService } from '@xstate/react'

import { QuizWithChoice } from 'interfaces/shared'

type QuizGuessMachineContext = {
  choice: number
  quiz: QuizWithChoice | null
}

type QuizGuessMachineEvent =
  | { type: 'guess'; choice: number }
  | { type: 'confirmGuess' }
  | { type: 'next' }

type QuizGuessMachineState = {
  value: 'idle' | 'revealed' | { revealed: 'right' | 'wrong' }
  context: QuizGuessMachineContext & { quiz: QuizWithChoice }
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

function isGuessCorrect({ choice, quiz }: QuizGuessMachineContext) {
  return choice === quiz.choice
}

export const quizGuessMachine = createMachine<
  QuizGuessMachineContext,
  QuizGuessMachineEvent,
  QuizGuessMachineState
>({
  id: 'quiz',
  initial: 'idle',
  context: { choice: -1, quiz: null },
  states: {
    idle: {
      on: {
        guess: { actions: [assignOption] },
        confirmGuess: [
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
              onClick={() => send({ type: 'guess', choice: i })}
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
          onClick={() => send('confirmGuess')}
          type='button'
        >
          Confirm
        </button>
      )}
    </div>
  )
}
