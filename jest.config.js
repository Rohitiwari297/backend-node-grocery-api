export default {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup/jest.setup.js'],
  transform: {},
  testTimeout: 30000, // gives Mongo enough time to start
};
