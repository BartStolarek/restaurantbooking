import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { parseISO } from 'date-fns'

const createBookingSchema = z.object({
  partySize: z.number().min(1).max(20),
  bookingTime: z.string(),
  tableId: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { partySize, bookingTime, tableId } = createBookingSchema.parse(body)

    const requestedTime = parseISO(bookingTime)
    const now = new Date()

    if (requestedTime < now) {
      return NextResponse.json(
        { error: 'Cannot book a table in the past' },
        { status: 400 }
      )
    }

    // Get estimated duration
    const dayOfWeek = requestedTime.getDay()
    const timeOfDay = requestedTime.getHours()

    const durationResponse = await fetch(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/predict-duration`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partySize, dayOfWeek, timeOfDay }),
      }
    )

    const { duration: estimatedDuration } = await durationResponse.json()

    // Check availability if tableId not provided
    let selectedTableId = tableId

    if (!selectedTableId) {
      const availabilityResponse = await fetch(
        `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/bookings/check-availability`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ partySize, bookingTime }),
        }
      )

      const availability = await availabilityResponse.json()

      if (!availability.available) {
        return NextResponse.json(
          { error: 'No tables available at this time', ...availability },
          { status: 400 }
        )
      }

      selectedTableId = availability.table.id
    }

    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        userId: session.user.id,
        tableId: selectedTableId,
        partySize,
        bookingType: 'RESERVATION',
        status: 'CONFIRMED',
        bookingTime: requestedTime,
        estimatedDuration,
      },
      include: {
        table: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    })

    return NextResponse.json({ booking, message: 'Booking created successfully' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    console.error('Create booking error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

