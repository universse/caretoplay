import Image from 'next/image'
import { createMachine, assign, sendParent, ActorRefFrom } from 'xstate'
import { useActor } from '@xstate/react'

import Icon from 'components/Icon'
import { STAGES } from 'constants/quizzes'
import { classNames } from 'utils/classNames'
import { immerAssign } from 'utils/machineUtils'
import { Quiz } from 'interfaces/shared'

type QuizInputMachineContext = {
  choice: number
  optionIndexToEdit: number
  draftResponse: string
  quiz: Quiz
}

type QuizInputMachineEvent =
  | { type: 'edit'; optionIndexToEdit: number; draftResponse: string }
  | { type: 'select'; choice: number }
  | { type: 'changeResponse'; value: string }
  | { type: 'confirmResponseChange' }
  | { type: 'cancelResponseChange' }
  | { type: 'answer' }

type QuizInputMachineState = {
  value:
    | 'idle'
    | 'error'
    | 'editing'
    | { editing: 'inputing' }
    | { editing: 'error' }
  context: QuizInputMachineContext
}

export type QuizInputService = ActorRefFrom<typeof quizInputMachine>

const setOptionToEdit = assign({
  optionIndexToEdit: (_, e) => e.optionIndexToEdit,
  draftResponse: (_, e) => e.draftResponse,
})

const assignDraftResponse = assign({ draftResponse: (_, e) => e.value })

const saveOption = immerAssign((ctx) => {
  const { optionIndexToEdit, draftResponse } = ctx

  ctx.quiz.options[optionIndexToEdit] = draftResponse.trim()
})

const clearEdit = assign({ optionIndexToEdit: -1, draftResponse: '' })

const answerQuiz = sendParent(({ choice, quiz: { options } }) => ({
  type: 'answer',
  options,
  choice,
}))

const selectOption = assign({
  choice: (_, { choice }) => choice,
})

export const quizInputMachine = createMachine<
  QuizInputMachineContext,
  QuizInputMachineEvent,
  QuizInputMachineState
>({
  id: 'quiz',
  initial: 'idle',
  context: {
    choice: -1,
    optionIndexToEdit: -1,
    draftResponse: '',
    quiz: {},
  },
  states: {
    idle: {
      on: {
        edit: {
          actions: [setOptionToEdit],
          target: 'editing',
        },
        select: { actions: [selectOption] },
        answer: [
          { cond: (ctx) => ctx.choice === -1, target: 'error' },
          { actions: [answerQuiz] },
        ],
      },
    },
    error: {
      on: {
        select: { actions: [selectOption], target: 'idle' },
      },
    },
    editing: {
      initial: 'inputing',
      states: {
        inputing: {
          on: {
            confirmResponseChange: [
              {
                cond: ({ draftResponse }) => !!draftResponse.trim(),
                actions: [saveOption, clearEdit],
                target: '#quiz.idle',
              },
              { target: 'error' },
            ],
            changeResponse: {
              actions: [assignDraftResponse],
            },
          },
        },
        error: {
          on: {
            changeResponse: {
              actions: [assignDraftResponse],
              target: 'inputing',
            },
          },
        },
      },
      on: {
        cancelResponseChange: {
          actions: [clearEdit],
          target: 'idle',
        },
      },
    },
  },
})

export default function QuizInputScreen({
  currentQuizIndex,
  handleBackButton,
  quizInputService,
  versionedQuizzes,
}: {
  currentQuizIndex: number
  handleBackButton: any
  quizInputService: QuizInputService
  versionedQuizzes: any
}): JSX.Element {
  const currentQuiz = versionedQuizzes[currentQuizIndex]

  const currentStageQuestions = versionedQuizzes.filter(
    (quiz) => quiz.stage === currentQuiz.stage
  )

  const [
    {
      matches,
      context: { choice, optionIndexToEdit, draftResponse, quiz },
      value,
    },
    send,
  ] = useActor(quizInputService)

  return (
    <div
      className={`QuizScreen Stage0${STAGES.indexOf(currentQuiz.stage) + 1}`}
    >
      <div className='Layout'>
        <div>
          <div className='pt-16'>
            <div className='AspectRatio _16-9'>
              <Image
                alt={currentQuiz.animationAlt}
                layout='fill'
                objectFit='cover'
                src={`/assets/gifs/quiz-0${currentQuizIndex + 1}.gif`}
              />
            </div>
          </div>
          <div className='mt-16'>
            <p className='text-h6 Question text-center'>
              {currentQuiz.questionToAnswer}
            </p>
          </div>
          <ul className='mt-16'>
            {quiz.options.map((option, i) => (
              <li key={i} className='Option'>
                {matches('editing') && optionIndexToEdit === i ? (
                  <>
                    <textarea
                      className='text-body1 Response break-word text-center'
                      onChange={(e) =>
                        send({ type: 'changeResponse', value: e.target.value })
                      }
                      value={draftResponse}
                    />
                    <div className='EditResponse absolute'>
                      <button
                        onClick={() => send({ type: 'confirmResponseChange' })}
                        type='button'
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => send({ type: 'cancelResponseChange' })}
                        type='button'
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    className='text-body1 Response break-word'
                    disabled={matches('editing')}
                    onClick={() => send({ type: 'select', choice: i })}
                    type='button'
                  >
                    {option}
                  </button>
                )}
                {quiz.canEdit && !matches('editing') && (
                  <div className='EditResponse absolute'>
                    <button
                      onClick={() =>
                        send({
                          type: 'edit',
                          optionIndexToEdit: i,
                          draftResponse: option,
                        })
                      }
                      type='button'
                    >
                      Edit
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div
          className='flex justify-between items-center'
          style={{ height: '5rem' }}
        >
          <button
            className='flex items-center text-button NavButton uppercase fw-700'
            onClick={handleBackButton}
            style={{ height: '3rem' }}
            type='button'
          >
            <Icon icon='chevron-left' size='large' />
            Back
          </button>
          <div className='Dots'>
            {currentStageQuestions.map((question, i) => (
              <div
                key={i}
                className={classNames(
                  'Dot',
                  question === currentQuiz && 'Active'
                )}
              />
            ))}
          </div>
          {choice !== -1 &&
            (currentQuizIndex === versionedQuizzes.length - 1 ? (
              <button
                className='text-button color-dark uppercase background-gray100 rounded fw-700 px-16 shadow01'
                onClick={() => send({ type: 'answer' })}
                style={{ height: '3rem' }}
                type='submit'
              >
                Done!
              </button>
            ) : (
              <button
                className='flex items-center text-button NavButton uppercase fw-700'
                onClick={() => send({ type: 'answer' })}
                style={{ height: '3rem' }}
                type='button'
              >
                Next
                <Icon icon='chevron-right' size='large' />
              </button>
            ))}
        </div>
      </div>
    </div>
  )
}
