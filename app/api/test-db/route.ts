import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    console.log('[TEST-DB] DATABASE_URL:', process.env.DATABASE_URL)
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    })

    return NextResponse.json({
      success: true,
      databaseUrl: process.env.DATABASE_URL,
      userCount: users.length,
      users: users,
    })
  } catch (error: any) {
    console.error('[TEST-DB] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        databaseUrl: process.env.DATABASE_URL,
      },
      { status: 500 }
    )
  }
}

