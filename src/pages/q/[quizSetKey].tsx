import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { createMachine, assign, spawn } from 'xstate'
import { useMachine } from '@xstate/react'
import { get } from 'idb-keyval'

import NewQuizSet, {
  newQuizSetMachine,
  NewQuizSetService,
} from 'components/NewQuizSet'
import ExistingQuizSet, {
  existingQuizSetMachine,
  ExistingQuizSetService,
} from 'components/ExistingQuizSet'
import { apiClient } from 'utils/apiClient'
import { immerAssign } from 'utils/machineUtils'
import { EMPTY_QUIZ_SET, PERSISTED_QUIZSET_STORAGE_KEY } from 'utils/quizUtils'
import { QuizSet } from 'interfaces/shared'

type QuizSetMachineContext = {
  quizSet: QuizSet
  newQuizSetService: NewQuizSetService | null
  existingQuizSetService: ExistingQuizSetService | null
}

type QuizSetMachineEvent =
  | {
      type: 'setQuizSetKey'
      data: { quizSetKey: string }
    }
  | { type: 'continue' }
  | { type: 'createNew' }
  | { type: 'retry' }

type QuizSetMachineState =
  | {
      value:
        | 'loading'
        | { loading: '' }
        | { loading: 'confirmContinue' }
        | 'error'
      context: QuizSetMachineContext & {
        newQuizSetService: null
        existingQuizSetService: null
      }
    }
  | {
      value: 'newQuizSet'
      context: QuizSetMachineContext & { newQuizSetService: NewQuizSetService }
    }
  | {
      value: 'existingQuizSet'
      context: QuizSetMachineContext & {
        existingQuizSetService: ExistingQuizSetService
      }
    }

const assignQuizSetKey = immerAssign((ctx, e) => {
  ctx.quizSet.quizSetKey = e.data.quizSetKey
})

const assignQuizSet = assign<QuizSetMachineContext>({
  quizSet: ({ quizSet }, e) => ({ ...quizSet, ...e.data }),
})

const assignEmptyQuizSet = assign({ quizSet: { ...EMPTY_QUIZ_SET } })

function trackQuizSetVisit(ctx) {
  apiClient.snap('visit', ctx.quizSet.quizSetKey)
}

const spawnNewQuizSetService = assign<QuizSetMachineContext>({
  newQuizSetService: ({ quizSet }) =>
    spawn(
      newQuizSetMachine.withContext({
        ...newQuizSetMachine.context,
        quizSet,
      })
    ),
})

const spawnExistingQuizSetService = assign({
  existingQuizSetService: ({ quizSet }) =>
    spawn(
      existingQuizSetMachine.withContext({
        ...existingQuizSetMachine.context,
        quizSet,
      })
    ),
})

function fetchQuizSet(ctx: QuizSetMachineContext) {
  return apiClient.fetchQuizSet(ctx.quizSet.quizSetKey)
}

function fetchPersistedQuizSet() {
  return get(PERSISTED_QUIZSET_STORAGE_KEY)
}

function createQuizSet() {
  return apiClient.createQuizSet()
}

function hasQuizSetKey(_, e) {
  return e.data.quizSetKey !== 'new'
}

function isExistingQuizSet(_, e) {
  return e.data?.status === 'finished'
}

function isOwnerOfPersistedQuizSet(ctx, e) {
  return e.data?.quizSetKey === ctx.quizSet.quizSetKey
}

function isAnotherQuizSetPersisted(_, e) {
  return e.data
}

const quizSetMachine = createMachine<
  QuizSetMachineContext,
  QuizSetMachineEvent,
  QuizSetMachineState
>({
  id: 'quizSet',
  initial: 'loading',
  context: {
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
        hist: {
          type: 'history',
        },
        waiting: {
          on: {
            setQuizSetKey: [
              {
                cond: hasQuizSetKey,
                actions: [assignQuizSetKey],
                target: 'fetchingQuizSet',
              },
              { target: 'fetchingPersistedQuizSet' },
            ],
          },
        },
        fetchingQuizSet: {
          invoke: {
            id: 'fetchQuizSet',
            src: fetchQuizSet,
            onDone: [
              {
                cond: isExistingQuizSet,
                actions: [assignQuizSet, trackQuizSetVisit],
                target: '#quizSet.existingQuizSet',
              },
              { target: 'fetchingPersistedQuizSet' },
            ],
            onError: { target: '#quizSet.error' },
          },
        },
        fetchingPersistedQuizSet: {
          invoke: {
            id: 'fetchPersistedQuizSet',
            src: fetchPersistedQuizSet,
            onDone: [
              {
                cond: isOwnerOfPersistedQuizSet,
                actions: [assignQuizSet],
                target: 'confirmContinue',
              },
              {
                cond: isAnotherQuizSetPersisted,
                actions: ['redirectToNewQuizSet', assignQuizSet],
                target: 'confirmContinue',
              },
              { target: 'creatingQuizSet' },
            ],
            onError: { target: '#quizSet.error' },
          },
        },
        confirmContinue: {
          on: {
            continue: {
              target: '#quizSet.newQuizSet',
            },
            createNew: {
              actions: [assignEmptyQuizSet],
              target: 'creatingQuizSet',
            },
          },
        },
        creatingQuizSet: {
          invoke: {
            id: 'createQuizSet',
            src: createQuizSet,
            onDone: {
              actions: ['redirectToNewQuizSet', assignQuizSetKey],
              target: '#quizSet.newQuizSet',
            },
            onError: { target: '#quizSet.error' },
          },
        },
      },
    },
    error: {
      on: {
        retry: 'loading.hist',
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
  const {
    query: { quizSetKey },
    replace,
  } = useRouter()

  const [
    {
      matches,
      context: { newQuizSetService, existingQuizSetService },
      value,
    },
    send,
  ] = useMachine(
    quizSetMachine.withConfig({
      actions: {
        redirectToNewQuizSet: (_, e) => replace(`/q/${e.data.quizSetKey}`),
      },
    })
  )

  useEffect(() => {
    typeof quizSetKey === 'string' &&
      send({
        type: 'setQuizSetKey',
        data: {
          quizSetKey,
        },
      })
  }, [quizSetKey, send])

  return (
    <div>
      {matches('loading') && <div>Loading...</div>}
      {matches('error') && (
        <div>
          <button onClick={() => send('retry')} type='button'>
            Retry
          </button>
        </div>
      )}
      {matches({ loading: 'confirmContinue' }) && (
        <div>
          <button onClick={() => send('continue')} type='button'>
            Continue
          </button>
          <button onClick={() => send('createNew')} type='button'>
            Create new
          </button>
        </div>
      )}
      {matches('newQuizSet') && (
        <NewQuizSet newQuizSetService={newQuizSetService} />
      )}
      {matches('existingQuizSet') && (
        <ExistingQuizSet existingQuizSetService={existingQuizSetService} />
      )}
    </div>
  )
}
