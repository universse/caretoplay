import Image from 'next/image'
import { createMachine, assign, sendParent, ActorRefFrom } from 'xstate'
import { useActor } from '@xstate/react'

import Icon from 'components/Icon'
import { Text } from 'components/shared'
import { STAGES } from 'constants/quizzes'
import { classNames } from 'utils/classNames'
import { immerAssign } from 'utils/machineUtils'
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

function hasNotGuessed({ choice }) {
  return choice === -1
}

function isGuessCorrect({ choice, quiz }: QuizGuessMachineContext) {
  return choice === quiz.choice
}

export const quizGuessMachine = createMachine<
  QuizGuessMachineContext,
  QuizGuessMachineEvent,
  QuizGuessMachineState
>({
  id: 'quiz',
  initial: 'unknown',
  context: { choice: -1, quiz: null },
  states: {
    unknown: {
      always: [
        { cond: hasNotGuessed, target: 'unrevealed' },
        { target: 'revealed' },
      ],
    },
    unrevealed: {
      on: {
        guess: { actions: [assignChoice] },
        confirmGuess: { target: 'revealed' },
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
      value,
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
      <div className='flex-expand px-16 pt-16 pb-4'>
        <div className='AspectRatio _16-9'>
          <Image
            alt={currentQuiz.animationAlt}
            layout='fill'
            objectFit='cover'
            // src={`/assets/gifs/quiz-0${currentQuizIndex + 1}.gif`}
            src={`/assets/gifs/${currentQuiz.animationSrc}`}
          />
        </div>
        <div className='mt-16'>
          <Text
            as='h6'
            className='Question serif fw-800 text-center'
            element='p'
          >
            {currentQuiz.questionToAnswer}
          </Text>
        </div>
        <ul className='mt-16'>
          {quiz.options.map((option, i) => {
            const isSelectedChoice = choice === i

            const guessedRight =
              matches({ revealed: 'right' }) && isSelectedChoice
            const guessedWrong = isWrong && isSelectedChoice

            const shouldRevealCorrectChoice = isRevealed && quiz.choice === i

            return (
              <li
                key={i}
                className='flex items-center mb-12'
                style={{ height: '3rem' }}
              >
                <div className='flex-auto h-100'>
                  <button
                    className={classNames(
                      'text-body2 color-dark break-word text-center px-16 w-100 h-100 rounded shadow01 py-4 overflow-hidden',
                      choice === i ? 'background-brand900' : 'background-light',
                      guessedWrong && 'Wrong',
                      shouldRevealCorrectChoice && 'Right'
                    )}
                    onClick={() => send({ type: 'guess', choice: i })}
                    type='button'
                  >
                    {option}
                  </button>
                  {guessedRight && (
                    <Text as='body2' className='Message fw-700'>
                      Yay! That is correct!
                    </Text>
                  )}
                  {guessedWrong && (
                    <Text as='body2' className='Message fw-700'>
                      Oh no, ask {name} why.
                    </Text>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </div>
      <div
        className='flex justify-between items-center px-16'
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
              className='text-button color-dark lowercase background-gray100 rounded fw-700 px-16 shadow01'
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
            className='text-button color-dark lowercase background-gray100 rounded fw-700 px-16 shadow01'
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
