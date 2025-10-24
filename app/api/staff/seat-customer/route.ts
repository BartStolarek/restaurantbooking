import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const seatCustomerSchema = z.object({
  partySize: z.number().min(1).max(20),
  tableId: z.string(),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || !['STAFF', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { partySize, tableId, customerName, customerPhone } =
      seatCustomerSchema.parse(body)

    const now = new Date()

    // Get estimated duration
    const dayOfWeek = now.getDay()
    const timeOfDay = now.getHours()

    const durationResponse = await fetch(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/predict-duration`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partySize, dayOfWeek, timeOfDay }),
      }
    )

    const { duration: estimatedDuration } = await durationResponse.json()

    // For walk-ins without a user account, we'll use the staff member's ID
    // or create a guest user (in a real system, you might have a generic "walk-in" user)
    const booking = await prisma.booking.create({
      data: {
        userId: session.user.id, // Using staff ID for walk-ins
        tableId,
        partySize,
        bookingType: 'WALKIN',
        status: 'SEATED',
        bookingTime: now,
        estimatedDuration,
        actualStartTime: now,
      },
      include: {
        table: true,
      },
    })

    // Update table status
    await prisma.table.update({
      where: { id: tableId },
      data: { status: 'OCCUPIED' },
    })

    return NextResponse.json({
      booking,
      message: 'Customer seated successfully',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    console.error('Seat customer error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

