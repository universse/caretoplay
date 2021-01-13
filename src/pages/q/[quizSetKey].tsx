import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import { createMachine, assign } from 'xstate'
import { useMachine } from '@xstate/react'
import { get } from 'idb-keyval'

import { Button, Text } from 'components/shared'
import { apiClient } from 'utils/apiClient'
import { apiServer } from 'utils/apiServer'
import { immerAssign } from 'utils/machineUtils'
import { EMPTY_QUIZ_SET, PERSISTED_QUIZSET_STORAGE_KEY } from 'utils/quizUtils'
import { QuizSet } from 'interfaces/shared'

function Loading() {
  return (
    <div className='overlay background-brand900'>
      <div className='Spinner' />
    </div>
  )
}

const NewQuizSet = dynamic(() => import('components/NewQuizSet'), {
  loading: Loading,
  ssr: false,
})

const ExistingQuizSet = dynamic(() => import('components/ExistingQuizSet'), {
  loading: Loading,
  ssr: false,
})

type QuizSetMachineContext = {
  quizSet: QuizSet
}

type QuizSetMachineEvent =
  | { type: 'continue' }
  | { type: 'startAfresh' }
  | { type: 'retry' }

type QuizSetMachineState = {
  value:
    | 'loading'
    | { loading: '' }
    | { loading: 'confirmContinue' }
    | 'error'
    | 'newQuizSet'
    | 'existingQuizSet'
  context: QuizSetMachineContext
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

function fetchPersistedQuizSet() {
  return get(PERSISTED_QUIZSET_STORAGE_KEY)
}

function createQuizSet() {
  return apiClient.createQuizSet()
}

function isExistingQuizSet(ctx) {
  return ctx.quizSet.status === 'finished'
}

function hasPersistedQuizSet(_, e) {
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
  },
  states: {
    loading: {
      initial: 'waiting',
      states: {
        hist: {
          type: 'history',
        },
        waiting: {
          always: [
            {
              cond: isExistingQuizSet,
              actions: [trackQuizSetVisit],
              target: '#quizSet.existingQuizSet',
            },
            {
              actions: ['redirectToDefaultNewQuizSetPage'],
              target: 'fetchingPersistedQuizSet',
            },
          ],
        },
        fetchingPersistedQuizSet: {
          invoke: {
            id: 'fetchPersistedQuizSet',
            src: fetchPersistedQuizSet,
            onDone: [
              {
                cond: hasPersistedQuizSet,
                actions: [assignQuizSet],
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
            startAfresh: {
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
              actions: [assignQuizSetKey],
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
    newQuizSet: {},
    existingQuizSet: {},
  },
})

export default function QuizPage({ quizSet }): JSX.Element {
  const router = useRouter()

  const [{ matches, context, value }, send] = useMachine(
    quizSetMachine
      .withContext({ ...quizSetMachine.context, quizSet })
      .withConfig({
        actions: {
          redirectToDefaultNewQuizSetPage: () =>
            router.replace('/q/new', undefined, {
              shallow: true,
            }),
        },
      })
  )

  return (
    <>
      {matches('loading') && !matches({ loading: 'confirmContinue' }) && (
        <Loading />
      )}
      {matches({ loading: 'confirmContinue' }) && (
        <div className='overlay background-brand100 px-16 mS:px-32'>
          <Text as='h6' className='color-dark text-center'>
            Do you want to continue with
            <br />
            your existing quiz?
          </Text>
          <div style={{ flex: '0 0 2rem' }} />
          <Button
            className='background-brand900'
            onClick={() => send('continue')}
            style={{ width: '12rem' }}
            type='button'
          >
            Continue
          </Button>
          <div style={{ flex: '0 0 1rem' }} />
          <Button
            className='background-gray100'
            onClick={() => send('startAfresh')}
            style={{ width: '12rem' }}
            type='button'
          >
            Start afresh
          </Button>
        </div>
      )}
      {matches('error') && (
        <div className='overlay background-brand900 px-16 mS:px-32'>
          <Text className='color-dark text-center'>
            Oh no, something went wrong.
          </Text>
          <div style={{ flex: '0 0 2rem' }} />
          <Button
            className='background-gray100'
            onClick={() => send('retry')}
            style={{ width: '12rem' }}
            type='button'
          >
            Retry
          </Button>
        </div>
      )}
      {matches('newQuizSet') && <NewQuizSet initialQuizSet={context.quizSet} />}
      {matches('existingQuizSet') && (
        <ExistingQuizSet initialQuizSet={context.quizSet} />
      )}
    </>
  )
}

export function getStaticPaths() {
  return {
    paths: [{ params: { quizSetKey: 'new' } }],
    fallback: 'blocking',
  }
}

export async function getStaticProps({ params: { quizSetKey } }) {
  const quizSet = await apiServer.fetchQuizSet(quizSetKey)

  return {
    props: { quizSet: { ...EMPTY_QUIZ_SET, ...quizSet } },
    revalidate: 1,
  }
}
