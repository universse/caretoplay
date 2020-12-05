import { createMachine, assign, interpret } from 'xstate'
import * as firebase from 'firebase-admin'
import { NextApiRequest, NextApiResponse } from 'next'

import { restRequestRetry } from '../../../nodeUtils/restRequest'

const ErrorMessages = {
  '01': 'Sending completion email failed',
}

const initializeDatabase = assign(({ database }) => {
  !firebase.apps.length &&
    firebase.initializeApp({
      credential: firebase.credential.cert(
        JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      ),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    })

  return {
    database: database || firebase.database(),
  }
})

const completeQuizSetMachine = createMachine({
  id: 'completeQuizSet',
  initial: 'fetchingQuizSet',
  context: {
    relationship: '',
    email: '',
    name: '',
    quizSetKey: '',
    code: '',
    error: {
      status: 500,
      code: '',
    },
    database: null,
  },
  states: {
    fetchingQuizSet: {
      entry: [initializeDatabase],
      invoke: {
        id: 'fetchQuizSet',
        src: function ({ database, quizSetKey }) {
          return database
            .ref(`quizSets/${quizSetKey}`)
            .once('value')
            .then((snapshot) => snapshot.val())
        },
        onDone: [
          {
            cond: function (_, e) {
              return e.data?.email
            },
            actions: [
              assign({
                email: (_, e) => e.data.email,
                name: (_, e) => e.data.name,
              }),
            ],
            target: 'sendingCompletionEmail',
          },
          { target: 'success' },
        ],
        onError: { target: 'error' },
      },
    },
    sendingCompletionEmail: {
      invoke: {
        id: 'sendCompletionEmail',
        src: function ({ email, name, relationship }) {
          const PROJECT_EMAIL = 'caretoplay.acp@gmail.com'

          return restRequestRetry('https://api.sendinblue.com/v3/smtp/email', {
            headers: {
              'api-key': process.env.SENDINBLUE_API_KEY,
            },
            body: {
              subject: 'Hi',
              sender: {
                name: 'Jaycelyn from Care To Play',
                email: PROJECT_EMAIL,
              },
              to: [{ email }],
              replyTo: { email: PROJECT_EMAIL },
              htmlContent: `<html><head></head><body><p>Hello, ${name},</p>${relationship} completed your quiz</p></body></html>`,
            },
          })
        },
        onDone: { target: 'success' },
        onError: {
          actions: [assign({ error: { code: '01' } })],
          target: 'error',
        },
      },
    },
    success: { type: 'final' },
    error: { type: 'final' },
  },
})

export default function completeQuizSet(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const { relationship, quizSetKey } = req.body

  return new Promise((resolve) => {
    interpret(
      completeQuizSetMachine.withContext({
        ...completeQuizSetMachine.context,
        relationship,
        quizSetKey,
      })
    )
      .onTransition(({ done, matches, context: { error } }) => {
        if (!done) return

        if (matches('success')) {
          res.status(200).json({ success: true })
        } else {
          res.status(error.status || 500).json({ errorCode: error.code })
        }
        resolve()
      })
      .start()
  })
}
