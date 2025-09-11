#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

async function initializeDatabase() {
  const prisma = new PrismaClient()
  
  try {
    // Check if database file exists
    const dbPath = path.join(__dirname, '..', 'prisma', 'dev.db')
    
    if (!fs.existsSync(dbPath)) {
      console.log('🚀 Initializing database...')
      
      // Push schema to database
      const { spawn } = require('child_process')
      
      const pushProcess = spawn('npx', ['prisma', 'db', 'push'], {
        stdio: 'inherit',
        cwd: path.join(__dirname, '..')
      })
      
      await new Promise((resolve, reject) => {
        pushProcess.on('close', (code) => {
          if (code === 0) {
            resolve()
          } else {
            reject(new Error(`Database push failed with code ${code}`))
          }
        })
      })
      
      console.log('✅ Database initialized successfully!')
    } else {
      console.log('📄 Database already exists.')
    }
    
    // Test database connection
    await prisma.$connect()
    console.log('🔌 Database connection successful!')
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  initializeDatabase()
}

module.exports = { initializeDatabase }
