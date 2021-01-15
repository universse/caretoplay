import { createMachine, assign, sendParent, ActorRefFrom } from 'xstate'
import { useActor } from '@xstate/react'

import Icon from 'components/Icon'
import { Text, Image } from 'components/shared'
import { STAGES } from 'constants/quizzes'
import { classNames } from 'utils/classNames'
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
  value: 'unrevealed' | 'revealed' | { revealed: 'right' | 'wrong' }
  context: QuizGuessMachineContext & { quiz: QuizWithChoice }
}

export type QuizGuessService = ActorRefFrom<typeof quizGuessMachine>

const assignChoice = assign({
  choice: (_, e) => e.choice,
})

const madeGuess = sendParent(({ choice }) => ({ type: 'guess', choice }))

function isGuessCorrect({ choice, quiz }: QuizGuessMachineContext) {
  return choice === quiz.choice
}

export const quizGuessMachine = createMachine<
  QuizGuessMachineContext,
  QuizGuessMachineEvent,
  QuizGuessMachineState
>({
  id: 'quiz',
  initial: 'unrevealed',
  context: { choice: -1, quiz: null },
  states: {
    unrevealed: {
      on: {
        guess: { actions: [assignChoice] },
        confirmGuess: [
          { cond: (ctx) => ctx.choice === -1, target: 'error' },
          { target: 'revealed' },
        ],
      },
    },
    error: {
      on: {
        guess: { actions: [assignChoice], target: 'unrevealed' },
      },
    },
    revealed: {
      initial: 'unknown',
      states: {
        unknown: {
          always: [
            { cond: isGuessCorrect, target: 'right' },
            { target: 'wrong' },
          ],
        },
        right: {},
        wrong: {},
      },
      on: {
        next: {
          actions: [madeGuess],
        },
      },
    },
  },
})

export default function QuizGuessScreen({
  currentQuizIndex,
  handleBackButton,
  name,
  quizGuessService,
  versionedQuizzes,
}: {
  currentQuizIndex: number
  handleBackButton: any
  name: string
  quizGuessService: QuizGuessService
  versionedQuizzes: any
}): JSX.Element {
  const currentQuiz = versionedQuizzes[currentQuizIndex]

  const currentStageQuestions = versionedQuizzes.filter(
    (quiz) => quiz.stage === currentQuiz.stage
  )

  const [
    {
      matches,
      context: { choice, quiz },
    },
    send,
  ] = useActor(quizGuessService)

  const isRevealed = matches('revealed')
  const isWrong = matches({ revealed: 'wrong' })

  return (
    <div
      className={`QuizScreen Stage0${
        STAGES.indexOf(currentQuiz.stage) + 1
      } flex flex-col h-100`}
    >
      <div className='px-16 py-16'>
        <div className='AspectRatio _16-9'>
          <Image
            alt={currentQuiz.animationAlt}
            src={`/assets/gifs/${currentQuiz.animationSrc}.gif`}
          />
        </div>
      </div>
      <div className='flex-expand px-16 mS:px-32 pb-4'>
        <Text as='h6' className='Question serif fw-800 text-center' element='p'>
          {currentQuiz.question.replace(/{{name}}/gi, name)}
        </Text>
        <ul className='mt-16'>
          {quiz.options.map((option, i) => {
            const isSelectedChoice = choice === i

            const guessedWrong = isWrong && isSelectedChoice
            const shouldRevealCorrectChoice = isRevealed && quiz.choice === i

            return (
              <li key={i} className='mb-12'>
                <button
                  className={classNames(
                    'flex justify-center items-center text-body2 color-dark break-word text-center px-48 w-100 h-100 rounded shadow01 py-8 overflow-hidden',
                    choice === i ? 'background-brand900' : 'background-light',
                    guessedWrong && 'Wrong',
                    shouldRevealCorrectChoice && 'Right'
                  )}
                  onClick={() => send({ type: 'guess', choice: i })}
                  style={{ height: '3.5rem' }}
                  type='button'
                >
                  {option}
                  {guessedWrong && (
                    <div
                      className='flex items-center justify-center absolute rounded background-light'
                      style={{
                        width: '1.75rem',
                        height: '1.75rem',
                        right: '0.75rem',
                      }}
                    >
                      <Icon
                        fill='var(--danger600)'
                        icon='cross'
                        size='medium'
                      />
                    </div>
                  )}
                  {shouldRevealCorrectChoice && (
                    <div
                      className='flex items-center justify-center absolute rounded background-light'
                      style={{
                        width: '1.75rem',
                        height: '1.75rem',
                        right: '0.75rem',
                      }}
                    >
                      <Icon fill='var(--success)' icon='check' size='medium' />
                    </div>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
        {isRevealed && (
          <Text
            as='body2'
            className={classNames('Message block fw-700 text-center')}
          >
            {isWrong ? (
              <>
                Oh no, {name} selected a<br />
                different answer. Ask {name} why!
              </>
            ) : (
              'Yay! That is correct!'
            )}
          </Text>
        )}
      </div>
      <div
        className='flex justify-between items-center px-16 mS:px-32'
        style={{ flex: '0 0 5rem' }}
      >
        <button
          className='flex items-center text-button NavButton lowercase fw-700'
          onClick={handleBackButton}
          style={{ height: '3rem' }}
          type='button'
        >
          <Icon icon='chevron-left' size='large' />
          Back
        </button>
        <div
          className='flex justify-between absolute'
          style={{ width: '5rem', left: 'calc(50% - 2.5rem)' }}
        >
          {currentStageQuestions.map((question, i) => (
            <div
              key={i}
              className={classNames(
                'Dot rounded',
                question === currentQuiz && 'Active'
              )}
              style={{ width: '0.75rem', height: '0.75rem' }}
            />
          ))}
        </div>
        {isRevealed &&
          (currentQuizIndex === versionedQuizzes.length - 1 ? (
            <button
              className='ColoredButton text-button lowercase rounded fw-700 px-16 shadow01'
              onClick={() => send({ type: 'next' })}
              style={{ height: '3rem' }}
              type='button'
            >
              Done!
            </button>
          ) : (
            <button
              className='flex items-center text-button NavButton lowercase fw-700'
              onClick={() => send({ type: 'next' })}
              style={{ height: '3rem' }}
              type='button'
            >
              Next
              <Icon icon='chevron-right' size='large' />
            </button>
          ))}
        {!isRevealed && choice !== -1 && (
          <button
            className='ColoredButton text-button lowercase rounded fw-700 px-16 shadow01'
            onClick={() => send({ type: 'confirmGuess' })}
            style={{ height: '3rem' }}
            type='button'
          >
            Confirm
          </button>
        )}
      </div>
    </div>
  )
}
