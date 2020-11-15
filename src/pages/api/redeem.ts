import { State, createMachine, assign, interpret } from 'xstate'
import * as firebase from 'firebase-admin'
// import sgMail from '@sendgrid/mail'
import { NextApiRequest, NextApiResponse } from 'next'

import { restRequest } from 'utils/restRequest'

const ErrorMessages = {
  '00': 'Unknown email verification error',
  '01': 'Invalid email address',
  '02': 'Disposable email address',
  '03': 'Invalid domain',
  '10': 'Checking if email was used failed',
  '20': 'Getting random voucher failed',
  '30': 'Redeeming voucher failed',
  '40': 'Sending voucher to email failed',
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

const voucherMachine = createMachine({
  id: 'voucher',
  initial: 'verifyEmail',
  context: {
    VOUCHER_COUNT: 2,
    email: '',
    name: '',
    code: '',
    error: {
      status: 500,
      code: '',
    },
    database: null,
  },
  states: {
    verifyEmail: {
      invoke: {
        id: 'verifyEmail',
        src: function (ctx) {
          return restRequest(
            `https://verifier.meetchopra.com/verify/${ctx.email}?token=${process.env.EMAIL_VERIFIER_TOKEN}`
          )
        },
        onDone: [
          { cond: (_, e) => e.data.status, target: 'checkIfRedeemedWithEmail' },
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
    checkIfRedeemedWithEmail: {
      entry: [initializeDatabase],
      invoke: {
        id: 'checkIfRedeemedWithEmail',
        src: function ({ database, email }) {
          return database
            .ref('vouchers')
            .orderByChild('redeemedBy')
            .equalTo(email)
            .once('value')
        },
        onDone: [
          {
            cond: function (_, e) {
              return !e.data.exists()
            },
            target: 'getRandomVoucher',
          },
          {
            actions: [
              assign({
                code: (_, e) => Object.values(e.data.val())[0].code,
              }),
            ],
            target: 'sendEmail',
          },
        ],
        onError: {
          actions: [assign({ error: { code: '10' } })],
          target: 'error',
        },
      },
    },
    getRandomVoucher: {
      invoke: {
        id: 'getRandomVoucher',
        src: function ({ database, VOUCHER_COUNT }) {
          return database
            .ref('vouchers')
            .orderByChild('redeemedBy')
            .equalTo(null)
            .limitToFirst(VOUCHER_COUNT)
            .once('value')
            .then((availableVouchersSnapshot) => {
              const availableVouchers = Object.values(
                availableVouchersSnapshot.val()
              )
              const randomIndex = Math.floor(Math.random() * VOUCHER_COUNT)

              return availableVouchers[randomIndex]
            })
        },
        onDone: {
          actions: [assign({ code: (_, e) => e.data.code })],
          target: 'redeemVoucher',
        },
        onError: {
          actions: [assign({ error: { code: '20' } })],
          target: 'error',
        },
      },
    },
    redeemVoucher: {
      invoke: {
        id: 'redeemVoucher',
        src: function ({ database, code, email }) {
          return database.ref(`vouchers/${code}`).update({
            redeemedBy: email,
          })
        },
        onDone: { target: 'sendEmail' },
        onError: {
          actions: [assign({ error: { code: '30' } })],
          target: 'error',
        },
      },
    },
    sendEmail: {
      invoke: {
        id: 'sendEmail',
        src: function (ctx) {
          const PROJECT_EMAIL = 'caretoplay.acp@gmail.com'

          return restRequest('https://api.sendinblue.com/v3/smtp/email', {
            headers: {
              'api-key': process.env.SENDINBLUE_API_KEY,
            },
            body: {
              subject: 'Hi',
              sender: {
                name: 'Jaycelyn from Care To Play',
                email: PROJECT_EMAIL,
              },
              to: [{ email: ctx.email }],
              replyTo: { email: PROJECT_EMAIL },
              htmlContent: `<html><head></head><body><p>Hello, ${ctx.name},</p>This is my first transactional email sent from Sendinblue.</p></body></html>`,
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
    sendText: {},
    success: { type: 'final' },
    error: { type: 'final' },
  },
})

export default function redeem(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const ip =
    (req.headers['x-forwarded-for'] || '').split(',').pop().trim() ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress

  return new Promise((resolve) => {
    interpret(
      voucherMachine.withContext({
        ...voucherMachine.context,
        email: req.body.email,
        name: req.body.name,
      })
    )
      .onTransition(({ done, matches, context: { code, error } }) => {
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

// send email https://github.com/sendgrid/sendgrid-nodejs/tree/main/docs/use-cases
// sgMail.setApiKey(process.env.ENDGRID_API_KEY)
// return sgMail.send({
//   to: 'test@example.com',
//   from: 'test@example.com', // Use the email address or domain you verified above
//   replyTo: 'othersender@example.org',
//   subject: 'Sending with Twilio SendGrid is Fun',
//   html: '<strong>and easy to do anywhere, even with Node.js</strong>',
// })
