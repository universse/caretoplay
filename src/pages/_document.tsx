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
