import { createMachine, assign, interpret } from 'xstate'
import * as firebase from 'firebase-admin'
import { NextApiRequest, NextApiResponse } from 'next'

import { restRequestRetry } from '../../../nodeUtils/restRequest'

const ErrorMessages = {
  '00': 'Unknown email verification error',
  '01': 'Invalid email address',
  '02': 'Disposable email address',
  '03': 'Invalid domain',
  '10': 'Saving email failed',
  '40': 'Sending confirmation email failed',
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

const subscribeMachine = createMachine({
  id: 'subscribe',
  initial: 'verifyingEmail',
  context: {
    email: '',
    name: '',
    quizSetKey: '',
    error: {
      status: 500,
      code: '',
    },
    database: null,
  },
  states: {
    verifyingEmail: {
      invoke: {
        id: 'verifyEmail',
        src: function (ctx) {
          return restRequestRetry(
            `https://verifier.meetchopra.com/verify/${ctx.email}?token=${process.env.EMAIL_VERIFIER_TOKEN}`
          )
        },
        onDone: [
          { cond: (_, e) => e.data.status, target: 'fetchingQuizSet' },
          {
            actions: [
              assign({
                error: (_, e) => ({
                  code: `0${e.data.error.code}`,
                  status: 400,
                }),
              }),
            ],
            target: 'error',
          },
        ],
        onError: {
          actions: [assign({ error: { code: '00' } })],
          target: 'error',
        },
      },
    },
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
              return e.data
            },
            actions: [
              assign({
                name: (_, e) => e.data.name,
              }),
            ],
            target: 'savingEmailAddress',
          },
          { target: 'success' },
        ],
        onError: { target: 'error' },
      },
    },
    savingEmailAddress: {
      invoke: {
        id: 'saveEmailAddress',
        src: function ({ database, email, quizSetKey }) {
          return database.ref(`quizSets/${quizSetKey}`).update({ email })
        },
        onDone: { target: 'sendingConfirmationEmail' },
        onError: {
          actions: [assign({ error: { code: '10' } })],
          target: 'error',
        },
      },
    },
    sendingConfirmationEmail: {
      invoke: {
        id: 'sendConfirmationEmail',
        src: function ({ email, name }) {
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
              htmlContent: `<html><head></head><body><p>Hello, ${name},</p>Thanks for subscribing</p></body></html>`,
            },
          })
        },
        onDone: { target: 'success' },
        onError: {
          actions: [assign({ error: { code: '40' } })],
          target: 'error',
        },
      },
    },
    success: { type: 'final' },
    error: { type: 'final' },
  },
})

export default function subscribe(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const { email, quizSetKey } = req.body

  return new Promise((resolve) => {
    interpret(
      subscribeMachine.withContext({
        ...subscribeMachine.context,
        email,
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
