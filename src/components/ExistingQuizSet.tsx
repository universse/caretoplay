import { useEffect } from 'react'
import { createMachine, assign, spawn } from 'xstate'
import Image from 'next/image'
import { useMachine } from '@xstate/react'
import { get, set } from 'idb-keyval'

import Congratulations from './Congratulations'
import ACPLocations from './ACPLocations'
import { Button, Text } from './shared'
import LandingScreen from 'screens/LandingScreen'
import StageScreen from 'screens/StageScreen'
import QuizGuessScreen, {
  quizGuessMachine,
  QuizGuessService,
} from 'screens/QuizGuessScreen'
import { QUIZZES, QUIZ_VERSION } from 'constants/quizzes'
import { apiClient } from 'utils/apiClient'
import { immerAssign } from 'utils/machineUtils'
import {
  COMPLETED_QUIZSETS_STORAGE_KEY,
  EMPTY_QUIZ_SET,
  nextQuiz,
  previousQuiz,
  hasNextQuiz,
  hasPreviousQuiz,
  shouldShowStage,
} from 'utils/quizUtils'
import { QuizSet } from 'interfaces/shared'

type ExistingQuizSetContext = {
  quizSet: QuizSet
  currentQuizIndex: number
  quizGuessServices: QuizGuessService[]
  persistedGuesses: number[]
}

type ExistingQuizSetEvent =
  | {
      type: 'next'
    }
  | { type: 'back' }
  | { type: 'review' }
  | { type: 'startAfresh' }
  | { type: 'guess'; choice: number }
  | { type: 'retry' }

type ExistingQuizSetState = {
  value:
    | 'introduction'
    | 'confirmReview'
    | 'showingStage'
    | 'showingQuiz'
    | 'outroduction'
  context: ExistingQuizSetContext
}

const spawnQuizGuessService = assign({
  quizGuessServices: ({
    persistedGuesses,
    quizSet,
    currentQuizIndex,
    quizGuessServices,
  }) => {
    if (quizGuessServices[currentQuizIndex]) return quizGuessServices

    const { choice, options } = quizSet.quizzes[currentQuizIndex]

    return [
      ...quizGuessServices,
      spawn(
        quizGuessMachine.withContext({
          ...quizGuessMachine.context,
          quiz: {
            ...QUIZZES[QUIZ_VERSION][currentQuizIndex],
            choice,
            options,
          },
          choice: persistedGuesses[currentQuizIndex] ?? -1,
        })
      ),
    ]
  },
})

function trackQuizSetComplete(ctx) {
  apiClient.snap('complete', ctx.quizSet.quizSetKey)
}

function trackQuizSetReview(ctx) {
  apiClient.snap('review', ctx.quizSet.quizSetKey)
}

async function fetchPersistedGuess({ quizSet: { quizSetKey } }) {
  const completedQuizSets = (await get(COMPLETED_QUIZSETS_STORAGE_KEY)) || {}
  return completedQuizSets?.[quizSetKey]
}

const assignPersistedGuesses = assign({
  persistedGuesses: (_, e) => e.data?.persistedGuesses || [],
})
const assignEmptyGuesses = assign({ persistedGuesses: [] })

const saveGuess = immerAssign((ctx, { choice }) => {
  ctx.persistedGuesses[ctx.currentQuizIndex] = choice
})

function hasPersistedGuesses(_, e) {
  return e.data
}

async function completeQuizSet({ quizSet: { quizSetKey }, persistedGuesses }) {
  const completedQuizSets = (await get(COMPLETED_QUIZSETS_STORAGE_KEY)) || {}

  completedQuizSets[quizSetKey] = { persistedGuesses }

  return set(COMPLETED_QUIZSETS_STORAGE_KEY, completedQuizSets)
}

export const existingQuizSetMachine = createMachine<
  ExistingQuizSetContext,
  ExistingQuizSetEvent,
  ExistingQuizSetState
>({
  id: 'existingQuizSet',
  initial: 'introduction',
  context: {
    quizSet: { ...EMPTY_QUIZ_SET },
    currentQuizIndex: -1,
    quizGuessServices: [],
    persistedGuesses: [],
  },
  states: {
    introduction: {
      on: {
        next: {
          target: 'fetchingPersistedGuess',
        },
      },
    },
    fetchingPersistedGuess: {
      invoke: {
        id: 'fetchPersistedGuess',
        src: fetchPersistedGuess,
        onDone: [
          {
            cond: hasPersistedGuesses,
            actions: [assignPersistedGuesses],
            target: 'confirmReview',
          },
          { target: 'showingStage' },
        ],
        onError: { target: 'showingStage' },
      },
    },
    confirmReview: {
      on: {
        review: {
          actions: [trackQuizSetReview],
          target: 'showingStage',
        },
        startAfresh: {
          actions: [assignEmptyGuesses],
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
      entry: [spawnQuizGuessService],
      on: {
        guess: [
          {
            cond: shouldShowStage,
            actions: [saveGuess],
            target: 'showingStage',
          },
          {
            cond: hasNextQuiz,
            actions: [saveGuess, nextQuiz],
            target: 'showingQuiz',
          },
          {
            actions: [saveGuess, trackQuizSetComplete],
            target: 'completingQuizSet',
          },
        ],
        back: [
          {
            cond: hasPreviousQuiz,
            actions: [previousQuiz],
          },
          { actions: [previousQuiz], target: 'introduction' },
        ],
      },
    },
    completingQuizSet: {
      invoke: {
        id: 'completeQuizSet',
        src: completeQuizSet,
        onDone: { target: 'outroduction' },
        onError: { target: 'completingQuizSetError' },
      },
    },
    completingQuizSetError: {
      on: {
        retry: 'completingQuizSet',
      },
    },
    outroduction: {},
  },
})

export default function ExistingQuizSet({
  initialQuizSet,
}: {
  initialQuizSet: any
}): JSX.Element {
  const [
    {
      matches,
      context: {
        persistedGuesses,
        quizSet: {
          name,
          personalInfo: { email },
        },
        currentQuizIndex,
        quizGuessServices,
      },
      value,
    },
    send,
  ] = useMachine(
    existingQuizSetMachine.withContext({
      ...existingQuizSetMachine.context,
      quizSet: initialQuizSet,
    })
  )

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [value])

  const versionedQuizzes = QUIZZES[QUIZ_VERSION]

  const nextStep = () => send('next')

  return (
    <>
      {matches('introduction') && (
        <LandingScreen name={name} nextStep={nextStep} />
      )}
      {matches('confirmReview') && (
        <div>
          <button onClick={() => send('review')} type='button'>
            Review
          </button>
          <button onClick={() => send('startAfresh')} type='button'>
            Start afresh
          </button>
        </div>
      )}
      {matches('showingStage') && (
        <StageScreen
          handleComplete={nextStep}
          stage={versionedQuizzes[currentQuizIndex + 1].stage}
        />
      )}
      {matches('showingQuiz') && (
        <QuizGuessScreen
          currentQuizIndex={currentQuizIndex}
          handleBackButton={() => send('back')}
          name={name}
          quizGuessService={quizGuessServices[currentQuizIndex]}
          versionedQuizzes={versionedQuizzes}
        />
      )}
      {matches('outroduction') && (
        <div className='background-brand100'>
          <Congratulations />
          <div className='px-16 py-24'>
            <ACPLocations />
          </div>
          {email ? `${name} entered giveaway` : ''}
          <div>
            <a
              className='AspectRatio _16-9 block'
              href='https://www.hyatt.com/en-US/hotel/singapore/andaz-singapore/sinaz/dining'
              rel='noopener noreferrer'
              target='_blank'
            >
              <Image
                alt='Hyatt website'
                layout='fill'
                objectFit='cover'
                src={`/assets/images/giveaway.jpg`}
              />
            </a>
            <div className='background-gray900 px-16 py-24'>
              <Text
                as='h6'
                className='color-light serif fw-800 uppercase text-center'
                element='p'
              >
                Stand a chance to
              </Text>
              <Text
                as='h4'
                className='color-brand300 serif fw-800 uppercase text-center'
                element='p'
              >
                win our grand prize
              </Text>
              <Text
                as='h6'
                className='color-light serif fw-800 uppercase text-center'
                element='p'
              >
                A 3D2N stay at Andaz Singapore!
              </Text>
              <Text
                as='body1'
                className='color-light serif fw-800 text-center'
                element='p'
              >
                + Breakfast for 2 at Alley on 25 (worth $880!).
              </Text>
              <Text as='body2' className='color-light text-center' element='p'>
                Winner will be announced and notified on 19 Feburary 2021.
              </Text>
            </div>
          </div>
          <div className='flex justify-center px-16 py-24'>
            <Button className='background-brand500' element='a' href='/q/new'>
              Create your own quiz!
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
