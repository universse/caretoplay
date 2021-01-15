const { resolve } = require('path')
const firebase = require('firebase-admin')
const { nanoid } = require('nanoid')
require('dotenv').config({ path: resolve(__dirname, '../.env.local') })
const fs = require('fs')
const sessions = require('./sessions.json')
;(async function main() {
  try {
    // !firebase.apps.length &&
    //   firebase.initializeApp({
    //     credential: firebase.credential.cert(
    //       JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_PROD)
    //     ),
    //     databaseURL: process.env.FIREBASE_DATABASE_URL_PROD,
    //   })

    // const database = firebase.database()
    // const sessions = await database.ref('stats/sessions').get()
    console.log(Object.values(sessions).length)
    console.log(
      Object.values(sessions).filter(({ events }) => {
        return events[0].properties.url === 'https://caretoplay.sg/?ref=Pearlyn'
      }).length
    )
    process.exit(0)
  } catch (e) {
    console.log(e)
    process.exit(1)
  }
})()
