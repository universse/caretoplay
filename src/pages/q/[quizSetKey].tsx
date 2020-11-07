import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { createMachine, assign, spawn } from 'xstate'
import { useMachine } from '@xstate/react'
import { get } from 'idb-keyval'

import NewQuizSet, { newQuizSetMachine } from 'components/NewQuizSet'
import ExistingQuizSet, {
  existingQuizSetMachine,
} from 'components/ExistingQuizSet'
import { firebaseApp } from 'utils/firebaseApp'
import { CREATED_URL_PARAM, EMPTY_QUIZ_SET, STORAGE_KEY } from 'utils/quizUtils'
import { QuizSet } from 'interfaces/shared'

type QuizMachineContext = {
  quizSetKey: string
  quizSet: QuizSet
  newQuizSetService?: number
  existingQuizSetService?: number
}

type QuizMachineEvent =
  | { type: 'setQuizSetKey'; quizSetKey: string }
  | { type: 'retry' }
  | { type: 'next' }
  | { type: 'back' }
  | { type: 'edit'; optionIndex: number }
  | { type: 'input'; value: string }
  | { type: 'cancelEdit' }
  | {
      type: 'answer'
      answer: {
        choice: number
        response: string
      }
    }
  | {
      type: 'guess'
      choice: number
    }
  | { type: 'updateQuiz'; data: QuizSet }
  | { type: 'agree' }

type QuizMachineState =
  | {
      value: 'loading' | 'newQuizSet' | 'existingQuizSet'
      context: QuizMachineContext
    }
  | { value: 'newQuizSet'; context: QuizMachineContext & { newQuizSet: null } }
  | {
      value: 'existingQuizSet'
      context: QuizMachineContext & { existingQuizSet: null }
    }

const assignQuizSetKey = assign({ quizSetKey: (_, e) => e.quizSetKey })

const assignQuizSet = assign({
  quizSet: ({ quizSet }, e) => ({ ...quizSet, ...e.data }),
})

const spawnNewQuizSetService = assign({
  newQuizSetService: ({
    quizSetKey,
    quizSet: { currentQuizIndex, ...quizSet },
  }) =>
    spawn(
      newQuizSetMachine.withContext({
        ...newQuizSetMachine.context,
        quizSetKey,
        quizSet,
        // currentQuizIndex: currentQuizIndex ?? -1,
      })
    ),
})

const spawnExistingQuizSetService = assign({
  existingQuizSetService: ({ quizSetKey, quizSet }) =>
    spawn(
      existingQuizSetMachine.withContext({
        ...existingQuizSetMachine.context,
        quizSetKey,
        quizSet,
      })
    ),
})

function fetchQuizSet({ quizSetKey }: QuizMachineContext) {
  return firebaseApp?.fetchQuizSet(quizSetKey)
}

function fetchPersistedQuizSet() {
  return get(STORAGE_KEY)
}

function createQuizSet() {
  return firebaseApp?.createQuizSet()
}

function isNewQuizSet(_, e) {
  return e.data?.status === 'new'
}

function isExistingQuizSet(_, e) {
  return e.data?.status === 'finished'
}

function wasQuizSetPersisted(ctx, e) {
  return e.data?.quizSetKey === ctx.quizSetKey
}

const quizSetMachine = createMachine<
  QuizMachineContext,
  QuizMachineEvent,
  QuizMachineState
>({
  id: 'quizSet',
  initial: 'loading',
  context: {
    quizSetKey: '',
    quizSet: {
      ...EMPTY_QUIZ_SET,
    },
    newQuizSetService: null,
    existingQuizSetService: null,
  },
  states: {
    loading: {
      initial: 'waiting',
      states: {
        waiting: {
          on: {
            setQuizSetKey: [
              {
                cond: (_, e) => e[CREATED_URL_PARAM],
                actions: [assignQuizSetKey],
                target: '#quizSet.newQuizSet',
              },
              {
                actions: [assignQuizSetKey],
                target: 'fetchingQuizSet',
              },
            ],
          },
        },
        fetchingQuizSet: {
          invoke: {
            id: 'fetchQuizSet',
            src: fetchQuizSet,
            onDone: [
              { cond: isNewQuizSet, target: 'fetchingPersistedQuizSet' },
              {
                cond: isExistingQuizSet,
                actions: [assignQuizSet],
                target: '#quizSet.existingQuizSet',
              },
              { target: 'creatingQuizSet' },
            ],
            onError: {},
          },
        },
        fetchingPersistedQuizSet: {
          invoke: {
            id: 'fetchPersistedQuizSet',
            src: fetchPersistedQuizSet,
            onDone: [
              {
                cond: wasQuizSetPersisted,
                actions: [assignQuizSet],
                target: 'confirmContinue',
              },
              { target: 'creatingQuizSet' },
            ],
            onError: { target: 'creatingQuizSet' },
          },
        },
        creatingQuizSet: {
          invoke: {
            id: 'createQuizSet',
            src: createQuizSet,
            onDone: {
              actions: [
                'redirectToNewQuizSet',
                assign({
                  quizSetKey: (_, e) => e.data,
                }),
              ],
              target: '#quizSet.newQuizSet',
            },
            onError: {},
          },
        },
        confirmContinue: {
          on: {
            continue: {
              target: '#quizSet.newQuizSet',
            },
            createNew: {
              actions: [assign({ quizSet: { ...EMPTY_QUIZ_SET } })],
              target: 'creatingQuizSet',
            },
          },
        },
      },
    },
    newQuizSet: {
      entry: [spawnNewQuizSetService],
    },
    existingQuizSet: {
      entry: [spawnExistingQuizSetService],
    },
  },
})

export default function QuizPage(): JSX.Element {
  const { query, replace } = useRouter()

  const [
    {
      matches,
      context: { quizSetKey, newQuizSetService, existingQuizSetService },
      value,
    },
    send,
  ] = useMachine(
    quizSetMachine.withConfig({
      actions: {
        redirectToNewQuizSet: (_, { data }) =>
          replace(`/q/${data}`, `/q/${data}`),
      },
    })
  )

  useEffect(() => {
    const { quizSetKey } = query

    typeof quizSetKey === 'string' &&
      send({
        type: 'setQuizSetKey',
        quizSetKey,
        [CREATED_URL_PARAM]: !!query[CREATED_URL_PARAM],
      })

    window.xsend = send
  }, [query, send])

  return (
    <div>
      {matches('loading') && <div>Loading...</div>}
      {matches('newQuizSet') && (
        <NewQuizSet newQuizSetService={newQuizSetService} />
      )}
      {matches('existingQuizSet') && (
        <ExistingQuizSet existingQuizSetService={existingQuizSetService} />
      )}
    </div>
  )
}
