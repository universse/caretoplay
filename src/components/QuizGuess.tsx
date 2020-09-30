import { createMachine, assign, sendParent, Interpreter } from 'xstate'
import { useService } from '@xstate/react'

import { Quiz } from 'constants/quizzes'

type QuizMachineContext = {
  optionIndexToEdit: number
  draftOptionValue: string
  quiz: Quiz
}

type QuizMachineEvent =
  | { type: 'edit'; optionIndexToEdit: number; draftOptionValue: string }
  | { type: 'input'; value: string }
  | { type: 'save' }
  | { type: 'cancel' }
  | {
      type: 'answer'
      choice: number
    }

type QuizMachineState = {
  value:
    | 'waiting'
    | { ready: 'loading' }
    | { ready: 'newQuiz' }
    | { ready: 'existingQuiz' }
  context: QuizMachineContext
}

const setOptionToEdit = assign({
  optionIndexToEdit: (_, e) => e.optionIndexToEdit,
  draftOptionValue: (_, e) => e.draftOptionValue,
})

const inputNewResponse = assign({ draftOptionValue: (_, e) => e.value })

const saveOption = assign({
  quiz: ({ optionIndexToEdit, draftOptionValue, quiz }) => ({
    ...quiz,
    options: quiz.options.map((option, i) =>
      i === optionIndexToEdit ? draftOptionValue : option
    ),
  }),
})

const clearEdit = assign({ optionIndexToEdit: -1, draftOptionValue: '' })

const sendEditedQuizToParent = sendParent(
  ({ quiz: { options } }, { choice }) => ({
    type: 'answer',
    options,
    choice,
  })
)

export const quizMachine = createMachine<
  QuizMachineContext,
  QuizMachineEvent,
  QuizMachineState
>({
  id: 'quiz',
  initial: 'idle',
  context: {
    optionIndexToEdit: -1,
    draftOptionValue: '',
    quiz: null,
  },
  states: {
    idle: {
      on: {
        answer: { actions: [sendEditedQuizToParent] },
        edit: {
          actions: [setOptionToEdit],
          target: 'editing',
        },
      },
    },
    editing: {
      on: {
        input: {
          actions: [inputNewResponse],
        },
        save: {
          actions: [saveOption, clearEdit],
          target: 'idle',
        },
        cancel: {
          actions: [clearEdit],
          target: 'idle',
        },
      },
    },
  },
})

export type QuizActor = Interpreter<
  QuizMachineContext,
  any,
  QuizMachineEvent,
  QuizMachineState
>

export default function QuizInput({
  questionService,
}: {
  questionService: QuizActor
}) {
  const [
    {
      matches,
      context: { optionIndexToEdit, draftOptionValue, quiz },
    },
    send,
  ] = useService(questionService)

  return (
    <div>
      <div>{quiz.question}</div>
      {quiz.options.map((option, i) => (
        <div key={i}>
          {matches('editing') && optionIndexToEdit === i ? (
            <>
              <input
                onChange={(e) => send({ type: 'input', value: e.target.value })}
                type='text'
                value={draftOptionValue}
              />
              <button type='button' onClick={() => send({ type: 'save' })}>
                Save
              </button>
              <button type='button' onClick={() => send({ type: 'cancel' })}>
                Cancel
              </button>
            </>
          ) : (
            <button
              type='button'
              disabled={matches('editing')}
              onClick={() => send({ type: 'answer', choice: i })}
            >
              {option}
            </button>
          )}
          {quiz.canEdit && matches('idle') && (
            <button
              type='button'
              onClick={() =>
                send({
                  type: 'edit',
                  optionIndexToEdit: i,
                  draftOptionValue: option,
                })
              }
            >
              Edit
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
