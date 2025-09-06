const config = {
  plugins: [
    "@tailwindcss/postcss",
    // CSS optimization plugins for production
    ...(process.env.NODE_ENV === 'production' ? [
      ['cssnano', {
        preset: ['default', {
          discardComments: { removeAll: true },
          normalizeWhitespace: true,
          mergeLonghand: true,
          mergeIdents: true,
          minifySelectors: true,
          discardDuplicates: true,
        }]
      }],
      ['autoprefixer', {
        flexbox: 'no-2009',
        grid: 'autoplace'
      }]
    ] : [])
  ],
};

export default config;