const { resolve } = require('path')
const firebase = require('firebase-admin')
const { nanoid } = require('nanoid')
require('dotenv').config({ path: resolve(__dirname, '../.env.local') })

function generateCode(codeLength = 8) {
  // https://wiki.openmrs.org/display/docs/Check+Digit+Algorithm

  return nanoid(codeLength)
}

function generateVouchers(count = 10000) {
  let generatedCount = 0

  const codesObj = {}

  while (generatedCount < count) {
    const code = generateCode()

    if (!codesObj[code]) {
      codesObj[code] = { code }
      generatedCount++
    }
  }

  return codesObj
}

;(async function main() {
  const vouchers = generateVouchers(5)
  try {
    !firebase.apps.length &&
      firebase.initializeApp({
        credential: firebase.credential.cert(
          JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
        ),
        databaseURL: 'https://caretoplay-dev.firebaseio.com',
      })

    const database = firebase.database()
    await database.ref('vouchers').set(vouchers)

    process.exit(0)
  } catch (e) {
    console.log(e)
    process.exit(1)
  }
})()
