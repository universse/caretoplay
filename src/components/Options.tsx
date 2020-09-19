import { createMachine, assign, sendParent, Actor, Interpreter } from 'xstate'
import { useService } from '@xstate/react'

import { Question } from 'constants/quizzes'

type OptionsMachineContext = {
  optionIndex: number
  optionValue: string
}

type OptionsMachineEvent =
  | { type: 'edit'; optionIndex: number; optionValue: string }
  | { type: 'input'; value: string }
  | { type: 'cancelEdit' }
  | {
      type: 'answer'
      answer: {
        choice: number
        response: string
      }
    }

type OptionsMachineState = {
  value:
    | 'waiting'
    | { ready: 'loading' }
    | { ready: 'newQuiz' }
    | { ready: 'existingQuiz' }
  context: OptionsMachineContext
}

const setOptionToEdit = assign({
  optionIndex: (_, e) => e.optionIndex,
  optionValue: (_, e) => e.optionValue,
})

const inputNewResponse = assign({ optionValue: (_, e) => e.value })

const clearEdit = assign({ optionIndex: -1, optionValue: '' })

const forwardToParent = sendParent((_, e) => e)

export const optionsMachine = createMachine<
  OptionsMachineContext,
  OptionsMachineEvent,
  OptionsMachineState
>({
  id: 'options',
  initial: 'idle',
  context: {
    optionIndex: -1,
    optionValue: '',
  },
  on: {
    answer: { actions: [forwardToParent] },
  },
  states: {
    idle: {
      on: {
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
        cancelEdit: {
          actions: [clearEdit],
          target: 'idle',
        },
      },
    },
  },
})

export type OptionsActor = Interpreter<
  OptionsMachineContext,
  any,
  OptionsMachineEvent,
  OptionsMachineState
>

export default function Options({
  optionsService,
  question,
}: {
  optionsService: OptionsActor
  question: Question
}) {
  const [
    {
      matches,
      context: { optionIndex, optionValue },
    },
    send,
  ] = useService(optionsService)

  return (
    <>
      {question.options.map((option, i) => (
        <div key={i}>
          {optionIndex === i ? (
            <input
              onChange={(e) => send({ type: 'input', value: e.target.value })}
              type='text'
              value={optionValue}
            />
          ) : (
            <button
              disabled={matches('editing')}
              onClick={() =>
                send({
                  type: 'answer',
                  answer: { choice: i, response: option },
                })
              }
            >
              {option}
            </button>
          )}
          {question.canEdit && matches('editing') && optionIndex === i && (
            <>
              <button
                onClick={() =>
                  send({
                    type: 'answer',
                    answer: { choice: i, response: optionValue },
                  })
                }
              >
                Confirm
              </button>
              <button onClick={() => send({ type: 'cancelEdit' })}>
                Cancel
              </button>
            </>
          )}
          {question.canEdit && matches('idle') && (
            <button
              onClick={() =>
                send({ type: 'edit', optionIndex: i, optionValue: option })
              }
            >
              Edit
            </button>
          )}
        </div>
      ))}
    </>
  )
}
