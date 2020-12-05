import type { AppProps } from 'next/app'
// import { inspect } from '@xstate/inspect'
// import 'styles/index.scss'

import { apiClient } from 'utils/apiClient'

if (typeof window === 'object') {
  apiClient.snap('visit')
  // inspect({ iframe: false })
}

export default function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  return <Component {...pageProps} />
}
