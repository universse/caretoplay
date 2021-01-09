import { assign, createMachine, ActorRefFrom } from 'xstate'

import { immerAssign } from 'utils/machineUtils'

export type FormService = ActorRefFrom<typeof formMachine>

export const formMachine = createMachine(
  {
    id: 'form',
    initial: 'editing',
    context: {
      fieldValues: {},
      fieldErrors: {},
      formError: false,
      schema: null,
    },
    states: {
      editing: {
        on: {
          change: [
            // {
            //   cond: 'shouldValidateOnChange',
            //   actions: ['validateField', 'changeValue'],
            // },
            {
              actions: ['changeValue'],
            },
          ],
          blur: { actions: ['validateField'] },
          submit: { target: 'validating' },
        },
      },
      validating: {
        entry: ['validateFields', 'clearSubmissionError'],
        always: [
          { cond: 'hasInvalidFields', target: 'editing' },
          { target: 'submitting' },
        ],
      },
      submitting: {
        invoke: {
          id: 'handleSubmit',
          src: 'handleSubmit',
          onDone: { target: 'complete' },
          onError: [
            {
              cond: 'isSubmissionError',
              actions: ['handleSubmissionError'],
              target: 'editing',
            },
            {
              actions: ['clearSubmissionError', 'setRemoteFieldErrors'],
              target: 'editing',
            },
          ],
        },
      },
      complete: {
        entry: ['handleComplete'],
        always: {
          target: 'editing',
        },
      },
    },
  },
  {
    guards: {
      hasInvalidFields(ctx) {
        return Object.values(ctx.fieldErrors).some((error) => error.length)
      },

      isSubmissionError(_, e) {
        return e.data.status === 500
      },
    },
    services: {
      async handleSubmit() {
        return
      },
    },
    actions: {
      changeValue: immerAssign((ctx, { field, value }) => {
        ctx.fieldValues[field] = value
      }),

      handleComplete() {
        return
      },

      handleSubmissionError: assign({
        formError: true,
      }),

      clearSubmissionError: assign({ formError: false }),

      setRemoteFieldErrors: immerAssign((ctx, e) => {
        Object.entries(e.data.fieldErrors).forEach(([field, errors]) => {
          ctx.fieldErrors[field] = errors
        })
      }),

      validateFields: assign({
        fieldErrors: ({ fieldValues, schema }) => {
          const fieldErrors = {}

          try {
            schema.validateSync(fieldValues, { abortEarly: false })
          } catch ({ inner }) {
            inner.forEach(({ path, errors }) => {
              fieldErrors[path] = errors
            })
          }

          return fieldErrors
        },
      }),
    },
  }
)
