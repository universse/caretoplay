import { useEffect } from 'react'
import type { AppProps } from 'next/app'
// import { inspect } from '@xstate/inspect'
// import 'styles/index.scss'

import { firebaseApp } from 'utils/firebaseApp'

// if (typeof window === 'object') inspect({ iframe: false })

export default function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  useEffect(() => {
    firebaseApp.snap('visit')
  }, [])

  return <Component {...pageProps} />
}
