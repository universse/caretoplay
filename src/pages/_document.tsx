import Document, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentContext,
} from 'next/document'

const LocalStorage = {
  HAS_SIGNED_IN: 'hasSignedIn',
}

{
  /* <link rel="icon" href="/icons/icon-48x48.png"><link rel="manifest" href="/manifest.webmanifest"><meta name="theme-color" content="#e4234f"><link rel="apple-touch-icon" sizes="48x48" href="/icons/icon-48x48.png"><link rel="apple-touch-icon" sizes="72x72" href="/icons/icon-72x72.png"><link rel="apple-touch-icon" sizes="96x96" href="/icons/icon-96x96.png"><link rel="apple-touch-icon" sizes="144x144" href="/icons/icon-144x144.png"><link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192x192.png"><link rel="apple-touch-icon" sizes="256x256" href="/icons/icon-256x256.png"><link rel="apple-touch-icon" sizes="384x384" href="/icons/icon-384x384.png"><link rel="apple-touch-icon" sizes="512x512" href="/icons/icon-512x512.png"></link> */
}

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps }
  }

  render() {
    return (
      <Html>
        <Head>
          {process.env.NODE_ENV === 'production' && (
            <script
              key='devtools'
              dangerouslySetInnerHTML={{
                __html: `
                  if (typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__ === "object") {
                    for (let [key, value] of Object.entries(window.__REACT_DEVTOOLS_GLOBAL_HOOK__)) {
                      window.__REACT_DEVTOOLS_GLOBAL_HOOK__[key] = typeof value == "function" ? () => {} : null;
                    }
                  }
                `,
              }}
            />
          )}
          <script
            key='auth'
            dangerouslySetInnerHTML={{
              __html: `if(window.localStorage.getItem('${LocalStorage.HAS_SIGNED_IN}')){document.documentElement.classList.add('signed-in')}`,
            }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
