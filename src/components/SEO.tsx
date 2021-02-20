import Head from 'next/head'

export default function SEO() {
  const url = `https://caretoplay.sg`

  const tags = {
    title: 'Care to Play?',
    description: 'An introduction to Advance Care Planning (ACP)',
    url: `${url}/`,
    imageUrl: `${url}/assets/logo.png`,
    imageAlt: 'Care to Play? logo',
    type: 'website',
    color: '#ffffff',
  }

  return (
    <Head>
      <meta charSet='utf-8' />
      <meta content='IE=edge' httpEquiv='X-UA-Compatible' />
      <meta
        content='width=device-width,initial-scale=1,shrink-to-fit=no'
        name='viewport'
      />
      <link
        href='/assets/favicon/apple-touch-icon-precomposed.png'
        rel='apple-touch-icon-precomposed'
        sizes='180x180'
      />
      {/* <link href='/assets/favicon/apple-touch-icon-57x57-precomposed.png' rel='apple-touch-icon-precomposed' sizes='57x57' />
      <link href='/assets/favicon/apple-touch-icon-60x60-precomposed.png' rel='apple-touch-icon-precomposed' sizes='60x60' />
      <link href='/assets/favicon/apple-touch-icon-72x72-precomposed.png' rel='apple-touch-icon-precomposed' sizes='72x72' />
      <link href='/assets/favicon/apple-touch-icon-76x76-precomposed.png' rel='apple-touch-icon-precomposed' sizes='76x76' />
      <link href='/assets/favicon/apple-touch-icon-114x114-precomposed.png' rel='apple-touch-icon-precomposed' sizes='114x114' />
      <link href='/assets/favicon/apple-touch-icon-120x120-precomposed.png' rel='apple-touch-icon-precomposed' sizes='120x120' />
      <link href='/assets/favicon/apple-touch-icon-144x144-precomposed.png' rel='apple-touch-icon-precomposed' sizes='144x144' />
      <link href='/assets/favicon/apple-touch-icon-152x152-precomposed.png' rel='apple-touch-icon-precomposed' sizes='152x152' />
      <link href='/assets/favicon/apple-touch-icon-180x180-precomposed.png' rel='apple-touch-icon-precomposed' sizes='180x180' />  */}
      <link
        href='/assets/favicon/favicon-16x16.png'
        rel='icon'
        sizes='16x16'
        type='image/png'
      />
      <link
        href='/assets/favicon/favicon-32x32.png'
        rel='icon'
        sizes='32x32'
        type='image/png'
      />
      {/* <link href='/assets/favicon/favicon-96x96.png' rel='icon' sizes='96x96' type='image/png' />
      <link href='/assets/favicon/favicon-128x128.png' rel='icon' sizes='128x128' type='image/png' />
      <link href='/assets/favicon/favicon-196x196.png' rel='icon' sizes='196x196' type='image/png' /> */}

      <link color={tags.color} href='/safari-pinned-tab.svg' rel='mask-icon' />
      <link href='/assets/favicon/favicon.ico' rel='shortcut icon' />

      <link href='/assets/favicon/site.webmanifest' rel='manifest' />
      <meta content={tags.color} name='theme-color' />
      {/* <meta content='black-translucent' name='apple-mobile-web-app-status-bar-style' />
      <meta name='apple-mobile-web-app-title' />
      <meta name='application-name' />
      <meta content='yes' name='mobile-web-app-capable' /> */}

      <meta content={tags.color} name='msapplication-TileColor' />
      <meta
        content='/assets/mstile-144x144.png'
        name='msapplication-TileImage'
      />
      {/* <meta content='/assets/mstile-70x70.png' name='msapplication-square70x70logo' />
      <meta content='/assets/mstile-150x150.png' name='msapplication-square150x150logo' />
      <meta content='/assets/mstile-310x150.png' name='msapplication-wide310x150logo' />
      <meta content='/assets/mstile-310x310.png' name='msapplication-square310x310logo' /> */}
      <meta
        content='/assets/favicon/browserconfig.xml'
        name='msapplication-config'
      />

      <title key='title'>{tags.title}</title>
      <meta key='description' content={tags.description} name='description' />
      <meta key='og_type' content={tags.type} property='og:type' />
      <meta key='og_title' content={tags.title} property='og:title' />
      <meta
        key='og_description'
        content={tags.description}
        property='og:description'
      />
      <meta key='og_URL' content={tags.url} property='og:url' />
      <meta key='og_image' content={tags.imageUrl} property='og:image' />
      <meta key='og_site_name' content={tags.title} property='og:site_name' />
      <meta key='twitter_card' content='summary' name='twitter:card' />
      <meta key='twitter_title' content={tags.title} name='twitter:title' />
      <meta
        key='twitter_description'
        content={tags.description}
        name='twitter:description'
      />
      <meta key='twitter_image' content={tags.imageUrl} name='twitter:image' />
      <meta
        key='twitter_image_alt'
        content={tags.imageAlt}
        name='twitter:image:alt'
      />
      {/* {tags.twitter_site && (
        <meta
          key='twitter_site'
          content={tags.twitter_site}
          name='twitter:site'
        />
      )}
      {tags.twitter_domain && (
        <meta
          key='twitter_domain'
          content={tags.twitter_domain}
          name='twitter:domain'
        />
      )}
      <meta content={`${tags.robots}`} name='robots' /> */}
      <link key='canonical' href={tags.url} rel='canonical' />
    </Head>
  )
}
