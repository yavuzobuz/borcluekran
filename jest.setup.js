// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Jest globals are automatically available
// No need to import describe, it, expect, beforeEach, afterEach, jest

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to ignore specific console methods in tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
}

// Mock environment variables
process.env.DATABASE_URL = 'file:./test.db'

// Make sure Jest globals are available
global.describe = describe
global.it = it
global.expect = expect
global.beforeEach = beforeEach
global.afterEach = afterEach
global.jest = jest