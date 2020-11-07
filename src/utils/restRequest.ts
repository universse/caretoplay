export default async function restRequest(url, options = {}) {
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
