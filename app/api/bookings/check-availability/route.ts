import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { addMinutes, parseISO } from 'date-fns'

const availabilitySchema = z.object({
  partySize: z.number().min(1).max(20),
  bookingTime: z.string(), // ISO datetime string
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { partySize, bookingTime } = availabilitySchema.parse(body)

    const requestedTime = parseISO(bookingTime)

    // Get estimated duration from ML API
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

    // Find tables that can accommodate the party
    const suitableTables = await prisma.table.findMany({
      where: {
        capacity: { gte: partySize },
      },
      orderBy: { capacity: 'asc' }, // Prefer smaller tables first
    })

    if (suitableTables.length === 0) {
      return NextResponse.json({
        available: false,
        error: 'No tables can accommodate this party size',
      })
    }

    // Check each table for availability
    const requestedEndTime = addMinutes(requestedTime, estimatedDuration)

    for (const table of suitableTables) {
      // Get all bookings for this table that might overlap
      const conflictingBookings = await prisma.booking.findMany({
        where: {
          tableId: table.id,
          status: { in: ['PENDING', 'CONFIRMED', 'SEATED'] },
          OR: [
            {
              // Booking starts during requested time
              bookingTime: {
                gte: requestedTime,
                lt: requestedEndTime,
              },
            },
            {
              // Booking ends during requested time
              AND: [
                { bookingTime: { lt: requestedTime } },
                {
                  OR: [
                    // If we have actual end time, use it
                    { actualEndTime: { gt: requestedTime } },
                    // Otherwise check estimated end time
                    {
                      AND: [
                        { actualEndTime: null },
                        {
                          // This is a complex check: bookingTime + estimatedDuration > requestedTime
                          // We'll fetch all and filter in application
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        include: { table: true },
      })

      // Additional check for estimated durations
      const hasConflict = conflictingBookings.some((booking) => {
        const bookingStart = new Date(booking.bookingTime)
        const bookingEnd = booking.actualEndTime
          ? new Date(booking.actualEndTime)
          : addMinutes(bookingStart, booking.estimatedDuration || 120)

        return (
          (requestedTime >= bookingStart && requestedTime < bookingEnd) ||
          (requestedEndTime > bookingStart && requestedEndTime <= bookingEnd) ||
          (requestedTime <= bookingStart && requestedEndTime >= bookingEnd)
        )
      })

      if (!hasConflict) {
        return NextResponse.json({
          available: true,
          table: {
            id: table.id,
            tableNumber: table.tableNumber,
            capacity: table.capacity,
            location: table.location,
          },
          estimatedDuration,
        })
      }
    }

    // No available tables - calculate wait time
    const nextAvailableTime = await calculateNextAvailableTime(
      suitableTables,
      requestedTime,
      estimatedDuration
    )

    return NextResponse.json({
      available: false,
      estimatedWaitMinutes: Math.round(
        (nextAvailableTime.getTime() - requestedTime.getTime()) / 60000
      ),
      nextAvailableTime: nextAvailableTime.toISOString(),
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    console.error('Availability check error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function calculateNextAvailableTime(
  tables: any[],
  requestedTime: Date,
  estimatedDuration: number
): Promise<Date> {
  let earliestAvailableTime = addMinutes(requestedTime, 240) // Default: 4 hours wait

  for (const table of tables) {
    const bookings = await prisma.booking.findMany({
      where: {
        tableId: table.id,
        status: { in: ['PENDING', 'CONFIRMED', 'SEATED'] },
        bookingTime: { gte: requestedTime },
      },
      orderBy: { bookingTime: 'asc' },
    })

    if (bookings.length === 0) {
      return requestedTime // Table is free
    }

    // Find the first booking and estimate when it will be available
    const firstBooking = bookings[0]
    const bookingStart = new Date(firstBooking.bookingTime)
    const bookingEnd = firstBooking.actualEndTime
      ? new Date(firstBooking.actualEndTime)
      : addMinutes(bookingStart, firstBooking.estimatedDuration || 120)

    if (bookingEnd < earliestAvailableTime) {
      earliestAvailableTime = bookingEnd
    }
  }

  return earliestAvailableTime
}

