const { google } = require('googleapis')
const { resolve } = require('path')
require('dotenv').config({ path: resolve(process.cwd(), '.env.local') })

const { restRequest } = require('./restRequest')

function createDatabase() {
  const SERVICE_ACCOUNT = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  const DATABASE_URL = process.env.FIREBASE_DATABASE_URL

  const scopes = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/firebase.database',
  ]

  const jwtClient = new google.auth.JWT(
    SERVICE_ACCOUNT.client_email,
    null,
    SERVICE_ACCOUNT.private_key,
    scopes
  )

  const authorizePromise = jwtClient.authorize()

  return async function (path) {
    const accessToken = (await authorizePromise).access_token

    let [basePath, queryString] = path.split('?')
    queryString = queryString ? `${queryString}&` : ''

    return restRequest(
      `${DATABASE_URL}/${basePath}?${queryString}access_token=${accessToken}`
    )
  }
}

module.exports = {
  database: createDatabase(),
}
