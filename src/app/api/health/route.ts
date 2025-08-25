import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Database health check
    await prisma.$queryRaw`SELECT 1`
    
    // WhatsApp service health check (basic)
    const whatsappStatus = {
      service: 'available',
      sessionPath: process.env.WHATSAPP_SESSION_PATH || './.wwebjs_auth'
    }
    
    // System health check
    const systemHealth = {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      nodeVersion: process.version,
      platform: process.platform,
      environment: process.env.NODE_ENV || 'development'
    }
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        whatsapp: whatsappStatus,
        system: systemHealth
      }
    })
  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        services: {
          database: 'disconnected',
          whatsapp: 'unknown',
          system: {
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development'
          }
        }
      },
      { status: 503 }
    )
  }
}