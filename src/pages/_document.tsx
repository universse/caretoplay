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
