import Router from 'next/router'
import type { AppProps } from 'next/app'
import 'focus-visible'

import { log } from 'utils/analytics'
import SEO from 'components/SEO'
import 'styles/index.scss'

import { apiClient } from 'utils/apiClient'

Router.events.on('routeChangeComplete', (url, { shallow }) => {
  log('view page', { url })
})

if (typeof window === 'object') {
  apiClient.snap('visit')
  const ref = new URLSearchParams(window.location.search).get('ref')

  if (ref) {
    try {
      window.localStorage.setItem('ccttppref', ref)
    } catch {}
  } else {
    try {
      window.localStorage.removeItem('ccttppref')
    } catch {}
  }
  // inspect({ iframe: false })
}

export default function _App({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <>
      <SEO />
      <Component {...pageProps} />
    </>
  )
}
