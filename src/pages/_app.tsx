// import { inspect } from '@xstate/inspect'
import type { AppProps } from 'next/app'
// import 'styles/index.scss'

// if (typeof window === 'object') inspect({ iframe: false })

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
