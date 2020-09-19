export enum Stage {
  CASUAL = 'casual',
  INTIMATE = 'intimate',
  CRITICAL = 'critical',
}

export type Question = {
  question: string
  options: string[]
  canEdit: boolean
}

type StageData = {
  questions: Question[]
}

export const allStages: Stage[] = [Stage.CASUAL, Stage.INTIMATE, Stage.CRITICAL]

export const questionsByStage: Record<Stage, StageData> = {
  casual: {
    questions: [
      {
        question: 'What brings joy in Mary’s life?',
        options: [
          'Spending quality time with family',
          'Doing good for others',
          'Accomplishment in work',
          'Keeping an active lifestyle',
        ],
        canEdit: true,
      },
      {
        question:
          'If Mary were stuck on a deserted island, which will she will take with her?',
        options: [
          'A knife',
          'A flashlight',
          'A roasted chicken',
          'An umbrella',
        ],
        canEdit: true,
      },
      {
        question: 'How does Mary relax after a hard day of work?',
        options: [
          'With a cup of relaxing tea',
          'Watching television',
          'Sharing about his/her day',
          'Taking a warm shower',
        ],
        canEdit: true,
      },
    ],
  },
  intimate: {
    questions: [
      {
        question: 'If Mary had 24 hours left to live, what would she do?',
        options: [
          'Do the craziest thing that is on his/her bucket list',
          'Call up everyone to bid goodbye',
          'Find a good view and wait...',
          'Say “I love you.” to all his/her loved ones',
        ],
        canEdit: true,
      },
      {
        question:
          'Would Mary rather die in 20 years with no regrets or die in 50 years with many regrets?',
        options: ['20 years with no regrets', '50 years with many regrets'],
        canEdit: true,
      },
      {
        question:
          'Which is the dream destination Mary wants to visit before she dies?',
        options: ['Hawaii', 'Venice', 'Paris', 'London'],
        canEdit: true,
      },
    ],
  },
  critical: {
    questions: [
      {
        question:
          "What if Mary found out she has a bad illness & has 1 month to live. What's her biggest fear?",
        options: [
          'Being in pain and suffering',
          'No one coming to his/her bed side',
          'Financial concerns',
          'Causing worry to my family',
        ],
        canEdit: true,
      },
      {
        question:
          'If Mary suddenly lost control over her body and could no longer move, what would she miss the most?',
        options: [
          'Being able to walk',
          'Being able to eat on my own',
          'Being able to talk',
          'Being able to bathe',
        ],
        canEdit: true,
      },
      {
        question:
          'If Mary was hospitalized, the person that Mary trusts the most and can rely on to make decisions for her on her behalf is...',
        options: ['Mother', 'Father', 'Spouse', 'Sibling'],
        canEdit: true,
      },
    ],
  },
}
