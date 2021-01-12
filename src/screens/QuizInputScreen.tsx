import { useEffect } from 'react'
import { createMachine, assign, sendParent, ActorRefFrom } from 'xstate'
import { useActor } from '@xstate/react'

import Icon from 'components/Icon'
import { Text, Image } from 'components/shared'
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
  | { type: 'next' }

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

const assignDraftResponse = immerAssign((ctx, e) => {
  ctx.draftResponse = e.value
})

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
        next: [
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
            confirmResponseChange: {
              actions: [saveOption, clearEdit],
              target: '#quiz.idle',
            },
          },
        },
        error: {},
      },
      on: {
        changeResponse: [
          {
            cond: (_, e) => !!e.value.trim(),
            actions: [assignDraftResponse],
            target: '#quiz.editing.inputing',
          },
          {
            actions: [assignDraftResponse],
            target: '#quiz.editing.error',
          },
        ],
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
  name,
  quizInputService,
  versionedQuizzes,
}: {
  currentQuizIndex: number
  handleBackButton: any
  name: string
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
    },
    send,
  ] = useActor(quizInputService)

  const isEditing = matches('editing')

  useEffect(() => {
    if (isEditing) {
      document.querySelector('textarea')?.focus()
    }
  }, [isEditing])

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
            src={`/assets/gifs/${currentQuiz.animationSrc}.webp`}
          />
        </div>
      </div>
      <div className='flex-expand px-16 mS:px-32 pb-16'>
        <Text as='h6' className='Question serif fw-800 text-center' element='p'>
          {currentQuiz.question.replaceAll('{{name}}', name)}
        </Text>
        {currentQuiz.hint && (
          <div className='mt-8'>
            <Text as='body2' className='color-brand300 text-center' element='p'>
              {currentQuiz.hint}
            </Text>
          </div>
        )}
        <ul className='mt-16'>
          {quiz.options.map((option, i) => (
            <li
              key={i}
              className='flex items-center mb-12'
              style={{ height: '3.5rem' }}
            >
              <div className='flex-auto h-100'>
                {isEditing && optionIndexToEdit === i ? (
                  <div>
                    <textarea
                      className={classNames(
                        'text-body2 color-dark break-word text-center px-16 w-100 h-100 rounded shadow01 py-8 overflow-hidden',
                        choice === i && !isEditing
                          ? 'background-brand900'
                          : 'background-light'
                      )}
                      onChange={(e) => {
                        send({
                          type: 'changeResponse',
                          value: e.target.value,
                        })
                      }}
                      rows={2}
                      value={draftResponse}
                    />
                    {draftResponse.length > 55 && (
                      <div className='mt-4' style={{ zIndex: 5 }}>
                        <Text
                          as='body2'
                          className='Warning block fw-800 text-center'
                          element='span'
                        >
                          {currentQuizIndex === versionedQuizzes.length - 1
                            ? 'The name'
                            : 'Your answer'}{' '}
                          might be too long!
                        </Text>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    className={classNames(
                      'text-body2 color-dark break-word text-center px-16 w-100 h-100 rounded shadow01 py-8 overflow-hidden',
                      choice === i && !isEditing
                        ? 'background-brand900'
                        : 'background-light'
                    )}
                    disabled={isEditing}
                    onClick={() => send({ type: 'select', choice: i })}
                    type='button'
                  >
                    {option}
                  </button>
                )}
              </div>
              {quiz.canEdit && (
                <div
                  className='flex justify-between ml-8'
                  style={{ flex: '0 0 4rem', height: '1.75rem' }}
                >
                  {isEditing && optionIndexToEdit === i ? (
                    <>
                      <button
                        className='flex justify-center items-center background-success flex-auto rounded h-100 shadow01'
                        disabled={matches({ editing: 'error' })}
                        onClick={() => send({ type: 'confirmResponseChange' })}
                        type='button'
                      >
                        <Icon fill='var(--light)' icon='check' size='medium' />
                      </button>
                      <div style={{ flex: '0 0 0.5rem' }} />
                      <button
                        className='flex justify-center items-center background-light flex-auto rounded h-100 shadow01'
                        onClick={() => send({ type: 'cancelResponseChange' })}
                        type='button'
                      >
                        <Icon fill='var(--dark)' icon='cross' size='medium' />
                      </button>
                    </>
                  ) : (
                    <button
                      className='ColoredButton flex justify-center items-center background-dark flex-expand rounded h-100 shadow01'
                      disabled={isEditing}
                      onClick={() =>
                        send({
                          type: 'edit',
                          optionIndexToEdit: i,
                          draftResponse: option,
                        })
                      }
                      type='button'
                    >
                      <Icon icon='pen' size='medium' />
                    </button>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
      <div
        className='flex justify-between items-center px-16 mS:px-32'
        style={{ flex: '0 0 5rem' }}
      >
        <button
          className='flex items-center text-button NavButton lowercase fw-700'
          disabled={isEditing}
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
        {choice !== -1 &&
          (currentQuizIndex === versionedQuizzes.length - 1 ? (
            <button
              className='ColoredButton text-button lowercase rounded fw-700 px-16 shadow01'
              disabled={isEditing}
              onClick={() => send({ type: 'next' })}
              style={{ height: '3rem' }}
              type='button'
            >
              Done!
            </button>
          ) : (
            <button
              className='flex items-center text-button NavButton lowercase fw-700'
              disabled={isEditing}
              onClick={() => send({ type: 'next' })}
              style={{ height: '3rem' }}
              type='button'
            >
              Next
              <Icon icon='chevron-right' size='large' />
            </button>
          ))}
      </div>
    </div>
  )
}
