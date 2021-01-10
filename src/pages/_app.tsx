import Router from 'next/router'
import type { AppProps } from 'next/app'
import 'focus-visible'

import SEO from 'components/SEO'
import 'styles/index.scss'

import { apiClient } from 'utils/apiClient'

Router.events.on('routeChangeComplete', (url, { shallow }) => {
  console.log(url)
})

if (typeof window === 'object') {
  apiClient.snap('visit')
  // inspect({ iframe: false })
}

export default function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <>
      <SEO />
      <Component {...pageProps} />
    </>
  )
}
