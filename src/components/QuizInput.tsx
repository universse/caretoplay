import { createMachine, assign, sendParent, Interpreter } from 'xstate'
import { useService } from '@xstate/react'

import { immerAssign } from 'utils/quizUtils'
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

export type QuizInputService = Interpreter<
  QuizInputMachineContext,
  any,
  QuizInputMachineEvent,
  QuizInputMachineState
>

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

export default function QuizInput({
  quizInputService,
}: {
  quizInputService: QuizInputService
}): JSX.Element {
  const [
    {
      matches,
      context: { choice, optionIndexToEdit, draftResponse, quiz },
      value,
    },
    send,
  ] = useService(quizInputService)

  return (
    <div>
      {quiz.options.map((option, i) => (
        <div key={i}>
          {matches('editing') && optionIndexToEdit === i ? (
            <>
              <input
                onChange={(e) =>
                  send({ type: 'changeResponse', value: e.target.value })
                }
                type='text'
                value={draftResponse}
              />
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
            </>
          ) : (
            <button
              disabled={matches('editing')}
              onClick={() => send({ type: 'select', choice: i })}
              type='button'
            >
              {option}
            </button>
          )}
          {quiz.canEdit && !matches('editing') && (
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
          )}
        </div>
      ))}
      <button
        disabled={!matches('idle') || choice === -1}
        onClick={() => send({ type: 'answer' })}
        type='button'
      >
        Confirm
      </button>
    </div>
  )
}
