module.exports = {
  plugins: [
    'postcss-flexbugs-fixes',
    [
      'postcss-preset-env',
      {
        autoprefixer: {
          flexbox: 'no-2009',
        },
        stage: 3,
        features: {
          'custom-properties': false,
        },
      },
    ],
    [
      'postcss-pxtorem',
      {
        rootValue: 16,
        unitPrecision: 5,
        propList: [
          'border-radius',
          'font',
          'font-size',
          'line-height',
          'letter-spacing',
          'margin*',
          'padding*',
        ],
        selectorBlackList: [],
        replace: true,
        mediaQuery: true,
        minPixelValue: 0,
        exclude: /node_modules/i,
      },
    ],
  ],
}
