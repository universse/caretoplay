// const fetchRetry = require('@vercel/fetch-retry')(global.fetch)

function createRestRequest(fetch = global.fetch) {
  return async function restRequest(url, options = {}) {
    const { headers, body, ...others } = options

    const response = await fetch(url, {
      method: body ? 'POST' : 'GET',
      headers: { 'Content-Type': 'application/json', ...headers },
      ...(body && { body: JSON.stringify(body) }),
      ...others,
    })

    const result = await response.json()

    return response.ok ? result : Promise.reject(result)
  }
}

// async function restRequest(url, options = {}) {
//   const { headers, body, ...others } = options

//   const response = await fetch(url, {
//     method: body ? 'POST' : 'GET',
//     headers: { 'Content-Type': 'application/json', ...headers },
//     ...(body && { body: JSON.stringify(body) }),
//     ...others,
//   })

//   const result = await response.json()

//   return response.ok ? result : Promise.reject(result)
// }

module.exports = {
  restRequest: createRestRequest(),
  restRequestRetry: createRestRequest(
    require('@vercel/fetch-retry')(global.fetch)
  ),
}
