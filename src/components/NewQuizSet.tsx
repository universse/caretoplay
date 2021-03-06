import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { createMachine, assign, spawn, sendParent } from 'xstate'
import { useMachine } from '@xstate/react'
import { object, bool, string } from 'yup'

import Footer from './Footer'
import Congratulations from './Congratulations'
import ACPLocations from './ACPLocations'
import ErrorBoundary from './ErrorBoundary'
import { Text, Button } from './shared'
import HeroImage from 'assets/illustrations/HeroImage'
import PersonalInfoScreen from 'screens/PersonalInfoScreen'
import StageScreen from 'screens/StageScreen'
import SubscriptionScreen from 'screens/SubscriptionScreen'
import QuizInputScreen, {
  quizInputMachine,
  QuizInputService,
} from 'screens/QuizInputScreen'
import { QUIZZES, QUIZ_VERSION } from 'constants/quizzes'
import { formMachine, FormService } from 'machines/formMachine'
import { apiClient } from 'utils/apiClient'
import { immerAssign } from 'utils/machineUtils'
import {
  PERSISTED_QUIZSET_STORAGE_KEY,
  FINISHED_QUIZSETS_STORAGE_KEY,
  EMPTY_QUIZ_SET,
  nextQuiz,
  previousQuiz,
  hasNextQuiz,
  hasPreviousQuiz,
  shouldShowStage,
} from 'utils/quizUtils'
import { socialShare, copyToClipboard } from 'utils/share'
import { QuizSet } from 'interfaces/shared'

type NewQuizSetContext = {
  quizSet: QuizSet
  currentQuizIndex: number
  personalInfoService: FormService | null
  quizInputServices: QuizInputService[]
  subscriptionService: FormService | null
}

type NewQuizSetEvent =
  | { type: 'changeName'; value: string }
  | { type: 'next' }
  | { type: 'back' }
  | {
      type: 'answer'
      choice: number
      response: string
    }
  | { type: 'retry' }
  | { type: 'share' }

type NewQuizSetState = {
  value:
    | 'askForPersonalInfo'
    | { askForPersonalInfo: 'inputting' }
    | { askForPersonalInfo: 'error' }
    | 'showingStage'
    | 'showingQuiz'
    | 'finishingQuizSet'
    | 'finishingQuizSetError'
    | 'outroduction'
    | 'askToSubscribe'
    | 'askToShare'
  context: NewQuizSetContext
}

const assignPersonalInfo = immerAssign((ctx, e) => {
  ctx.quizSet.name = e.name
  ctx.quizSet.personalInfo.age = e.age
})

const assignQuizInput = immerAssign((ctx, { options, choice }) => {
  ctx.quizSet.quizzes[ctx.currentQuizIndex] = { choice, options }
})

const spawnPersonalInfoService = assign({
  personalInfoService: ({ quizSet, personalInfoService }) => {
    const FIELD_VALUES = {
      name: quizSet.name || '',
      age: quizSet.personalInfo.age || '',
    }

    const SCHEMA = object({
      name: string().trim().required('Please enter your name or nickname.'),
      age: string().required('Please tell us your age.'),
    })

    const handleComplete = sendParent(({ fieldValues: { name, age } }) => ({
      type: 'next',
      name: name.trim(),
      age,
    }))

    return (
      personalInfoService ||
      spawn(
        formMachine
          .withContext({
            ...formMachine.context,
            fieldValues: FIELD_VALUES,
            schema: SCHEMA,
          })
          .withConfig({ actions: { handleComplete } })
      )
    )
  },
})

const spawnQuizInputService = assign({
  quizInputServices: ({ quizSet, currentQuizIndex, quizInputServices }) => {
    if (quizInputServices[currentQuizIndex]) return quizInputServices

    const quiz = QUIZZES[QUIZ_VERSION][currentQuizIndex]
    const savedQuiz = quizSet?.quizzes?.[currentQuizIndex]

    return [
      ...quizInputServices,
      spawn(
        quizInputMachine.withContext({
          ...quizInputMachine.context,
          choice: savedQuiz?.choice ?? -1,
          quiz: {
            ...quiz,
            options: quiz.options.map(
              (option, i) => savedQuiz?.options[i] || option
            ),
          },
        })
      ),
    ]
  },
})

const spawnSubscriptionService = assign({
  subscriptionService: ({
    quizSet: { quizSetKey, name },
    subscriptionService,
  }) => {
    const FIELD_VALUES = {
      email: '',
      maritalStatus: '',
      haveChildren: '',
      agreedToPDPA: false,
    }

    const SCHEMA = object({
      email: string()
        .trim()
        .email('Please enter a valid email address.')
        .required('Please enter your email address.'),
      maritalStatus: string().required('Please tell us your marital status.'),
      haveChildren: string().required('Please tell us if you have children.'),
      agreedToPDPA: bool().oneOf(
        [true],
        'Please agree to our request for data usage.'
      ),
    })

    const handleComplete = sendParent('next')

    async function handleSubmit({ fieldValues: { email, ...personalInfo } }) {
      return apiClient.subscribe(quizSetKey, name, {
        email: email.trim(),
        ...personalInfo,
      })
    }

    return (
      subscriptionService ||
      spawn(
        formMachine
          .withContext({
            ...formMachine.context,
            fieldValues: FIELD_VALUES,
            schema: SCHEMA,
          })
          .withConfig({
            actions: { handleComplete },
            services: { handleSubmit },
          })
      )
    )
  },
})

function finishQuizSet({ quizSet }) {
  let ref

  try {
    ref = window.localStorage.getItem('ccttppref')
  } catch {}

  return apiClient.saveQuizSetData({
    ...quizSet,
    quizVersion: QUIZ_VERSION,
    status: 'finished',
    ref,
  })
}

function shareQuizSet({ quizSet: { name, quizSetKey } }) {
  return socialShare({
    text: `Click this link to play: How well do you know ${name}?`,
    url: window.location.href,
  }).then(() => {
    apiClient.snap('share', quizSetKey)
  })
  // .catch((error) => {
  //   switch (error.name) {
  //     case 'Unsupported':
  //       // open share modal
  //       break

  //     case 'InternalError':
  //       // log
  //       break

  //     case 'ShareTimeout':
  //       // log
  //       break

  //     default:
  //       break
  //   }
  // })
}

function copyQuizSetUrl({ quizSet: { name, quizSetKey } }) {
  copyToClipboard(window.location.href)
  apiClient.snap('copy', quizSetKey)
}

export const newQuizSetMachine = createMachine<
  NewQuizSetContext,
  NewQuizSetEvent,
  NewQuizSetState
>({
  id: 'newQuizSet',
  initial: 'askForPersonalInfo',
  context: {
    quizSet: { ...EMPTY_QUIZ_SET },
    currentQuizIndex: -1,
    quizInputServices: [],
    personalInfoService: null,
    subscriptionService: null,
  },
  states: {
    askForPersonalInfo: {
      entry: [spawnPersonalInfoService],
      on: {
        next: {
          actions: [assignPersonalInfo],
          target: 'showingStage',
        },
      },
    },
    showingStage: {
      on: {
        next: {
          actions: [nextQuiz],
          target: 'showingQuiz',
        },
      },
    },
    showingQuiz: {
      entry: [spawnQuizInputService],
      on: {
        answer: [
          {
            cond: shouldShowStage,
            actions: [assignQuizInput],
            target: 'showingStage',
          },
          {
            cond: hasNextQuiz,
            actions: [assignQuizInput, nextQuiz],
            target: 'showingQuiz',
          },
          {
            actions: [assignQuizInput],
            target: 'finishingQuizSet',
          },
        ],
        back: [
          {
            cond: hasPreviousQuiz,
            actions: [previousQuiz],
          },
          { actions: [previousQuiz], target: 'askForPersonalInfo' },
        ],
      },
    },
    finishingQuizSet: {
      invoke: {
        id: 'finishQuizSet',
        src: finishQuizSet,
        onDone: {
          actions: ['redirectToNewQuizSet'],
          target: 'outroduction',
        },
        onError: { target: 'finishingQuizSetError' },
      },
    },
    finishingQuizSetError: {
      on: {
        retry: 'finishingQuizSet',
      },
    },
    outroduction: {
      on: {
        next: {
          target: 'askToSubscribe',
        },
      },
    },
    askToSubscribe: {
      entry: [spawnSubscriptionService],
      on: {
        next: {
          target: 'askToShare',
        },
      },
    },
    askToShare: {
      initial: 'idle',
      states: {
        idle: {
          on: {
            share: {
              target: 'sharing',
            },
          },
        },
        sharing: {
          invoke: {
            id: 'shareQuizSet',
            src: shareQuizSet,
            onDone: { target: 'shared' },
            onError: { actions: [copyQuizSetUrl], target: 'error' },
          },
        },
        shared: {},
        error: {},
      },
    },
  },
})

export default function NewQuizSet({
  initialQuizSet,
}: {
  initialQuizSet: any
}): JSX.Element {
  const router = useRouter()

  const [
    {
      matches,
      context: {
        currentQuizIndex,
        quizSet: { name },
        quizInputServices,
        personalInfoService,
        subscriptionService,
      },
      value,
    },
    send,
  ] = useMachine(
    newQuizSetMachine
      .withContext({
        ...newQuizSetMachine.context,
        quizSet: initialQuizSet,
      })
      .withConfig({
        actions: {
          redirectToNewQuizSet: (ctx) =>
            router.replace(`/q/${ctx.quizSet.quizSetKey}`, undefined, {
              shallow: true,
            }),
        },
      })
  )

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [value])

  const versionedQuizzes = QUIZZES[QUIZ_VERSION]
  const nextStep = () => send('next')

  return (
    <ErrorBoundary>
      {matches('askForPersonalInfo') && (
        <PersonalInfoScreen personalInfoService={personalInfoService} />
      )}
      {matches('showingStage') && (
        <StageScreen
          handleComplete={nextStep}
          stage={versionedQuizzes[currentQuizIndex + 1].stage}
        />
      )}
      {matches('showingQuiz') && (
        <QuizInputScreen
          currentQuizIndex={currentQuizIndex}
          handleBackButton={() => send('back')}
          name={name}
          quizInputService={quizInputServices[currentQuizIndex]}
          versionedQuizzes={versionedQuizzes}
        />
      )}
      {matches('finishingQuizSet') && (
        <div className='overlay background-brand900'>
          <div className='Spinner' />
        </div>
      )}
      {matches('finishingQuizSetError') && (
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
      {matches('outroduction') && (
        <div className='background-brand100'>
          <Congratulations />
          <div className='px-16 mS:px-32 py-24'>
            <ACPLocations />
          </div>
          <div className='flex justify-end px-16 mS:px-32 pb-48'>
            <Button
              className='background-gray100'
              onClick={nextStep}
              style={{ width: '7.5rem' }}
              type='button'
            >
              Next
            </Button>
          </div>
        </div>
      )}
      {matches('askToSubscribe') && (
        <SubscriptionScreen
          skipScreen={nextStep}
          subscriptionService={subscriptionService}
        />
      )}
      {matches('askToShare') && (
        <div className='flex flex-col h-100'>
          <div className='flex flex-col justify-center background-brand900 flex-expand px-16 mS:px-32 pb-48'>
            <div className='AspectRatio mx-auto' style={{ width: '64%' }}>
              <HeroImage />
            </div>
            <div style={{ flex: '0 0 1rem' }} />
            <Text
              as='h4'
              className='color-dark serif fw-800 text-center'
              element='h2'
            >
              You're almost done!
            </Text>
            <div style={{ flex: '0 0 1rem' }} />
            <Button
              className='background-gray100'
              onClick={() => send('share')}
              type='button'
            >
              Share this quiz with your loved ones!
            </Button>
            {matches({ askToShare: 'error' }) && (
              <>
                <div style={{ flex: '0 0 1rem' }} />
                <Text className='color-dark text-center' element='p'>
                  The link to the quiz has been copied.
                  <br />
                  Share the link with your loved one!
                </Text>
              </>
            )}
          </div>
          <Footer />
        </div>
      )}
    </ErrorBoundary>
  )
}
