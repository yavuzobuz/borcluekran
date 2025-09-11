import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { createClient } from '@/lib/supabase/server'

const prisma = new PrismaClient()

// GET - Get user profile
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get or create user profile
    let profile = await prisma.userProfile.findUnique({
      where: { supabaseUserId: user.id }
    })

    if (!profile) {
      // Create profile if it doesn't exist
      profile = await prisma.userProfile.create({
        data: {
          supabaseUserId: user.id,
          email: user.email || '',
          fullName: user.user_metadata?.full_name || null,
          role: 'user',
          lastLogin: new Date(),
        }
      })
    } else {
      // Update last login
      profile = await prisma.userProfile.update({
        where: { supabaseUserId: user.id },
        data: { lastLogin: new Date() }
      })
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Error in GET /api/user/profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// PUT - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { fullName } = body

    const profile = await prisma.userProfile.update({
      where: { supabaseUserId: user.id },
      data: {
        fullName,
        updatedAt: new Date(),
      }
    })

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Error in PUT /api/user/profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
