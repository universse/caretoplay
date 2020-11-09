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
import { firebaseApp } from 'utils/firebaseApp'
import { EMPTY_QUIZ_SET, STORAGE_KEY, immerAssign } from 'utils/quizUtils'
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

type QuizSetMachineState =
  | {
      value: 'loading' | { loading: '' } | { loading: 'confirmContinue' }
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

const assignQuizSet = assign({
  quizSet: ({ quizSet }, e) => ({ ...quizSet, ...e.data }),
})

const assignEmptyQuizSet = assign({ quizSet: { ...EMPTY_QUIZ_SET } })

const spawnNewQuizSetService = assign({
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
  return firebaseApp?.fetchQuizSet(ctx.quizSet.quizSetKey)
}

function fetchPersistedQuizSet() {
  return get(STORAGE_KEY)
}

function createQuizSet() {
  return firebaseApp?.createQuizSet()
}

function hasQuizSetKey(_, e) {
  return e.data.quizSetKey
}

function isNewQuizSet(_, e) {
  return e.data?.status === 'new'
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
                actions: [assignQuizSet],
                target: '#quizSet.existingQuizSet',
              },
              { target: 'fetchingPersistedQuizSet' },
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
            onError: { target: 'creatingQuizSet' },
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
            onError: {},
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
  const { replace } = useRouter()

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
    send({
      type: 'setQuizSetKey',
      data: {
        quizSetKey:
          window.location.pathname.replace('/q', '').split('/')[1] || '',
      },
    })
  }, [send])

  return (
    <div>
      {matches('loading') && <div>Loading...</div>}
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
