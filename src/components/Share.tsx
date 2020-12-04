import { assign, createMachine } from 'xstate'
import { useService } from '@xstate/react'

import { immerAssign } from 'utils/machineUtils'

const assignEmail = immerAssign((ctx, e) => {
  ctx.data.email = e.value
})

const assignPDPA = immerAssign((ctx, e) => {
  ctx.data.agreedToPDPA = !ctx.data.agreedToPDPA
})

const assignErrors = assign({
  errors: ({ data: { email, agreedToPDPA } }, e) => ({
    email: email.trim() ? '' : 'Please enter your email.',
    pdpa: agreedToPDPA ? '' : 'Please check PDPA box.',
  }),
})

const assignClearErrors = assign({
  errors: ({ data: { email, agreedToPDPA } }, e) => ({
    email: email.trim() ? '' : 'Please enter your email.',
    pdpa: agreedToPDPA ? '' : 'Please check PDPA box.',
  }),
})

function isValid({ data: { email, agreedToPDPA } }) {
  return !!email.trim() && agreedToPDPA
}

export const shareMachine = createMachine({
  id: 'share',
  initial: 'inputting',
  context: {
    data: { email: '', agreedToPDPA: false },
    errors: {
      email: '',
      pdpa: '',
    },
  },
  states: {
    inputting: {
      on: {
        submit: [
          {
            cond: isValid,
            actions: [assignClearErrors],
            target: 'submitting',
          },
          { actions: [assignErrors] },
        ],
        changeEmail: {
          actions: [assignEmail],
        },
        togglePDPA: { actions: [assignPDPA] },
      },
    },
    submitting: {
      invoke: {
        id: 'submit',
        src: 'handleSubmit',
        onDone: { target: 'submitted' },
        onError: { target: 'submittingError' },
      },
    },
    submitted: {},
    submittingError: {
      on: {
        retry: { target: 'submitting' },
      },
    },
  },
})

export default function Share({ shareService }): JSX.Element {
  const [{ matches, context, value }, send] = useService(shareService)

  const {
    data: { email, agreedToPDPA },
  } = context
  console.log(value)
  return (
    <div>
      {matches('inputting') && (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            send('submit')
          }}
        >
          <input
            onChange={(e) =>
              send({ type: 'changeEmail', value: e.target.value })
            }
            type='text'
            value={email}
          />
          <input
            checked={agreedToPDPA}
            id='pdpa'
            onChange={() => send('togglePDPA')}
            type='checkbox'
          />
          <label htmlFor='pdpa'>PDPA</label>
          <button type='submit'>submit</button>
        </form>
      )}
      {matches('submitting') && <div>submitting</div>}
      {matches('submitted') && <div>done</div>}
    </div>
  )
}
