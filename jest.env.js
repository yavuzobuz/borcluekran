// Jest environment setup for Docker containers
process.env.NODE_ENV = 'test'
process.env.DATABASE_URL = process.env.DATABASE_URL || 'file:/app/prisma/test/test.db'
process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'test_key'
process.env.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || 'test_secret'
process.env.NEXTAUTH_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000'

// Docker environment detection
if (process.env.DOCKER_ENV) {
  console.log('Running tests in Docker environment')
  // Adjust paths for Docker container
  process.env.WHATSAPP_SESSION_PATH = '/app/.wwebjs_auth'
  process.env.UPLOAD_TEMP_PATH = '/app/temp'
} else {
  console.log('Running tests in local environment')
  // Local development paths
  process.env.WHATSAPP_SESSION_PATH = './.wwebjs_auth'
  process.env.UPLOAD_TEMP_PATH = './temp'
}