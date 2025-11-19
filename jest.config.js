module.exports = {
  verbose: true,
  collectCoverageFrom: [
    '**/src/**/**/*.js'
  ],
  coverageThreshold: {
    global: {
      statements: 90,
      functions: 90,
      branches: 90,
      lines: 90
    }
  },

  testEnvironment: 'node',

  // Transform JS files with babel-jest so ESM packages can be transpiled
  transform: {
    '^.+\\.[tj]s$': 'babel-jest'
  },

  // Do not ignore these node_modules packages — whitelist packages that ship ESM.
  transformIgnorePatterns: [
    'node_modules/(?!(@faker-js/faker|@mojaloop/ml-testing-toolkit-shared-lib|json-schema-ref-parser|json-schema-faker)/)'
  ]
}
