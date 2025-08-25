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

// Mock environment variables for testing
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = process.env.DOCKER_ENV ? 'file:/app/prisma/test/test.db' : 'file:./test.db'
}

// Setup test database cleanup
beforeEach(async () => {
  // Clean up test database before each test if needed
  if (process.env.NODE_ENV === 'test') {
    // Add any test-specific setup here
  }
})

afterEach(async () => {
  // Clean up after each test if needed
  if (process.env.NODE_ENV === 'test') {
    // Add any test-specific cleanup here
  }
})

// Make sure Jest globals are available
global.describe = describe
global.it = it
global.expect = expect
global.beforeEach = beforeEach
global.afterEach = afterEach
global.jest = jest