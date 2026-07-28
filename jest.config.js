module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '^react-native$': '<rootDir>/src/__mocks__/react-native.js',
    '^@react-native-async-storage/async-storage$':
      '@react-native-async-storage/async-storage/jest/async-storage-mock',
  },
  collectCoverageFrom: ['src/utils/**/*.ts', '!src/utils/__tests__/**'],
  coverageReporters: ['text', 'lcov', 'json-summary'],
  coverageThreshold: {
    './src/utils/': {
      statements: 90,
      branches: 90,
      functions: 90,
      lines: 90,
    },
  },
};

