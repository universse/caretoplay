module.exports = {
  images: {
    deviceSizes: [375, 425, 640, 768],
  },
  poweredByHeader: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack(config, { dev }) {
    const options = {
      publicPath: '/_next/',
    }

    if (dev) {
      options.name = 'static/[hash]'
    } else {
      config.optimization.moduleIds = 'total-size'

      options.name = 'static/built-[1].[hash:6]'
      options.regExp = '(\\w+).worker.(js|ts)$'
    }

    config.module.rules.push({
      test: /\.worker\.(js|ts)$/,
      use: { loader: 'workerize-loader', options },
    })

    config.output.globalObject = 'self'

    return config
  },
}
