import { Stage, Quiz, QuizVersion } from 'interfaces/shared'

export const QUIZ_VERSION: QuizVersion = QuizVersion.v1

export const STAGES: Stage[] = ['casual', 'intimate', 'critical']

export const QUIZZES: Record<QuizVersion, Quiz[]> = {
  v1: [
    {
      stage: 'casual',
      canEdit: true,
      question: 'What brings joy in {{name}}’s life?',
      options: [
        'Spending quality time with family',
        'Doing good for others',
        'Accomplishment in work',
        'Keeping an active lifestyle',
      ],
      animationAlt: '',
      animationSrc: require('assets/gifs/joy-in-life.gif'),
    },
    {
      stage: 'casual',
      canEdit: true,
      question:
        'If {{name}} were stuck on a deserted island, which item would {{name}} take?',
      options: ['Knife', 'Flashlight', 'Roasted chicken', 'Umbrella'],
      animationAlt: '',
      animationSrc: require('assets/gifs/deserted-island.gif'),
    },
    {
      stage: 'casual',
      canEdit: true,
      question: 'How does {{name}} relax after a hard day of work?',
      options: [
        'Drink a cup of tea',
        'Watch television',
        'Share about his/her day',
        'Take a warm shower',
      ],
      animationAlt: '',
      animationSrc: require('assets/gifs/after-work.gif'),
    },
    {
      stage: 'intimate',
      canEdit: true,
      question:
        'If {{name}} had 24 hours left to live, what would {{name}} do?',
      options: [
        'Do the craziest thing that is on his/her bucket list',
        'Call up everyone to bid goodbye',
        'Find a good view and wait',
        'Say “I love you.” to all his/her loved ones',
      ],
      animationAlt: '',
      animationSrc: require('assets/gifs/24-hours.gif'),
    },
    {
      stage: 'intimate',
      canEdit: false,
      question:
        'Would {{name}} rather die in 20 years with no regrets or die in 50 years with many regrets?',
      options: ['20 years with no regrets', '50 years with many regrets'],
      animationAlt: '',
      animationSrc: require('assets/gifs/regrets-vs-no-regrets.gif'),
    },
    {
      stage: 'intimate',
      canEdit: true,
      question:
        'What is the dream destination {{name}} wants to visit before he/she dies?',
      options: ['Hawaii', 'Venice', 'Paris', 'London'],
      animationAlt: '',
      animationSrc: require('assets/gifs/dream-destination.gif'),
    },
    {
      stage: 'critical',
      canEdit: false,
      question:
        '{{name}} is diagnosed with a serious illness and only has 1 month left to live. What would be {{name}}’s biggest fear?',
      options: [
        'Being in pain and suffering',
        'No one coming to his/her bed side',
        'Financial concerns',
        'Causing worry to his/her family',
      ],
      animationAlt: '',
      animationSrc: require('assets/gifs/1-month.gif'),
    },
    {
      stage: 'critical',
      canEdit: false,
      question:
        'If {{name}} suddenly lost control over his/her body and could no longer move, what would {{name}} miss the most?',
      options: [
        'Being able to walk',
        'Being able to eat independently',
        'Being able to talk',
        'Being able to bathe independently',
      ],
      animationAlt: '',
      animationSrc: require('assets/gifs/cannot-move.gif'),
    },
    {
      stage: 'critical',
      canEdit: true,
      question:
        'In the event of hospitalisation, who would {{name}} entrust to make important decisions on {{name}}’s behalf?',
      options: ['Name of loved one', 'Name of loved one', 'Name of loved one'],
      animationAlt: '',
      animationSrc: require('assets/gifs/spokesperson-dark.gif'),
      hint:
        'Do take this opportunity to think of 3 loved ones who understand your wishes and values the most.',
    },
  ],
}
