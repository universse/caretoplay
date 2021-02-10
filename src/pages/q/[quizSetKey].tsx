import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import { createMachine } from 'xstate'
import { useMachine } from '@xstate/react'

import ErrorBoundary from 'components/ErrorBoundary'
import { Button, Text } from 'components/shared'
import { apiClient } from 'utils/apiClient'
import { apiServer } from 'utils/apiServer'
import { immerAssign } from 'utils/machineUtils'
import { EMPTY_QUIZ_SET } from 'utils/quizUtils'
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

function trackQuizSetVisit(ctx) {
  apiClient.snap('visit', ctx.quizSet.quizSetKey)
}

function createQuizSet() {
  return apiClient.createQuizSet()
}

function isExistingQuizSet(ctx) {
  return ctx.quizSet.status === 'finished'
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
              target: 'creatingQuizSet',
            },
          ],
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
    <ErrorBoundary>
      {matches('loading') && <Loading />}
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
    </ErrorBoundary>
  )
}

export async function getServerSideProps({ params: { quizSetKey }, res }) {
  const quizSet = await apiServer.fetchQuizSet(quizSetKey)

  if (quizSetKey === 'new' || quizSet.status === 'finished') {
    res.setHeader('Cache-Control', 'max-age=31536000, immutable')
  }

  return {
    props: { quizSet: { ...EMPTY_QUIZ_SET, ...quizSet } },
    revalidate: 1,
  }
}
