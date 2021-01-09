import { useEffect } from 'react'
import { createMachine, assign, spawn } from 'xstate'
import Image from 'next/image'
import { useMachine } from '@xstate/react'

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
import {
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
}

type ExistingQuizSetEvent =
  | {
      type: 'next'
    }
  | { type: 'back' }
  | { type: 'guess'; choice: number }

type ExistingQuizSetState = {
  value: 'introduction' | 'showingStage' | 'showingQuiz' | 'outroduction'
  context: ExistingQuizSetContext
}

const spawnQuizGuessService = assign({
  quizGuessServices: ({ quizSet, currentQuizIndex, quizGuessServices }) => {
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
        })
      ),
    ]
  },
})

function trackQuizSetComplete(ctx) {
  apiClient.snap('complete', ctx.quizSet.quizSetKey)
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
  },
  states: {
    introduction: {
      on: {
        next: {
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
            target: 'showingStage',
          },
          {
            cond: hasNextQuiz,
            actions: [nextQuiz],
            target: 'showingQuiz',
          },
          {
            actions: [trackQuizSetComplete],
            target: 'outroduction',
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
          <div className='px-16 mS:px-32 py-24'>
            <ACPLocations />
          </div>
          {email && (
            <div className='px-16 mS:px-32 mt-24 mb-8 mS:mb-16'>
              <div className='mx-auto' style={{ maxWidth: '21.875rem' }}>
                <svg
                  fill='none'
                  height='162'
                  preserveAspectRatio='none'
                  viewBox='0 0 358 162'
                  width='100%'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <g filter='url(#filter0_d)'>
                    <path
                      d='M20 0C11.1634 0 4 7.16344 4 16V104C4 112.837 11.1634 120 20 120H166.721L180 154L193.279 120H338C346.837 120 354 112.837 354 104V16C354 7.16344 346.837 0 338 0H20Z'
                      fill='#FACB6B'
                    />
                    <path
                      d='M169.05 119.091L168.428 117.5H166.721H20C12.5441 117.5 6.5 111.456 6.5 104V16C6.5 8.54416 12.5442 2.5 20 2.5H338C345.456 2.5 351.5 8.54415 351.5 16V104C351.5 111.456 345.456 117.5 338 117.5H193.279H191.572L190.95 119.09L180 147.128L169.05 119.091Z'
                      stroke='white'
                      strokeWidth='5'
                    />
                  </g>
                  <defs>
                    <filter
                      colorInterpolationFilters='sRGB'
                      filterUnits='userSpaceOnUse'
                      height='162'
                      id='filter0_d'
                      width='358'
                      x='0'
                      y='0'
                    >
                      <feFlood floodOpacity='0' result='BackgroundImageFix' />
                      <feColorMatrix
                        in='SourceAlpha'
                        type='matrix'
                        values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
                      />
                      <feOffset dy='4' />
                      <feGaussianBlur stdDeviation='2' />
                      <feColorMatrix
                        type='matrix'
                        values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0'
                      />
                      <feBlend
                        in2='BackgroundImageFix'
                        mode='normal'
                        result='effect1_dropShadow'
                      />
                      <feBlend
                        in='SourceGraphic'
                        in2='effect1_dropShadow'
                        mode='normal'
                        result='shape'
                      />
                    </filter>
                  </defs>
                </svg>
                <div
                  className='absolute top-0 flex items-center justify-center px-24'
                  style={{ height: '7.5rem' }}
                >
                  <Text
                    as='h6'
                    className='serif fw-800 color-dark text-center'
                    element='p'
                  >
                    Psst!
                    <br />
                    Because you completed guessing, {name} is now in this Lucky
                    Draw!
                  </Text>
                </div>
              </div>
            </div>
          )}
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
            <div className='background-gray900 px-16 mS:px-32 py-24'>
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
                + Breakfast for 2 at Alley on 25 (worth $880!)
              </Text>
              <Text as='body2' className='color-light text-center' element='p'>
                Winner will be announced and notified on 19 Feburary 2021.
              </Text>
            </div>
          </div>
          <div className='flex justify-center px-16 mS:px-32 py-24'>
            <Button className='background-brand500' element='a' href='/q/new'>
              Create your own quiz!
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
