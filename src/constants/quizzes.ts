import { Stage, Quiz, QuizVersion } from 'interfaces/shared'

export const QUIZ_VERSION: QuizVersion = QuizVersion.v1

export const STAGES: Stage[] = ['casual', 'intimate', 'critical']

export const QUIZZES: Record<QuizVersion, Quiz[]> = {
  v1: [
    {
      stage: 'casual',
      canEdit: true,
      questionToAnswer: 'What brings joy in your life?',
      questionToGuess: 'What brings joy in {{name}}’s life?',
      options: [
        'Spending quality time with family',
        'Doing good for others',
        'Accomplishment in work',
        'Keeping an active lifestyle',
      ],
    },
    {
      stage: 'casual',
      canEdit: true,
      questionToAnswer:
        'If you were stuck on a deserted island, which item would you take?',
      questionToGuess:
        'If {{name}} were stuck on a deserted island, which item would {{name}} take?',
      options: ['A knife', 'A flashlight', 'A roasted chicken', 'An umbrella'],
    },
    {
      stage: 'casual',
      canEdit: true,
      questionToAnswer: 'How do you relax after a hard day of work?',
      questionToGuess: 'How does {{name}} relax after a hard day of work?',
      options: [
        'With a cup of relaxing tea',
        'Watching television',
        'Sharing about his/her day',
        'Taking a warm shower',
      ],
    },
    {
      stage: 'intimate',
      canEdit: true,
      questionToAnswer: 'If you had 24 hours left to live, what would you do?',
      questionToGuess:
        'If {{name}} had 24 hours left to live, what would {{name}} do?',
      options: [
        'Do the craziest thing that is on his/her bucket list',
        'Call up everyone to bid goodbye',
        'Find a good view and wait...',
        'Say “I love you.” to all his/her loved ones',
      ],
    },
    {
      stage: 'intimate',
      canEdit: false,
      questionToAnswer:
        'Would you rather die in 20 years with no regrets or die in 50 years with many regrets?',
      questionToGuess:
        'Would {{name}} rather die in 20 years with no regrets or die in 50 years with many regrets?',
      options: ['20 years with no regrets', '50 years with many regrets'],
    },
    {
      stage: 'intimate',
      canEdit: true,
      questionToAnswer:
        'Which is the dream destination you want to visit before you die?',
      questionToGuess:
        'Which is {{name}}’s dream destination to visit before {{name}} dies?',
      options: ['Hawaii', 'Venice', 'Paris', 'London'],
    },
    {
      stage: 'critical',
      canEdit: false,
      questionToAnswer:
        'If you were diagnosed with a serious illness and only had 1 month left to live, what would be your biggest fear?',
      questionToGuess:
        'If {{name}} were diagnosed with a serious illness and only had 1 month left to live, what would be {{name}}’s biggest fear?',
      options: [
        'Being in pain and suffering',
        'No one coming to his/her bed side',
        'Financial concerns',
        'Causing worry to my family',
      ],
    },
    {
      stage: 'critical',
      canEdit: false,
      questionToAnswer:
        'If you suddenly lost control over your body and could no longer move, what would you miss the most?',
      questionToGuess:
        'If {{name}} suddenly lost control over {{name}}’s body and could no longer move, what would {{name}} miss the most?',
      options: [
        'Being able to walk',
        'Being able to eat on my own',
        'Being able to talk',
        'Being able to bathe',
      ],
    },
    {
      stage: 'critical',
      canEdit: true,
      questionToAnswer:
        'In the event of hospitalisation, who would you trust to make important decisions on your behalf?',
      questionToGuess:
        'In the event of hospitalisation, who would {{name}} trust to make important decisions on {{name}}’s behalf?',
      options: ['Name of loved one', 'Name of loved one', 'Name of loved one'],
      hint:
        'Do take this opportunity to think of 3 loved ones who understand your wishes and values the most.',
    },
  ],
}
