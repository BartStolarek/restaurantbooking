import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const walkInSchema = z.object({
  partySize: z.number().min(1).max(20),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || !['STAFF', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { partySize } = walkInSchema.parse(body)

    const now = new Date()

    // Check availability for right now
    const availabilityResponse = await fetch(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/bookings/check-availability`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partySize,
          bookingTime: now.toISOString(),
        }),
      }
    )

    const availability = await availabilityResponse.json()

    return NextResponse.json(availability)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    console.error('Walk-in check error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

