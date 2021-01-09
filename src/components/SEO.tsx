import Head from 'next/head'

export default function SEO() {
  const url = `https://${process.env.VERCEL_URL}`

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
        href='/assets/favicon/apple-touch-icon.png'
        rel='apple-touch-icon'
        sizes='180x180'
      />
      <link
        href='/assets/favicon/favicon-32x32.png'
        rel='icon'
        sizes='32x32'
        type='image/png'
      />
      <link
        href='/assets/favicon/favicon-16x16.png'
        rel='icon'
        sizes='16x16'
        type='image/png'
      />
      <link href='/assets/favicon/site.webmanifest' rel='manifest' />
      <link color={tags.color} href='/safari-pinned-tab.svg' rel='mask-icon' />
      <link href='/assets/favicon/favicon.ico' rel='shortcut icon' />
      <meta content={tags.color} name='msapplication-TileColor' />
      <meta content={tags.color} name='theme-color' />
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
